import { randomUUID } from 'crypto'

export class TweetId {
    public readonly value: string

    constructor(value: string) {
        if (!TweetId.isValid(value)) {
            throw new Error('TweetId must be a valid UUID')
        }
        this.value = value
        Object.freeze(this)
    }

    public static generate(): TweetId {
        return new TweetId(randomUUID())
    }

    public static fromJSON(value: string): TweetId {
        return new TweetId(value)
    }

    private static isValid(value: string): boolean {
        const uuidRegex =
            /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
        return uuidRegex.test(value)
    }

    public equals(other: TweetId): boolean {
        return this.value === other.value;
    }

    public toString(): string {
        return this.value
    }

    public toJSON(): string {
        return this.value
    }
}
