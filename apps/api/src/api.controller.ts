import {
  Body,
  ConflictException,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  GoneException,
  HttpCode,
  Inject,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { PublishTweetUseCase } from '@crafty/crafty/application/tweet/publish/PublishTweetUseCase';
import { ViewTimelineUseCase } from '@crafty/crafty/application/tweet/timeline/ViewTimelineUseCase';
import { UpdateTweetUseCase } from '@crafty/crafty/application/tweet/update/UpdateTweetUseCase';
import { DeleteTweetUseCase } from '@crafty/crafty/application/tweet/delete/DeleteTweetUseCase';
import { FollowUserUseCase } from '@crafty/crafty/application/user/FollowUserUseCase';
import { ViewWallUseCase } from '@crafty/crafty/application/tweet/wall/ViewWallUseCase';
import { TimelinePresenter } from '@crafty/crafty/application/TimelinePresenter';
import { TweetAlreadyDeletedError, TweetNotFoundError, UnauthorizedError } from '@crafty/crafty/domain/tweet/TweetErrors';
import { UserAlreadyFollowsError } from '@crafty/crafty/domain/user/UserErrors';

@Controller()
export class ApiController {
  constructor(
    @Inject(PublishTweetUseCase) private readonly publishTweetUseCase: PublishTweetUseCase,
    @Inject(ViewTimelineUseCase) private readonly viewTimelineUseCase: ViewTimelineUseCase,
    @Inject(UpdateTweetUseCase) private readonly updateTweetUseCase: UpdateTweetUseCase,
    @Inject(DeleteTweetUseCase) private readonly deleteTweetUseCase: DeleteTweetUseCase,
    @Inject(FollowUserUseCase) private readonly followUserUseCase: FollowUserUseCase,
    @Inject(ViewWallUseCase) private readonly viewWallUseCase: ViewWallUseCase,
    @Inject(TimelinePresenter) private readonly timelinePresenter: TimelinePresenter,
  ) {}

  @Post('tweets')
  @HttpCode(201)
  async publishTweet(@Body() body: { message: string; authorId: string }) {
    return this.publishTweetUseCase.execute(body);
  }

  @Get('tweets')
  async viewTimeline(@Query('authorId') authorId?: string) {
    const tweets = await this.viewTimelineUseCase.execute({ authorId });
    return this.timelinePresenter.present(tweets);
  }

  @Put('tweets/:id')
  @HttpCode(204)
  async updateTweet(
    @Param('id') id: string,
    @Body() body: { message: string; authorId: string },
  ) {
    const result = await this.updateTweetUseCase.execute({ id, ...body });
    if (!result.success) {
      if (result.error instanceof TweetNotFoundError) throw new NotFoundException(result.error.message);
      if (result.error instanceof UnauthorizedError)  throw new ForbiddenException(result.error.message);
    }
  }

  @Delete('tweets/:id')
  @HttpCode(204)
  async deleteTweet(
    @Param('id') id: string,
    @Body() body: { authorId: string },
  ) {
    const result = await this.deleteTweetUseCase.execute({ id, authorId: body.authorId });
    if (!result.success) {
      if (result.error instanceof TweetNotFoundError)       throw new NotFoundException(result.error.message);
      if (result.error instanceof TweetAlreadyDeletedError) throw new GoneException(result.error.message);
      if (result.error instanceof UnauthorizedError)        throw new ForbiddenException(result.error.message);
    }
  }

  @Post('follows')
  @HttpCode(201)
  async followUser(@Body() body: { followerId: string; followedId: string }) {
    const result = await this.followUserUseCase.execute(body);
    if (!result.success) {
      if (result.error instanceof UserAlreadyFollowsError) throw new ConflictException(result.error.message);
    }
  }

  @Get('wall/:userId')
  async viewWall(@Param('userId') userId: string) {
    return this.viewWallUseCase.execute({ userId });
  }
}
