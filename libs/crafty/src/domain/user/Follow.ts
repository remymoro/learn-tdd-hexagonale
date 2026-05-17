import { UserId } from './UserId'

export class Follow {
  private constructor(
    private readonly follower: UserId,
    private readonly followed: UserId
  ) {
    if (follower.equals(followed)) {
      throw new Error('A user cannot follow themselves.')
    }

    Object.freeze(this)
  }

  public static create(follower: UserId, followed: UserId): Follow {
    return new Follow(follower, followed)
  }

  public static reconstitute(follower: UserId, followed: UserId): Follow {
    return new Follow(follower, followed)
  }

  public equals(other: Follow): boolean {
    return this.follower.equals(other.follower) && this.followed.equals(other.followed)
  }

  public toJSON(): { followerId: string; followedId: string } {
    return {
      followerId: this.follower.toJSON(),
      followedId: this.followed.toJSON(),
    }
  }

  get followerId(): string { return this.follower.value }
  get followedId(): string { return this.followed.value }
}
