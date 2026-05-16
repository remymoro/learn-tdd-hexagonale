import { Tweet } from '@domain/tweet/Tweet';
import { TweetRepository } from '@application/ports/TweetRepository';

type PublishTweetCommand = {
  message: string;
  authorId: string;
};

export class PublishTweetUseCase {
  constructor(private tweetRepository: TweetRepository) { }

  async execute(command: PublishTweetCommand): Promise<void> {
    const tweet = new Tweet(command.message, command.authorId);
    await this.tweetRepository.save(tweet);
  }
}
