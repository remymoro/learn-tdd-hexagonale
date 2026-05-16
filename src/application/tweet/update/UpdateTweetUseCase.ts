import { Tweet } from '@domain/tweet/Tweet';
import { TweetRepository } from '@application/ports/TweetRepository';

type UpdateTweetCommand = {
    id: string;
    message: string;
    authorId: string;
};

export class UpdateTweetUseCase {
    constructor(private tweetRepository: TweetRepository) { }

    async execute(command: UpdateTweetCommand): Promise<void> {
        const tweet = await this.tweetRepository.findById(command.id);
        if (!tweet) {
            throw new Error('Tweet not found');
        }

        if (tweet.getAuthorId() !== command.authorId) {
            throw new Error('Unauthorized');
        }

        const updatedTweet = tweet.withContent(command.message);
        await this.tweetRepository.update(updatedTweet);
    }
}
