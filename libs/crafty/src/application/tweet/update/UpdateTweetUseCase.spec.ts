import { describe, expect, it } from 'vitest'
import { UpdateTweetUseCase } from './UpdateTweetUseCase'
import { Tweet } from '@domain/tweet/Tweet'
import { TweetRepository } from '@application/ports/TweetRepository'
import { TweetNotFoundError, UnauthorizedError } from '@domain/tweet/TweetErrors'

class FakeTweetRepository implements TweetRepository {
  public updatedTweet: Tweet | null = null

  constructor(private tweet: Tweet | null) {}

  async save(tweet: Tweet): Promise<void> {
    this.tweet = tweet
  }

  async update(tweet: Tweet): Promise<void> {
    this.updatedTweet = tweet
    this.tweet = tweet
  }

  async findById(): Promise<Tweet | null> {
    return this.tweet
  }

  async findPublishedTweetsByAuthor(_authorId: string): Promise<Tweet[]> { return [] }
  async findPublishedTweetsByAuthors(_authorIds: string[]): Promise<Tweet[]> { return [] }

  async getAllTweets(): Promise<Tweet[]> {
    return this.tweet ? [this.tweet] : []
  }
}

describe('UpdateTweetUseCase', () => {
  it('should update a tweet message when author is the owner', async () => {
    const repository = new FakeTweetRepository(
      new Tweet('Ancien tweet', 'user-123')
    )
    const useCase = new UpdateTweetUseCase(repository)

    const result = await useCase.execute({
      id: 'tweet-123',
      message: 'Nouveau tweet',
      authorId: 'user-123',
    })

    expect(result.success).toBe(true)
    expect(repository.updatedTweet?.content).toBe('Nouveau tweet')
    expect(repository.updatedTweet?.authorId).toBe('user-123')
  })

  it('should return a TweetNotFoundError when tweet does not exist', async () => {
    const repository = new FakeTweetRepository(null)
    const useCase = new UpdateTweetUseCase(repository)

    const result = await useCase.execute({
      id: 'tweet-123',
      message: 'Nouveau tweet',
      authorId: 'user-123',
    })

    expect(result.success).toBe(false)
    expect(result.success === false && result.error).toBeInstanceOf(TweetNotFoundError)
  })

  it('should return an UnauthorizedError when author is not the owner', async () => {
    const repository = new FakeTweetRepository(
      new Tweet('Ancien tweet', 'user-123')
    )
    const useCase = new UpdateTweetUseCase(repository)

    const result = await useCase.execute({
      id: 'tweet-123',
      message: 'Nouveau tweet',
      authorId: 'user-456',
    })

    expect(result.success).toBe(false)
    expect(result.success === false && result.error).toBeInstanceOf(UnauthorizedError)
  })
})
