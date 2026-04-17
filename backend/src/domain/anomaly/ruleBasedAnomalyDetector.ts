import { Severity } from "@prisma/client";
import type { NormalizedHealthRecordInput } from "../parsers/types.js";
import type { AnomalyEvaluation, Thresholds } from "./types.js";

export class RuleBasedAnomalyDetector {
  evaluate(record: NormalizedHealthRecordInput, thresholds: Thresholds): AnomalyEvaluation {
    if (record.spO2 <= thresholds.criticalSpO2 || record.heartRate >= thresholds.criticalHeartRate) {
      return {
        isAnomaly: true,
        severity: Severity.CRITICAL,
        message: "Critical vital threshold breached"
      };
    }

    if (record.spO2 < thresholds.minSpO2 || record.heartRate > thresholds.maxRestingHeartRate) {
      return {
        isAnomaly: true,
        severity: Severity.HIGH,
        message: "High-risk vital abnormality detected"
      };
    }

    if (record.hrv !== null && record.hrv < 20) {
      return {
        isAnomaly: true,
        severity: Severity.LOW,
        message: "Low HRV detected"
      };
    }

    return { isAnomaly: false };
  }
}
