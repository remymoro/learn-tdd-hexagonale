import { ClassProvider, DynamicModule, Module } from '@nestjs/common';
import { TweetRepository } from '@application/ports/TweetRepository';
import { FollowRepository } from '@application/ports/FollowRepository';
import { Clock } from '@application/ports/Clock';
import { PublishTweetUseCase } from '@application/tweet/publish/PublishTweetUseCase';
import { ViewTimelineUseCase } from '@application/tweet/timeline/ViewTimelineUseCase';
import { UpdateTweetUseCase } from '@application/tweet/update/UpdateTweetUseCase';
import { DeleteTweetUseCase } from '@application/tweet/delete/DeleteTweetUseCase';
import { FollowUserUseCase } from '@application/user/FollowUserUseCase';
import { ViewWallUseCase } from '@application/tweet/wall/ViewWallUseCase';
import { CLOCK, FOLLOW_REPOSITORY, TWEET_REPOSITORY } from './crafty.tokens';

@Module({})
export class CraftyModule {
  static register(providers: {
    TweetRepository: ClassProvider<TweetRepository>['useClass'];
    FollowRepository: ClassProvider<FollowRepository>['useClass'];
    Clock: ClassProvider<Clock>['useClass'];
  }): DynamicModule {
    return {
      module: CraftyModule,
      providers: [
        { provide: TWEET_REPOSITORY, useClass: providers.TweetRepository },
        { provide: FOLLOW_REPOSITORY, useClass: providers.FollowRepository },
        { provide: CLOCK, useClass: providers.Clock },
        {
          provide: PublishTweetUseCase,
          useFactory: (repo: TweetRepository) => new PublishTweetUseCase(repo),
          inject: [TWEET_REPOSITORY],
        },
        {
          provide: ViewTimelineUseCase,
          useFactory: (repo: TweetRepository) => new ViewTimelineUseCase(repo),
          inject: [TWEET_REPOSITORY],
        },
        {
          provide: UpdateTweetUseCase,
          useFactory: (repo: TweetRepository) => new UpdateTweetUseCase(repo),
          inject: [TWEET_REPOSITORY],
        },
        {
          provide: DeleteTweetUseCase,
          useFactory: (repo: TweetRepository, clock: Clock) =>
            new DeleteTweetUseCase(repo, clock),
          inject: [TWEET_REPOSITORY, CLOCK],
        },
        {
          provide: FollowUserUseCase,
          useFactory: (repo: FollowRepository) => new FollowUserUseCase(repo),
          inject: [FOLLOW_REPOSITORY],
        },
        {
          provide: ViewWallUseCase,
          useFactory: (tweetRepo: TweetRepository, followRepo: FollowRepository) =>
            new ViewWallUseCase(tweetRepo, followRepo),
          inject: [TWEET_REPOSITORY, FOLLOW_REPOSITORY],
        },
      ],
      exports: [
        PublishTweetUseCase,
        ViewTimelineUseCase,
        UpdateTweetUseCase,
        DeleteTweetUseCase,
        FollowUserUseCase,
        ViewWallUseCase,
      ],
    };
  }
}
