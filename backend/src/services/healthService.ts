import type { Role } from "@prisma/client";
import { AnomalySubject } from "../domain/anomaly/anomalySubject.js";
import { RuleBasedAnomalyDetector } from "../domain/anomaly/ruleBasedAnomalyDetector.js";
import { ParserFactory } from "../domain/parsers/parserFactory.js";
import type { UploadPayload } from "../domain/parsers/types.js";
import { ClinicianAssignmentRepository } from "../repositories/clinicianAssignmentRepository.js";
import { DeviceRepository } from "../repositories/deviceRepository.js";
import { HealthLogRepository } from "../repositories/healthLogRepository.js";
import { ThresholdRepository } from "../repositories/thresholdRepository.js";
import { HttpError } from "../utils/httpError.js";
import { AlertAnomalyObserver } from "./alertAnomalyObserver.js";

export class HealthService {
  private readonly parserFactory: ParserFactory;
  private readonly anomalyDetector: RuleBasedAnomalyDetector;
  private readonly anomalySubject: AnomalySubject;

  constructor(
    private readonly deviceRepository = new DeviceRepository(),
    private readonly healthLogRepository = new HealthLogRepository(),
    private readonly thresholdRepository = new ThresholdRepository(),
    private readonly assignmentRepository = new ClinicianAssignmentRepository()
  ) {
    this.parserFactory = new ParserFactory();
    this.anomalyDetector = new RuleBasedAnomalyDetector();
    this.anomalySubject = new AnomalySubject();
    this.anomalySubject.register(new AlertAnomalyObserver());
  }

  async ingest(userId: string, payload: UploadPayload) {
    const existingDevice = await this.deviceRepository.findBySerial(payload.serialNumber);

    if (existingDevice && existingDevice.userId !== userId) {
      throw new HttpError(409, "Device serial already linked to another user");
    }

    if (!existingDevice) {
      await this.deviceRepository.create(userId, payload.deviceType, payload.serialNumber);
    }

    const parsedRecords = this.parserFactory.parse(payload.deviceType, payload.format, payload);
    const thresholds = await this.thresholdRepository.getCurrent();

    let savedCount = 0;
    let anomalyCount = 0;
    let discardedCount = 0;

    for (const record of parsedRecords) {
      if (!this.isRecordValid(record.heartRate, record.spO2)) {
        discardedCount += 1;
        continue;
      }

      const evaluation = this.anomalyDetector.evaluate(record, thresholds);
      const log = await this.healthLogRepository.create({
        userId,
        timestamp: record.timestamp,
        heartRate: record.heartRate,
        spO2: record.spO2,
        hrv: record.hrv,
        isAnomaly: evaluation.isAnomaly,
        sourceDeviceType: payload.deviceType
      });

      savedCount += 1;

      if (evaluation.isAnomaly && evaluation.severity && evaluation.message) {
        anomalyCount += 1;
        await this.anomalySubject.notify({
          userId,
          logId: log.id,
          severity: evaluation.severity,
          message: evaluation.message
        });
      }
    }

    return {
      totalReceived: parsedRecords.length,
      savedCount,
      anomalyCount,
      discardedCount
    };
  }

  listMyHistory(userId: string) {
    return this.healthLogRepository.listByUser(userId);
  }

  aggregateMyTrends(userId: string) {
    return this.healthLogRepository.aggregateByDay(userId);
  }

  async listPatientHistory(requesterId: string, requesterRole: Role, patientId: string) {
    if (requesterRole === "ADMIN") {
      return this.healthLogRepository.listByUser(patientId);
    }

    if (requesterRole === "CLINICIAN") {
      const isAssigned = await this.assignmentRepository.isAssigned(requesterId, patientId);
      if (!isAssigned) {
        throw new HttpError(403, "Clinician is not assigned to this patient");
      }
      return this.healthLogRepository.listByUser(patientId);
    }

    if (requesterId !== patientId) {
      throw new HttpError(403, "Cannot view another user's records");
    }

    return this.healthLogRepository.listByUser(patientId);
  }

  private isRecordValid(heartRate: number, spO2: number): boolean {
    return heartRate >= 25 && heartRate <= 240 && spO2 >= 50 && spO2 <= 100;
  }
}
