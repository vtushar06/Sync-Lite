import { Role } from "@prisma/client";
import { ClinicianAssignmentRepository } from "../repositories/clinicianAssignmentRepository.js";
import { ThresholdRepository } from "../repositories/thresholdRepository.js";
import { UserRepository } from "../repositories/userRepository.js";
import { HttpError } from "../utils/httpError.js";

interface ThresholdInput {
  maxRestingHeartRate: number;
  minSpO2: number;
  criticalHeartRate: number;
  criticalSpO2: number;
}

export class AdminService {
  constructor(
    private readonly thresholdRepository = new ThresholdRepository(),
    private readonly userRepository = new UserRepository(),
    private readonly assignmentRepository = new ClinicianAssignmentRepository()
  ) {}

  getThresholds() {
    return this.thresholdRepository.getCurrent();
  }

  updateThresholds(payload: ThresholdInput) {
    return this.thresholdRepository.update(payload);
  }

  async assignClinician(clinicianId: string, patientId: string) {
    const [clinician, patient] = await Promise.all([
      this.userRepository.findById(clinicianId),
      this.userRepository.findById(patientId)
    ]);

    if (!clinician || clinician.role !== Role.CLINICIAN) {
      throw new HttpError(404, "Clinician not found");
    }

    if (!patient || patient.role !== Role.PATIENT) {
      throw new HttpError(404, "Patient not found");
    }

    return this.assignmentRepository.assign(clinicianId, patientId);
  }

  listUsersByRole(role: Role) {
    return this.userRepository.listByRole(role);
  }
}
