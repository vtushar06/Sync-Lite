import { prisma } from "../lib/prisma.js";

interface ThresholdUpdateInput {
  maxRestingHeartRate: number;
  minSpO2: number;
  criticalHeartRate: number;
  criticalSpO2: number;
}

export class ThresholdRepository {
  async getCurrent() {
    const existing = await prisma.thresholdConfig.findUnique({ where: { id: "default" } });

    if (existing) {
      return existing;
    }

    return prisma.thresholdConfig.create({
      data: { id: "default" }
    });
  }

  update(data: ThresholdUpdateInput) {
    return prisma.thresholdConfig.upsert({
      where: { id: "default" },
      update: data,
      create: {
        id: "default",
        ...data
      }
    });
  }
}
