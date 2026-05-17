import { TweetRepository } from '@application/ports/TweetRepository'
import { TweetAlreadyDeletedError, TweetNotFoundError, UnauthorizedError } from '@domain/tweet/TweetErrors'
import { Result, ok, err } from '@shared/Result'
import { Clock, SystemClock } from '@shared/Clock'

type DeleteTweetCommand = {
  id: string
  authorId: string
}

export class DeleteTweetUseCase {
  constructor(
    private tweetRepository: TweetRepository,
    private clock: Clock = SystemClock,
  ) {}

  async execute(command: DeleteTweetCommand): Promise<Result<void, TweetNotFoundError | TweetAlreadyDeletedError | UnauthorizedError>> {
    const tweet = await this.tweetRepository.findById(command.id)
    if (!tweet) return err(new TweetNotFoundError())

    if (tweet.authorId !== command.authorId) return err(new UnauthorizedError())

    if (tweet.isDeleted) return err(new TweetAlreadyDeletedError())

    await this.tweetRepository.update(tweet.markAsDeleted(this.clock.now()))
    return ok(undefined)
  }
}
