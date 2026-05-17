export class AuthorId {
  public readonly value: string

  constructor(value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error('Author ID is required.')
    }

    this.value = value
    Object.freeze(this)
  }

  public static fromJSON(value: string): AuthorId {
    return new AuthorId(value)
  }

  public equals(other: AuthorId): boolean {
    return this.value === other.value
  }

  public toString(): string {
    return this.value
  }

  public toJSON(): string {
    return this.value
  }
}
