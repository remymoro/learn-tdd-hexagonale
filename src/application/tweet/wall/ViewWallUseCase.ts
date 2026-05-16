import { UserId } from '@domain/user/UserId'
import { FollowRepository } from '@application/ports/FollowRepository'
import { TweetRepository } from '@application/ports/TweetRepository'
import { ViewWallResponse } from './ViewWallResponse'

type ViewWallQuery = {
  userId: string
}

export class ViewWallUseCase {
  constructor(
    private readonly tweetRepository: TweetRepository,
    private readonly followRepository: FollowRepository
  ) {}

  async execute(query: ViewWallQuery): Promise<ViewWallResponse[]> {
    const userId = new UserId(query.userId)
    const followedUserIds = await this.followRepository.findFollowedUserIds(userId)

    if (followedUserIds.length === 0) {
      return []
    }

    const followedIds = followedUserIds.map(followedUserId => followedUserId.value)
    const tweets = await this.tweetRepository.getAllTweets()

    return tweets
      .filter(tweet => followedIds.includes(tweet.authorId))
      .map(tweet => ({
        id: tweet.getTweetId(),
        content: tweet.getMessage(),
        authorId: tweet.getAuthorId(),
      }))
  }
}
