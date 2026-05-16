import { Tweet } from '@domain/tweet/Tweet'

export interface TweetRepository {
  save(tweet: Tweet): Promise<void>
  update(tweet: Tweet): Promise<void>
  findById(id: string): Promise<Tweet | null>
  findPublishedTweetsByAuthor(authorId: string): Promise<Tweet[]>
  findPublishedTweetsByAuthors(authorIds: string[]): Promise<Tweet[]>
  getAllTweets(): Promise<Tweet[]>
}
