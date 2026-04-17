import type { Role } from "@prisma/client";
import { AlertRepository } from "../repositories/alertRepository.js";
import { ClinicianAssignmentRepository } from "../repositories/clinicianAssignmentRepository.js";
import { HttpError } from "../utils/httpError.js";

export class AlertService {
  constructor(
    private readonly alertRepository = new AlertRepository(),
    private readonly assignmentRepository = new ClinicianAssignmentRepository()
  ) {}

  listMyAlerts(userId: string) {
    return this.alertRepository.listByUser(userId);
  }

  async listPatientAlerts(requesterId: string, requesterRole: Role, patientId: string) {
    if (requesterRole === "ADMIN") {
      return this.alertRepository.listByUser(patientId);
    }

    if (requesterRole === "CLINICIAN") {
      const isAssigned = await this.assignmentRepository.isAssigned(requesterId, patientId);
      if (!isAssigned) {
        throw new HttpError(403, "Clinician is not assigned to this patient");
      }

      return this.alertRepository.listByUser(patientId);
    }

    if (requesterId !== patientId) {
      throw new HttpError(403, "Cannot view another user's alerts");
    }

    return this.alertRepository.listByUser(patientId);
  }

  async resolveAlert(requesterId: string, requesterRole: Role, alertId: string) {
    const alert = await this.alertRepository.findById(alertId);

    if (!alert) {
      throw new HttpError(404, "Alert not found");
    }

    if (requesterRole === "ADMIN") {
      return this.alertRepository.resolve(alertId);
    }

    if (requesterRole === "CLINICIAN") {
      const isAssigned = await this.assignmentRepository.isAssigned(requesterId, alert.userId);
      if (!isAssigned) {
        throw new HttpError(403, "Cannot resolve alerts for unassigned patients");
      }
      return this.alertRepository.resolve(alertId);
    }

    throw new HttpError(403, "Only clinician/admin can resolve alerts");
  }
}
