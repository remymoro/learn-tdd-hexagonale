import { ViewTimelineResponse } from './tweet/timeline/ViewTimelineResponse';

export abstract class TimelinePresenter {
  abstract present(timeline: ViewTimelineResponse[]): unknown;
}
