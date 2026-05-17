import { Message } from '@domain/tweet/Message'
import { TweetRepository } from '@application/ports/TweetRepository'
import { TweetNotFoundError, UnauthorizedError } from '@domain/tweet/TweetErrors'
import { Result, ok, err } from '@shared/Result'

type UpdateTweetCommand = {
  id: string
  message: string
  authorId: string
}

export class UpdateTweetUseCase {
  constructor(private tweetRepository: TweetRepository) {}

  async execute(command: UpdateTweetCommand): Promise<Result<void, TweetNotFoundError | UnauthorizedError>> {
    const tweet = await this.tweetRepository.findById(command.id)
    if (!tweet) return err(new TweetNotFoundError())

    if (tweet.authorId !== command.authorId) return err(new UnauthorizedError())

    await this.tweetRepository.update(tweet.withContent(new Message(command.message)))
    return ok(undefined)
  }
}
