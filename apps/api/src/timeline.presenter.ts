import { Injectable } from '@nestjs/common';
import { TimelinePresenter } from '@crafty/crafty/application/TimelinePresenter';
import { ViewTimelineResponse } from '@crafty/crafty/application/tweet/timeline/ViewTimelineResponse';

type TimelineApiResponse = {
  tweets: ViewTimelineResponse[];
};

@Injectable()
export class DefaultTimelinePresenter extends TimelinePresenter {
  present(timeline: ViewTimelineResponse[]): TimelineApiResponse {
    return {
      tweets: timeline.map(tweet => ({
        id: tweet.id,
        content: tweet.content,
        authorId: tweet.authorId,
      })),
    };
  }
}
