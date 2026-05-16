import { PublishTweetResponse } from '@application/tweet/publish/PublishTweetResponse'
import { ViewTimelineResponse } from '@application/tweet/timeline/ViewTimelineResponse'
import { ViewWallResponse } from '@application/tweet/wall/ViewWallResponse'

type TweetApiResponse = PublishTweetResponse | ViewTimelineResponse | ViewWallResponse

export class TweetApiPresenter {
  static toResponse<T extends TweetApiResponse>(tweet: T): T {
    return { ...tweet }
  }

  static toListResponse<T extends ViewTimelineResponse | ViewWallResponse>(tweets: T[]): T[] {
    return tweets.map(tweet => TweetApiPresenter.toResponse(tweet))
  }
}
