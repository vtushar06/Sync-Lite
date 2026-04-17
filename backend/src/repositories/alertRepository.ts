import type { Alert, Severity } from "@prisma/client";
import { prisma } from "../lib/prisma.js";

export class AlertRepository {
  create(userId: string, logId: string, severity: Severity, message: string): Promise<Alert> {
    return prisma.alert.create({
      data: {
        userId,
        logId,
        severity,
        message
      }
    });
  }

  listByUser(userId: string): Promise<Alert[]> {
    return prisma.alert.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: { log: true }
    });
  }

  listByUsers(userIds: string[]): Promise<Alert[]> {
    return prisma.alert.findMany({
      where: { userId: { in: userIds } },
      orderBy: { createdAt: "desc" },
      include: { log: true }
    });
  }

  findById(id: string): Promise<Alert | null> {
    return prisma.alert.findUnique({ where: { id } });
  }

  resolve(id: string): Promise<Alert> {
    return prisma.alert.update({
      where: { id },
      data: {
        isResolved: true,
        resolvedAt: new Date()
      }
    });
  }
}
