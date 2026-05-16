import { Tweet } from '@domain/tweet/Tweet';
import { TweetRepository } from '@application/ports/TweetRepository';

export class InMemoryTweetRepository implements TweetRepository {
  public tweets: Tweet[] = [];

  async save(tweet: Tweet): Promise<void> {
    this.tweets.push(tweet);
  }

  async update(tweet: Tweet): Promise<void> {
    const index = this.tweets.findIndex(t => t.id === tweet.id);

    if (index !== -1) {
      this.tweets[index] = tweet;
    }
  }

  async findById(id: string): Promise<Tweet | null> {
    return this.tweets.find(t => t.id === id) || null;
  }

  async getAllTweets(): Promise<Tweet[]> {
    return this.tweets;
  }
}
