import { Tweet } from '@domain/tweet/Tweet'
import { Message } from '@domain/tweet/Message'
import { AuthorId } from '@domain/tweet/AuthorId'
import { TweetRepository } from '@application/ports/TweetRepository'
import { PublishTweetResponse } from './PublishTweetResponse'

type PublishTweetCommand = {
  message: string
  authorId: string
}

export class PublishTweetUseCase {
  constructor(private tweetRepository: TweetRepository) {}

  async execute(command: PublishTweetCommand): Promise<PublishTweetResponse> {
    const tweet = Tweet.create(
      new Message(command.message),
      new AuthorId(command.authorId),
    )
    await this.tweetRepository.save(tweet)

    return {
      id: tweet.id,
      content: tweet.content,
      authorId: tweet.authorId,
    }
  }
}
