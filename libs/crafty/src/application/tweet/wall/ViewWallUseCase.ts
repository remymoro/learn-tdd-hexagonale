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
    private readonly followRepository: FollowRepository,
  ) {}

  async execute(query: ViewWallQuery): Promise<ViewWallResponse[]> {
    const userId = new UserId(query.userId)
    const followedUserIds = await this.followRepository.findFollowedUserIds(userId)

    if (followedUserIds.length === 0) return []

    const tweets = await this.tweetRepository.findPublishedTweetsByAuthors(
      followedUserIds.map(id => id.value),
    )

    return tweets.map(tweet => ({
      id: tweet.id,
      content: tweet.content,
      authorId: tweet.authorId,
    }))
  }
}
