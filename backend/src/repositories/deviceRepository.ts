import type { Device, DeviceType } from "@prisma/client";
import { prisma } from "../lib/prisma.js";

export class DeviceRepository {
  create(userId: string, deviceType: DeviceType, serialNumber: string): Promise<Device> {
    return prisma.device.create({
      data: {
        userId,
        deviceType,
        serialNumber
      }
    });
  }

  findBySerial(serialNumber: string): Promise<Device | null> {
    return prisma.device.findUnique({ where: { serialNumber } });
  }

  listByUser(userId: string): Promise<Device[]> {
    return prisma.device.findMany({ where: { userId }, orderBy: { createdAt: "desc" } });
  }
}
