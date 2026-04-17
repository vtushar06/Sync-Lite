import { prisma } from "../lib/prisma.js";

export class ClinicianAssignmentRepository {
  assign(clinicianId: string, patientId: string) {
    return prisma.clinicianAssignment.upsert({
      where: {
        clinicianId_patientId: {
          clinicianId,
          patientId
        }
      },
      update: {},
      create: {
        clinicianId,
        patientId
      }
    });
  }

  async isAssigned(clinicianId: string, patientId: string): Promise<boolean> {
    const assignment = await prisma.clinicianAssignment.findUnique({
      where: {
        clinicianId_patientId: {
          clinicianId,
          patientId
        }
      }
    });

    return Boolean(assignment);
  }

  async listPatientIds(clinicianId: string): Promise<string[]> {
    const assignments = await prisma.clinicianAssignment.findMany({
      where: { clinicianId },
      select: { patientId: true }
    });

    return assignments.map((entry) => entry.patientId);
  }
}
