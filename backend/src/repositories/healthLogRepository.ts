import type { DeviceType, HealthLog } from "@prisma/client";
import { prisma } from "../lib/prisma.js";

interface CreateHealthLogInput {
  userId: string;
  timestamp: Date;
  heartRate: number;
  spO2: number;
  hrv: number | null;
  isAnomaly: boolean;
  sourceDeviceType: DeviceType;
}

export class HealthLogRepository {
  create(data: CreateHealthLogInput): Promise<HealthLog> {
    return prisma.healthLog.create({ data });
  }

  listByUser(userId: string, take = 100): Promise<HealthLog[]> {
    return prisma.healthLog.findMany({
      where: { userId },
      orderBy: { timestamp: "desc" },
      take
    });
  }

  listByUsers(userIds: string[], take = 200): Promise<HealthLog[]> {
    return prisma.healthLog.findMany({
      where: { userId: { in: userIds } },
      orderBy: { timestamp: "desc" },
      take
    });
  }

  async aggregateByDay(userId: string): Promise<Array<{ date: string; avgHr: number; avgSpO2: number }>> {
    const records = await prisma.healthLog.findMany({
      where: { userId },
      orderBy: { timestamp: "desc" },
      take: 500
    });

    const daily = new Map<string, { hrSum: number; spo2Sum: number; count: number }>();

    for (const record of records) {
      const date = record.timestamp.toISOString().slice(0, 10);
      const existing = daily.get(date);

      if (existing) {
        existing.hrSum += record.heartRate;
        existing.spo2Sum += record.spO2;
        existing.count += 1;
      } else {
        daily.set(date, {
          hrSum: record.heartRate,
          spo2Sum: record.spO2,
          count: 1
        });
      }
    }

    return [...daily.entries()]
      .slice(0, 30)
      .map(([date, value]) => ({
        date,
        avgHr: Number((value.hrSum / value.count).toFixed(2)),
        avgSpO2: Number((value.spo2Sum / value.count).toFixed(2))
      }));
  }
}
