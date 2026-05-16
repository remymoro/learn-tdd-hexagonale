import { Tweet } from '@domain/tweet/Tweet';
import { TweetRepository } from '@application/ports/TweetRepository';

type ViewTimelineQuery = {
  authorId?: string;
};

export class ViewTimelineUseCase {
  constructor(private readonly tweetRepository: TweetRepository) {}

  async execute(query?: ViewTimelineQuery): Promise<Tweet[]> {
    const tweets = await this.tweetRepository.getAllTweets();
    
    if (query?.authorId) {
      return tweets.filter(tweet => tweet.authorId === query.authorId);
    }

    return tweets;
  }
}
