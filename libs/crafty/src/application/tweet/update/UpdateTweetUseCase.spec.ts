import { describe, expect, it } from 'vitest'
import { UpdateTweetUseCase } from './UpdateTweetUseCase'
import { Tweet } from '@domain/tweet/Tweet'
import { Message } from '@domain/tweet/Message'
import { AuthorId } from '@domain/tweet/AuthorId'
import { TweetRepository } from '@application/ports/TweetRepository'
import { TweetNotFoundError, UnauthorizedError } from '@domain/tweet/TweetErrors'

class FakeTweetRepository implements TweetRepository {
  public updatedTweet: Tweet | null = null

  constructor(private tweet: Tweet | null) {}

  async save(tweet: Tweet): Promise<void> { this.tweet = tweet }

  async update(tweet: Tweet): Promise<void> {
    this.updatedTweet = tweet
    this.tweet = tweet
  }

  async findById(): Promise<Tweet | null> { return this.tweet }
  async findPublishedTweetsByAuthor(_authorId: string): Promise<Tweet[]> { return [] }
  async findPublishedTweetsByAuthors(_authorIds: string[]): Promise<Tweet[]> { return [] }
  async getAllTweets(): Promise<Tweet[]> { return this.tweet ? [this.tweet] : [] }
}

describe('UpdateTweetUseCase', () => {
  it('met à jour le contenu quand l\'auteur est propriétaire', async () => {
    const tweet = Tweet.create(new Message('Ancien tweet'), new AuthorId('user-123'))
    const repository = new FakeTweetRepository(tweet)
    const useCase = new UpdateTweetUseCase(repository)

    const result = await useCase.execute({ id: tweet.id, message: 'Nouveau tweet', authorId: 'user-123' })

    expect(result.success).toBe(true)
    expect(repository.updatedTweet?.content).toBe('Nouveau tweet')
    expect(repository.updatedTweet?.authorId).toBe('user-123')
  })

  it('retourne TweetNotFoundError si le tweet n\'existe pas', async () => {
    const repository = new FakeTweetRepository(null)
    const useCase = new UpdateTweetUseCase(repository)

    const result = await useCase.execute({ id: 'inexistant', message: 'Nouveau tweet', authorId: 'user-123' })

    expect(result.success).toBe(false)
    expect(result.success === false && result.error).toBeInstanceOf(TweetNotFoundError)
  })

  it('retourne UnauthorizedError si l\'auteur n\'est pas propriétaire', async () => {
    const tweet = Tweet.create(new Message('Ancien tweet'), new AuthorId('user-123'))
    const repository = new FakeTweetRepository(tweet)
    const useCase = new UpdateTweetUseCase(repository)

    const result = await useCase.execute({ id: tweet.id, message: 'Nouveau tweet', authorId: 'user-456' })

    expect(result.success).toBe(false)
    expect(result.success === false && result.error).toBeInstanceOf(UnauthorizedError)
  })
})
