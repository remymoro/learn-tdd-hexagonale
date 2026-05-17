import { TweetRepository } from '@application/ports/TweetRepository'
import { ViewTimelineResponse } from './ViewTimelineResponse'

type ViewTimelineQuery = {
  authorId?: string
}

export class ViewTimelineUseCase {
  constructor(private readonly tweetRepository: TweetRepository) {}

  async execute(query?: ViewTimelineQuery): Promise<ViewTimelineResponse[]> {
    const tweets = query?.authorId
      ? await this.tweetRepository.findPublishedTweetsByAuthor(query.authorId)
      : await this.tweetRepository.getAllTweets()

    return tweets.map(tweet => ({
      id: tweet.id,
      content: tweet.content,
      authorId: tweet.authorId,
    }))
  }
}
