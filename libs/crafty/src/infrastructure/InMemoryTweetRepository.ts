import { Tweet } from '@domain/tweet/Tweet';
import { TweetRepository } from '@application/ports/TweetRepository';

export class InMemoryTweetRepository implements TweetRepository {
  private store: Map<string, Tweet> = new Map();

  // getter pour la compatibilité des tests : ne retourne que les tweets actifs
  get tweets(): Tweet[] {
    return Array.from(this.store.values()).filter(t => !t.isDeleted);
  }

  async save(tweet: Tweet): Promise<void> {
    this.store.set(tweet.id, tweet);
  }

  async update(tweet: Tweet): Promise<void> {
    if (this.store.has(tweet.id)) {
      this.store.set(tweet.id, tweet);
    }
  }

  async findById(id: string): Promise<Tweet | null> {
    return this.store.get(id) ?? null;
  }

  async findPublishedTweetsByAuthor(authorId: string): Promise<Tweet[]> {
    return this.tweets.filter(t => t.authorId === authorId);
  }

  async findPublishedTweetsByAuthors(authorIds: string[]): Promise<Tweet[]> {
    return this.tweets.filter(t => authorIds.includes(t.authorId));
  }

  async getAllTweets(): Promise<Tweet[]> {
    return this.tweets;
  }
}
