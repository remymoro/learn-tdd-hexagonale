import { Tweet } from '@domain/tweet/Tweet'
import { UserId } from '@domain/user/UserId'
import { FollowRepository } from '@application/ports/FollowRepository'
import { TweetRepository } from '@application/ports/TweetRepository'

type ViewWallQuery = {
  userId: string
}

export class ViewWallUseCase {
  constructor(
    private readonly tweetRepository: TweetRepository,
    private readonly followRepository: FollowRepository
  ) {}

  async execute(query: ViewWallQuery): Promise<Tweet[]> {
    const userId = new UserId(query.userId)
    const followedUserIds = await this.followRepository.findFollowedUserIds(userId)

    if (followedUserIds.length === 0) {
      return []
    }

    const followedIds = followedUserIds.map(followedUserId => followedUserId.value)
    const tweets = await this.tweetRepository.getAllTweets()

    return tweets.filter(tweet => followedIds.includes(tweet.authorId))
  }
}
