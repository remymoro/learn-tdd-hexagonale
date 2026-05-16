import { describe, expect, it } from 'vitest'
import { FollowUserUseCase } from '@application/user/FollowUserUseCase'
import { InMemoryFollowRepository } from '@infrastructure/InMemoryFollowRepository'
import { UserAlreadyFollowsError } from '@domain/user/UserErrors'

describe('FollowUserUseCase', () => {
  it('should allow a user to follow another user', async () => {
    const followRepository = new InMemoryFollowRepository()
    const useCase = new FollowUserUseCase(followRepository)

    const result = await useCase.execute({
      followerId: 'user-1',
      followedId: 'user-2',
    })

    expect(result.success).toBe(true)
    expect(followRepository.follows).toHaveLength(1)
    expect(followRepository.follows[0]).toEqual(
      expect.objectContaining({
        followerId: 'user-1',
        followedId: 'user-2',
      })
    )
  })

  it('should prevent a user from following themselves', async () => {
    const followRepository = new InMemoryFollowRepository()
    const useCase = new FollowUserUseCase(followRepository)

    await expect(
      useCase.execute({
        followerId: 'user-1',
        followedId: 'user-1',
      })
    ).rejects.toThrow('A user cannot follow themselves.')
  })

  it('should return a UserAlreadyFollowsError when following the same user twice', async () => {
    const followRepository = new InMemoryFollowRepository()
    const useCase = new FollowUserUseCase(followRepository)

    await useCase.execute({
      followerId: 'user-1',
      followedId: 'user-2',
    })

    const result = await useCase.execute({
      followerId: 'user-1',
      followedId: 'user-2',
    })

    expect(result.success).toBe(false)
    expect(result.success === false && result.error).toBeInstanceOf(UserAlreadyFollowsError)
    expect(followRepository.follows).toHaveLength(1)
  })

  it('should reject an empty follower id', async () => {
    const followRepository = new InMemoryFollowRepository()
    const useCase = new FollowUserUseCase(followRepository)

    await expect(
      useCase.execute({
        followerId: '',
        followedId: 'user-2',
      })
    ).rejects.toThrow('User ID is required.')
  })

  it('should reject an empty followed id', async () => {
    const followRepository = new InMemoryFollowRepository()
    const useCase = new FollowUserUseCase(followRepository)

    await expect(
      useCase.execute({
        followerId: 'user-1',
        followedId: '',
      })
    ).rejects.toThrow('User ID is required.')
  })
})
