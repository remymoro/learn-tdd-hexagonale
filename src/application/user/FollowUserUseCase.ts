import { Follow } from '@domain/user/Follow'
import { UserId } from '@domain/user/UserId'
import { UserAlreadyFollowsError } from '@domain/user/UserErrors'
import { FollowRepository } from '@application/ports/FollowRepository'
import { Result, ok, err } from '@shared/Result'

type FollowUserCommand = {
  followerId: string
  followedId: string
}

export class FollowUserUseCase {
  constructor(private readonly followRepository: FollowRepository) {}

  async execute(command: FollowUserCommand): Promise<Result<void, UserAlreadyFollowsError>> {
    const followerId = new UserId(command.followerId)
    const followedId = new UserId(command.followedId)
    const follow = Follow.create(followerId, followedId)

    const alreadyFollowing = await this.followRepository.exists(followerId, followedId)
    if (alreadyFollowing) {
      return err(new UserAlreadyFollowsError())
    }

    await this.followRepository.save(follow)
    return ok(undefined)
  }
}
