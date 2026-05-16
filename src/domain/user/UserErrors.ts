export class UserAlreadyFollowsError extends Error {
  constructor() {
    super('User already follows this user.')
    this.name = 'UserAlreadyFollowsError'
  }
}
