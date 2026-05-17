import { Module } from '@nestjs/common';
import { CraftyModule } from './crafty.module';
import { TimelinePresenter } from '@application/TimelinePresenter';
import { PrismaTweetRepository } from '@infrastructure/PrismaTweetRepository';
import { PrismaFollowRepository } from '@infrastructure/PrismaFollowRepository';
import { SystemClockProvider } from '@infrastructure/SystemClock';
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
