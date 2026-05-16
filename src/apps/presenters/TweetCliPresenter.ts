import { TweetDto } from '@application/tweet/TweetDto'

export class TweetCliPresenter {
  static formatList(tweets: TweetDto[]): string {
    if (tweets.length === 0) return 'Aucun tweet à afficher.'
    return tweets
      .map((tweet, index) => `[${index + 1}] ${tweet.id} @${tweet.authorId}: ${tweet.content}`)
      .join('\n')
  }

  static formatCreated(tweet: TweetDto): string {
    return `✅ Tweet publié : [${tweet.id}] @${tweet.authorId}: ${tweet.content}`
  }

  static formatUpdated(): string {
    return '✅ Tweet mis à jour avec succès !'
  }

  static formatError(message: string): string {
    return `❌ ${message}`
  }
}
