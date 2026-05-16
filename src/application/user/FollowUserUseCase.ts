import { Follow } from '@domain/user/Follow'
import { UserId } from '@domain/user/UserId'
import { FollowRepository } from '@application/ports/FollowRepository'

type FollowUserCommand = {
  followerId: string
  followedId: string
}

export class FollowUserUseCase {
  constructor(private readonly followRepository: FollowRepository) {}

  async execute(command: FollowUserCommand): Promise<void> {
    const followerId = new UserId(command.followerId)
    const followedId = new UserId(command.followedId)
    const follow = Follow.create(followerId, followedId)

    const alreadyFollowing = await this.followRepository.exists(followerId, followedId)
    if (alreadyFollowing) {
      throw new Error('User already follows this user.')
    }

    await this.followRepository.save(follow)
  }
}
