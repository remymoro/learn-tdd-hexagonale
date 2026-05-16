import { TweetDto } from '@application/tweet/TweetDto'

export class TweetApiPresenter {
  static toResponse(tweet: TweetDto): TweetDto {
    return { id: tweet.id, content: tweet.content, authorId: tweet.authorId }
  }

  static toListResponse(tweets: TweetDto[]): TweetDto[] {
    return tweets.map(tweet => TweetApiPresenter.toResponse(tweet))
  }
}
