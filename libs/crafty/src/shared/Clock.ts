export interface Clock {
  now(): Date
}

// Pour les tests et l'instanciation manuelle
export const SystemClock: Clock = {
  now: () => new Date(),
}

// Pour l'injection NestJS (useClass)
export class SystemClockProvider implements Clock {
  now(): Date {
    return new Date()
  }
}
