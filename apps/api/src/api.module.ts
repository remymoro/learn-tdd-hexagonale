import { Module } from '@nestjs/common';
import { CraftyModule, TimelinePresenter } from '@crafty/crafty';
import { PrismaTweetRepository } from '@crafty/crafty/infrastructure/PrismaTweetRepository';
import { PrismaFollowRepository } from '@crafty/crafty/infrastructure/PrismaFollowRepository';
import { SystemClockProvider } from '@crafty/crafty/shared/Clock';
import { ApiController } from './api.controller';
import { DefaultTimelinePresenter } from './timeline.presenter';

@Module({
  imports: [
    CraftyModule.register({
      TweetRepository: PrismaTweetRepository,
      FollowRepository: PrismaFollowRepository,
      Clock: SystemClockProvider,
    }),
  ],
  controllers: [ApiController],
  providers: [
    { provide: TimelinePresenter, useClass: DefaultTimelinePresenter },
  ],
})
export class ApiModule {}
