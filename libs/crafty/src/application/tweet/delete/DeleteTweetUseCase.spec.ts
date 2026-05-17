import { describe, expect, it } from 'vitest'
import { DeleteTweetUseCase } from './DeleteTweetUseCase'
import { Tweet } from '@domain/tweet/Tweet'
import { Message } from '@domain/tweet/Message'
import { AuthorId } from '@domain/tweet/AuthorId'
import { TweetRepository } from '@application/ports/TweetRepository'
import { TweetAlreadyDeletedError, TweetNotFoundError, UnauthorizedError } from '@domain/tweet/TweetErrors'
import { Clock } from '@application/ports/Clock'

const fixedDate = new Date('2026-05-16T17:00:00.000Z')
const fakeClock: Clock = { now: () => fixedDate }

class FakeTweetRepository implements TweetRepository {
  public updatedTweet: Tweet | null = null

  constructor(private tweet: Tweet | null) {}

  async save(_tweet: Tweet): Promise<void> {}

  async update(tweet: Tweet): Promise<void> {
    this.updatedTweet = tweet
    this.tweet = tweet
  }

  async findById(): Promise<Tweet | null> { return this.tweet }
  async findPublishedTweetsByAuthor(_authorId: string): Promise<Tweet[]> { return [] }
  async findPublishedTweetsByAuthors(_authorIds: string[]): Promise<Tweet[]> { return [] }
  async getAllTweets(): Promise<Tweet[]> {
    return this.tweet && !this.tweet.isDeleted ? [this.tweet] : []
  }
}

describe('DeleteTweetUseCase', () => {
  it('supprime le tweet quand l\'auteur est propriétaire', async () => {
    const tweet = Tweet.create(new Message('Mon tweet'), new AuthorId('user-123'))
    const repository = new FakeTweetRepository(tweet)
    const useCase = new DeleteTweetUseCase(repository, fakeClock)

    const result = await useCase.execute({ id: tweet.id, authorId: 'user-123' })

    expect(result.success).toBe(true)
    expect(repository.updatedTweet?.isDeleted).toBe(true)
    expect(repository.updatedTweet?.deletedAt).toEqual(fixedDate)
  })

  it('retourne TweetNotFoundError si le tweet n\'existe pas', async () => {
    const repository = new FakeTweetRepository(null)
    const useCase = new DeleteTweetUseCase(repository, fakeClock)

    const result = await useCase.execute({ id: 'inexistant', authorId: 'user-123' })

    expect(result.success).toBe(false)
    expect(result.success === false && result.error).toBeInstanceOf(TweetNotFoundError)
  })

  it('retourne UnauthorizedError si l\'auteur n\'est pas propriétaire', async () => {
    const tweet = Tweet.create(new Message('Mon tweet'), new AuthorId('user-123'))
    const repository = new FakeTweetRepository(tweet)
    const useCase = new DeleteTweetUseCase(repository, fakeClock)

    const result = await useCase.execute({ id: tweet.id, authorId: 'user-456' })

    expect(result.success).toBe(false)
    expect(result.success === false && result.error).toBeInstanceOf(UnauthorizedError)
  })

  it('retourne TweetAlreadyDeletedError si le tweet est déjà supprimé', async () => {
    const tweet = Tweet.create(new Message('Mon tweet'), new AuthorId('user-123'))
    const deletedTweet = tweet.markAsDeleted(fixedDate)
    const repository = new FakeTweetRepository(deletedTweet)
    const useCase = new DeleteTweetUseCase(repository, fakeClock)

    const result = await useCase.execute({ id: tweet.id, authorId: 'user-123' })

    expect(result.success).toBe(false)
    expect(result.success === false && result.error).toBeInstanceOf(TweetAlreadyDeletedError)
  })

  it('retourne UnauthorizedError (pas TweetAlreadyDeletedError) quand non propriétaire d\'un tweet supprimé', async () => {
    const tweet = Tweet.create(new Message('Mon tweet'), new AuthorId('user-123'))
    const deletedTweet = tweet.markAsDeleted(fixedDate)
    const repository = new FakeTweetRepository(deletedTweet)
    const useCase = new DeleteTweetUseCase(repository, fakeClock)

    const result = await useCase.execute({ id: tweet.id, authorId: 'user-456' })

    expect(result.success).toBe(false)
    expect(result.success === false && result.error).toBeInstanceOf(UnauthorizedError)
  })
})
