import { Clock } from '@application/ports/Clock'

export const SystemClock: Clock = {
  now: () => new Date(),
}

export class SystemClockProvider implements Clock {
  now(): Date {
    return new Date()
  }
}
