import type { AnomalyEvent, AnomalyObserver } from "./types.js";

export class AnomalySubject {
  private observers: AnomalyObserver[] = [];

  register(observer: AnomalyObserver): void {
    this.observers.push(observer);
  }

  async notify(event: AnomalyEvent): Promise<void> {
    await Promise.all(this.observers.map((observer) => observer.onAnomaly(event)));
  }
}
