import { Tweet } from '@domain/tweet/Tweet';

export class TweetBuilder {
  private content: string = 'Ceci est un tweet par défaut très intéressant';
  private authorId: string = 'default-user-123';

  public withContent(content: string): TweetBuilder {
    this.content = content;
    return this;
  }

  public withAuthorId(authorId: string): TweetBuilder {
    this.authorId = authorId;
    return this;
  }

  public build(): Tweet {
    return new Tweet(this.content, this.authorId);
  }
}

export const aTweet = () => new TweetBuilder();
