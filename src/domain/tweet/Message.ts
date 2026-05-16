export class Message {
  public readonly value: string

  constructor(value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error('A tweet must have at least one character.')
    }

    if (value.length > 280) {
      throw new Error('A tweet cannot exceed 280 characters.')
    }

    this.value = value
    Object.freeze(this)
  }

  public static fromJSON(value: string): Message {
    return new Message(value)
  }

  public equals(other: Message): boolean {
    return this.value === other.value
  }

  public toString(): string {
    return this.value
  }

  public toJSON(): string {
    return this.value
  }
}
