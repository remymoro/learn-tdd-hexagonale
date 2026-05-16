import { AuthorId } from './AuthorId'
import { Message } from './Message'
import { TweetId } from './TweetId'

export class Tweet {
  constructor(
    message: string | Message,
    author: string | AuthorId,
    tweetId: string | TweetId = TweetId.generate()
  ) {
    this.message = message instanceof Message ? message : new Message(message)
    this.author = author instanceof AuthorId ? author : new AuthorId(author)
    this.tweetId = tweetId instanceof TweetId ? tweetId : new TweetId(tweetId)
    Object.freeze(this)
  }

  private readonly tweetId: TweetId
  private readonly message: Message
  private readonly author: AuthorId

  // Création d'un nouveau Tweet
  static create(
    message: Message,
    author: AuthorId,
    tweetId: TweetId
  ): Tweet {
    return new Tweet(message, author, tweetId)
  }

  // Reconstruction depuis la persistence
  static reconstitute(
    tweetId: TweetId,
    message: Message,
    author: AuthorId
  ): Tweet {
    return new Tweet(message, author, tweetId)
  }

  withContent(message: string | Message): Tweet {
    return new Tweet(message, this.author, this.tweetId)
  }

  getMessage(): string {
    return this.message.value
  }

  getAuthorId(): string {
    return this.author.value
  }

  getTweetId(): string {
    return this.tweetId.value
  }

  equals(other: Tweet): boolean {
    return this.tweetId.equals(other.tweetId)
  }

  toJSON() {
    return {
      id: this.tweetId.toJSON(),
      content: this.message.toJSON(),
      authorId: this.author.toJSON()
    }
  }

  get id(): string { return this.getTweetId() }
  get content(): string { return this.getMessage() }
  get authorId(): string { return this.getAuthorId() }
}
