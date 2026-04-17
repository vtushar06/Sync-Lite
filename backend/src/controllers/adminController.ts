import { Role } from "@prisma/client";
import { Router } from "express";
import { z } from "zod";
import { authorize, authenticate } from "../middleware/auth.middleware.js";
import { AdminService } from "../services/adminService.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const thresholdSchema = z.object({
  maxRestingHeartRate: z.number().min(80).max(220),
  minSpO2: z.number().min(70).max(100),
  criticalHeartRate: z.number().min(90).max(240),
  criticalSpO2: z.number().min(50).max(100)
});

const assignSchema = z.object({
  clinicianId: z.string().min(5),
  patientId: z.string().min(5)
});

const roleQuerySchema = z.object({
  role: z.nativeEnum(Role)
});

export const adminController = Router();
const adminService = new AdminService();

adminController.use(authenticate);

adminController.get(
  "/thresholds",
  asyncHandler(async (_req, res) => {
    const thresholds = await adminService.getThresholds();
    res.status(200).json(thresholds);
  })
);

adminController.put(
  "/thresholds",
  authorize(Role.ADMIN),
  asyncHandler(async (req, res) => {
    const payload = thresholdSchema.parse(req.body);
    const result = await adminService.updateThresholds(payload);
    res.status(200).json(result);
  })
);

adminController.post(
  "/assign-clinician",
  authorize(Role.ADMIN),
  asyncHandler(async (req, res) => {
    const payload = assignSchema.parse(req.body);
    const assignment = await adminService.assignClinician(payload.clinicianId, payload.patientId);
    res.status(201).json(assignment);
  })
);

adminController.get(
  "/users",
  authorize(Role.ADMIN),
  asyncHandler(async (req, res) => {
    const query = roleQuerySchema.parse(req.query);
    const users = await adminService.listUsersByRole(query.role);
    res.status(200).json(users);
  })
);
