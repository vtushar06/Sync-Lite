import type { Severity } from "@prisma/client";

export interface Thresholds {
  maxRestingHeartRate: number;
  minSpO2: number;
  criticalHeartRate: number;
  criticalSpO2: number;
}

export interface AnomalyEvaluation {
  isAnomaly: boolean;
  severity?: Severity;
  message?: string;
}

export interface AnomalyEvent {
  userId: string;
  logId: string;
  severity: Severity;
  message: string;
}

export interface AnomalyObserver {
  onAnomaly(event: AnomalyEvent): Promise<void>;
}
