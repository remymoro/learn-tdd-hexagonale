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

export class TweetAlreadyDeletedError extends Error {
  constructor() {
    super('Tweet already deleted')
    this.name = 'TweetAlreadyDeletedError'
  }
}
