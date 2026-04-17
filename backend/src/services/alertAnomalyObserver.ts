import type { AnomalyEvent, AnomalyObserver } from "../domain/anomaly/types.js";
import { AlertRepository } from "../repositories/alertRepository.js";

export class AlertAnomalyObserver implements AnomalyObserver {
  constructor(private readonly alertRepository = new AlertRepository()) {}

  async onAnomaly(event: AnomalyEvent): Promise<void> {
    await this.alertRepository.create(event.userId, event.logId, event.severity, event.message);
  }
}
