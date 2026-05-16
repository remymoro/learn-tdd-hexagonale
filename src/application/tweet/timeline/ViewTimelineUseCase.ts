import { TweetRepository } from '@application/ports/TweetRepository'
import { ViewTimelineResponse } from './ViewTimelineResponse'

type ViewTimelineQuery = {
  authorId?: string
}

export class ViewTimelineUseCase {
  constructor(private readonly tweetRepository: TweetRepository) {}

  async execute(query?: ViewTimelineQuery): Promise<ViewTimelineResponse[]> {
    const tweets = await this.tweetRepository.getAllTweets()

    const filtered = query?.authorId
      ? tweets.filter(tweet => tweet.authorId === query.authorId)
      : tweets

    return filtered.map(tweet => ({
      id: tweet.getTweetId(),
      content: tweet.getMessage(),
      authorId: tweet.getAuthorId(),
    }))
  }
}
