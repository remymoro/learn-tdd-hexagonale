import { Follow } from '@domain/user/Follow'
import { UserId } from '@domain/user/UserId'

export interface FollowRepository {
  save(follow: Follow): Promise<void>
  exists(followerId: UserId, followedId: UserId): Promise<boolean>
  findFollowedUserIds(followerId: UserId): Promise<UserId[]>
}
