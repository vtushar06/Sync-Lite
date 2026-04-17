import type { DeviceType } from "@prisma/client";
import { DeviceRepository } from "../repositories/deviceRepository.js";
import { HttpError } from "../utils/httpError.js";

export class DeviceService {
  constructor(private readonly deviceRepository = new DeviceRepository()) {}

  async registerDevice(userId: string, deviceType: DeviceType, serialNumber: string) {
    const existing = await this.deviceRepository.findBySerial(serialNumber);

    if (existing && existing.userId !== userId) {
      throw new HttpError(409, "Device serial already registered to another user");
    }

    if (existing && existing.userId === userId) {
      return existing;
    }

    return this.deviceRepository.create(userId, deviceType, serialNumber);
  }

  listUserDevices(userId: string) {
    return this.deviceRepository.listByUser(userId);
  }
}
