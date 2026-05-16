export class UserId {
  public readonly value: string

  constructor(value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error('User ID is required.')
    }

    this.value = value
    Object.freeze(this)
  }

  public static fromJSON(value: string): UserId {
    return new UserId(value)
  }

  public equals(other: UserId): boolean {
    return this.value === other.value
  }

  public toString(): string {
    return this.value
  }

  public toJSON(): string {
    return this.value
  }
}
