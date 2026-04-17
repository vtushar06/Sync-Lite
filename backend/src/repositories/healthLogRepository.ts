import { Prisma } from "@prisma/client";
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

  aggregateByDay(userId: string) {
    return prisma.$queryRaw<Array<{ date: string; avgHr: number; avgSpO2: number }>>(
      Prisma.sql`
      SELECT
        DATE(timestamp) AS date,
        AVG(heartRate) AS avgHr,
        AVG(spO2) AS avgSpO2
      FROM HealthLog
      WHERE userId = ${userId}
      GROUP BY DATE(timestamp)
      ORDER BY DATE(timestamp) DESC
      LIMIT 30
    `
    );
  }
}
