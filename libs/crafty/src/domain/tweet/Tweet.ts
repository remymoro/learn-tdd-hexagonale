import { AuthorId } from './AuthorId'
import { Message } from './Message'
import { TweetId } from './TweetId'

export class Tweet {
  private constructor(
    private readonly tweetId: TweetId,
    private readonly message: Message,
    private readonly author: AuthorId,
    private readonly _deletedAt: Date | null,
  ) {
    Object.freeze(this)
  }

  static create(message: Message, author: AuthorId): Tweet {
    return new Tweet(TweetId.generate(), message, author, null)
  }

  static reconstitute(tweetId: TweetId, message: Message, author: AuthorId, deletedAt: Date | null = null): Tweet {
    return new Tweet(tweetId, message, author, deletedAt)
  }

  withContent(message: Message): Tweet {
    return new Tweet(this.tweetId, message, this.author, this._deletedAt)
  }

  markAsDeleted(at: Date): Tweet {
    return new Tweet(this.tweetId, this.message, this.author, at)
  }

  equals(other: Tweet): boolean {
    return this.tweetId.equals(other.tweetId)
  }

  get id(): string { return this.tweetId.value }
  get content(): string { return this.message.value }
  get authorId(): string { return this.author.value }
  get deletedAt(): Date | null { return this._deletedAt }
  get isDeleted(): boolean { return this._deletedAt !== null }
}
