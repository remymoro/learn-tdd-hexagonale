import { Tweet } from '@domain/tweet/Tweet'
import { TweetRepository } from '@application/ports/TweetRepository'
import { PublishTweetResponse } from './PublishTweetResponse'

type PublishTweetCommand = {
  message: string
  authorId: string
}

export class PublishTweetUseCase {
  constructor(private tweetRepository: TweetRepository) {}

  async execute(command: PublishTweetCommand): Promise<PublishTweetResponse> {
    const tweet = new Tweet(command.message, command.authorId)
    await this.tweetRepository.save(tweet)

    return {
      id: tweet.getTweetId(),
      content: tweet.getMessage(),
      authorId: tweet.getAuthorId(),
    }
  }
}
