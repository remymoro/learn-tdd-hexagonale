import { Tweet } from '@domain/tweet/Tweet'

export interface TweetRepository {
  save(tweet: Tweet): Promise<void>
  update(tweet: Tweet): Promise<void>
  findById(id: string): Promise<Tweet | null>
  getAllTweets(): Promise<Tweet[]>
}
