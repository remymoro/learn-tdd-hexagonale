import { Tweet } from '@domain/tweet/Tweet'
import { Message } from '@domain/tweet/Message'
import { AuthorId } from '@domain/tweet/AuthorId'

export class TweetBuilder {
  private content: string = 'Ceci est un tweet par défaut très intéressant'
  private authorId: string = 'default-user-123'

  withContent(content: string): TweetBuilder {
    this.content = content
    return this
  }

  withAuthorId(authorId: string): TweetBuilder {
    this.authorId = authorId
    return this
  }

  build(): Tweet {
    return Tweet.create(new Message(this.content), new AuthorId(this.authorId))
  }
}

export const aTweet = () => new TweetBuilder()
