export class TweetNotFoundError extends Error {
  constructor() {
    super('Tweet not found')
    this.name = 'TweetNotFoundError'
  }
}

export class UnauthorizedError extends Error {
  constructor() {
    super('Unauthorized')
    this.name = 'UnauthorizedError'
  }
}
