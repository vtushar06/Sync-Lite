import { DeviceType } from "@prisma/client";
import { Router } from "express";
import { z } from "zod";
import { authenticate } from "../middleware/auth.middleware.js";
import { DeviceService } from "../services/deviceService.js";
import { HttpError } from "../utils/httpError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createDeviceSchema = z.object({
  deviceType: z.nativeEnum(DeviceType),
  serialNumber: z.string().min(3)
});

export const deviceController = Router();
const deviceService = new DeviceService();

deviceController.use(authenticate);

deviceController.post(
  "/",
  asyncHandler(async (req, res) => {
    if (!req.user) {
      throw new HttpError(401, "Unauthorized");
    }

    const payload = createDeviceSchema.parse(req.body);
    const device = await deviceService.registerDevice(req.user.id, payload.deviceType, payload.serialNumber);
    res.status(201).json(device);
  })
);

deviceController.get(
  "/me",
  asyncHandler(async (req, res) => {
    if (!req.user) {
      throw new HttpError(401, "Unauthorized");
    }

    const devices = await deviceService.listUserDevices(req.user.id);
    res.status(200).json(devices);
  })
);
