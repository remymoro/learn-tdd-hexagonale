import { describe, expect, it } from 'vitest'
import { DeleteTweetUseCase } from './DeleteTweetUseCase'
import { Tweet } from '@domain/tweet/Tweet'
import { TweetRepository } from '@application/ports/TweetRepository'
import { TweetAlreadyDeletedError, TweetNotFoundError, UnauthorizedError } from '@domain/tweet/TweetErrors'
import { Clock } from '@shared/Clock'

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

  async findById(): Promise<Tweet | null> {
    return this.tweet
  }

  async findPublishedTweetsByAuthor(_authorId: string): Promise<Tweet[]> { return [] }
  async findPublishedTweetsByAuthors(_authorIds: string[]): Promise<Tweet[]> { return [] }

  async getAllTweets(): Promise<Tweet[]> {
    return this.tweet && !this.tweet.isDeleted ? [this.tweet] : []
  }
}

describe('DeleteTweetUseCase', () => {
  it('should delete a tweet when the author is the owner', async () => {
    const tweet = new Tweet('Mon tweet', 'user-123')
    const repository = new FakeTweetRepository(tweet)
    const useCase = new DeleteTweetUseCase(repository, fakeClock)

    const result = await useCase.execute({ id: tweet.id, authorId: 'user-123' })

    expect(result.success).toBe(true)
    expect(repository.updatedTweet?.isDeleted).toBe(true)
    expect(repository.updatedTweet?.getDeletedAt()).toEqual(fixedDate)
  })

  it('should return TweetNotFoundError when tweet does not exist', async () => {
    const repository = new FakeTweetRepository(null)
    const useCase = new DeleteTweetUseCase(repository, fakeClock)

    const result = await useCase.execute({ id: 'unknown-id', authorId: 'user-123' })

    expect(result.success).toBe(false)
    expect(result.success === false && result.error).toBeInstanceOf(TweetNotFoundError)
  })

  it('should return TweetAlreadyDeletedError when tweet is already deleted', async () => {
    const tweet = new Tweet('Mon tweet', 'user-123')
    const deletedTweet = tweet.markAsDeleted(fixedDate)
    const repository = new FakeTweetRepository(deletedTweet)
    const useCase = new DeleteTweetUseCase(repository, fakeClock)

    const result = await useCase.execute({ id: tweet.id, authorId: 'user-123' })

    expect(result.success).toBe(false)
    expect(result.success === false && result.error).toBeInstanceOf(TweetAlreadyDeletedError)
  })

  it('should return UnauthorizedError when author is not the owner', async () => {
    const tweet = new Tweet('Mon tweet', 'user-123')
    const repository = new FakeTweetRepository(tweet)
    const useCase = new DeleteTweetUseCase(repository, fakeClock)

    const result = await useCase.execute({ id: tweet.id, authorId: 'user-456' })

    expect(result.success).toBe(false)
    expect(result.success === false && result.error).toBeInstanceOf(UnauthorizedError)
  })
})
