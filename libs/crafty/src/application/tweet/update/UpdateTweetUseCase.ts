import { TweetRepository } from '@application/ports/TweetRepository';
import { TweetNotFoundError, UnauthorizedError } from '@domain/tweet/TweetErrors';
import { Result, ok, err } from '@shared/Result';

type UpdateTweetCommand = {
    id: string;
    message: string;
    authorId: string;
};

export class UpdateTweetUseCase {
    constructor(private tweetRepository: TweetRepository) { }

    async execute(command: UpdateTweetCommand): Promise<Result<void, TweetNotFoundError | UnauthorizedError>> {
        const tweet = await this.tweetRepository.findById(command.id);
        if (!tweet) {
            return err(new TweetNotFoundError());
        }

        if (tweet.getAuthorId() !== command.authorId) {
            return err(new UnauthorizedError());
        }

        const updatedTweet = tweet.withContent(command.message);
        await this.tweetRepository.update(updatedTweet);
        return ok(undefined);
    }
}
