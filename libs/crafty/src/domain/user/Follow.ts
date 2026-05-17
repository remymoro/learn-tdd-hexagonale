import { UserId } from './UserId'

export class Follow {
  private constructor(
    private readonly follower: UserId,
    private readonly followed: UserId,
  ) {
    if (follower.equals(followed)) {
      throw new Error('A user cannot follow themselves.')
    }
    Object.freeze(this)
  }

  static create(follower: UserId, followed: UserId): Follow {
    return new Follow(follower, followed)
  }

  equals(other: Follow): boolean {
    return this.follower.equals(other.follower) && this.followed.equals(other.followed)
  }

  get followerId(): string { return this.follower.value }
  get followedId(): string { return this.followed.value }
}
