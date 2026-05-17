import { Injectable } from '@nestjs/common';
import { ViewTimelineResponse } from './tweet/timeline/ViewTimelineResponse';

@Injectable()
export abstract class TimelinePresenter {
  abstract present(timeline: ViewTimelineResponse[]): unknown;
}
