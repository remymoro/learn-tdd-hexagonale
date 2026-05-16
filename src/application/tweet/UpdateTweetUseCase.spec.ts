import { describe, expect, it } from 'vitest'
import { UpdateTweetUseCase } from '@application/tweet/UpdateTweetUseCase'
import { Tweet } from '@domain/tweet/Tweet'
import { TweetRepository } from '@application/ports/TweetRepository'

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

    await useCase.execute({
      id: 'tweet-123',
      message: 'Nouveau tweet',
      authorId: 'user-123',
    })

    expect(repository.updatedTweet?.content).toBe('Nouveau tweet')
    expect(repository.updatedTweet?.authorId).toBe('user-123')
  })

  it('should throw when tweet does not exist', async () => {
    const repository = new FakeTweetRepository(null)
    const useCase = new UpdateTweetUseCase(repository)

    await expect(
      useCase.execute({
        id: 'tweet-123',
        message: 'Nouveau tweet',
        authorId: 'user-123',
      })
    ).rejects.toThrow('Tweet not found')
  })

  it('should throw when author is not the owner', async () => {
    const repository = new FakeTweetRepository(
      new Tweet('Ancien tweet', 'user-123')
    )
    const useCase = new UpdateTweetUseCase(repository)

    await expect(
      useCase.execute({
        id: 'tweet-123',
        message: 'Nouveau tweet',
        authorId: 'user-456',
      })
    ).rejects.toThrow('Unauthorized')
  })
})
