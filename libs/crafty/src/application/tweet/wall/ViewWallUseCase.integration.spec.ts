import { describe, expect, it } from 'vitest'
import { PublishTweetUseCase } from '@application/tweet/publish/PublishTweetUseCase'
import { FollowUserUseCase } from '@application/user/FollowUserUseCase'
import { ViewWallUseCase } from './ViewWallUseCase'
import { InMemoryFollowRepository } from '@tests/InMemoryFollowRepository'
import { InMemoryTweetRepository } from '@tests/InMemoryTweetRepository'

describe('ViewWallUseCase integration', () => {
  it('should display tweets published by followed users', async () => {
    // Arrange
    const tweetRepository = new InMemoryTweetRepository()
    const followRepository = new InMemoryFollowRepository()
    const publishTweetUseCase = new PublishTweetUseCase(tweetRepository)
    const followUserUseCase = new FollowUserUseCase(followRepository)
    const viewWallUseCase = new ViewWallUseCase(tweetRepository, followRepository)

    await followUserUseCase.execute({
      followerId: 'user-1',
      followedId: 'user-2',
    })
    await followUserUseCase.execute({
      followerId: 'user-1',
      followedId: 'user-3',
    })

    await publishTweetUseCase.execute({
      message: 'Tweet publié par user-1',
      authorId: 'user-1',
    })
    await publishTweetUseCase.execute({
      message: 'Tweet publié par user-2',
      authorId: 'user-2',
    })
    await publishTweetUseCase.execute({
      message: 'Tweet publié par user-3',
      authorId: 'user-3',
    })
    await publishTweetUseCase.execute({
      message: 'Tweet publié par user-4',
      authorId: 'user-4',
    })

    // Act
    const wall = await viewWallUseCase.execute({ userId: 'user-1' })

    // Assert
    expect(wall).toHaveLength(2)
    expect(wall).toEqual([
      expect.objectContaining({
        content: 'Tweet publié par user-2',
        authorId: 'user-2',
      }),
      expect.objectContaining({
        content: 'Tweet publié par user-3',
        authorId: 'user-3',
      }),
    ])
  })
})
