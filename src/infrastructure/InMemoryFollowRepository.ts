import { Follow } from '@domain/user/Follow'
import { UserId } from '@domain/user/UserId'
import { FollowRepository } from '@application/ports/FollowRepository'

export class InMemoryFollowRepository implements FollowRepository {
  public follows: Follow[] = []

  async save(follow: Follow): Promise<void> {
    this.follows.push(follow)
  }

  async exists(followerId: UserId, followedId: UserId): Promise<boolean> {
    return this.follows.some(
      follow =>
        follow.followerId === followerId.value &&
        follow.followedId === followedId.value
    )
  }

  async findFollowedUserIds(followerId: UserId): Promise<UserId[]> {
    return this.follows
      .filter(follow => follow.followerId === followerId.value)
      .map(follow => new UserId(follow.followedId))
  }
}
