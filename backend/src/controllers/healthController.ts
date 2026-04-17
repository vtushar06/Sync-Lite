import { DeviceType, Role } from "@prisma/client";
import { Router } from "express";
import { z } from "zod";
import { authorize, authenticate } from "../middleware/auth.middleware.js";
import { HealthService } from "../services/healthService.js";
import { HttpError } from "../utils/httpError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const uploadSchema = z
  .object({
    deviceType: z.nativeEnum(DeviceType),
    format: z.enum(["JSON", "CSV"]).default("JSON"),
    serialNumber: z.string().min(3),
    records: z.array(z.record(z.unknown())).optional(),
    csvData: z.string().optional()
  })
  .refine((value) => (value.format === "JSON" ? Boolean(value.records?.length) : Boolean(value.csvData?.trim())), {
    message: "records required for JSON and csvData required for CSV",
    path: ["format"]
  });

const patientParamSchema = z.object({
  patientId: z.string().min(1)
});

export const healthController = Router();
const healthService = new HealthService();

healthController.use(authenticate);

healthController.post(
  "/upload",
  authorize(Role.PATIENT, Role.ADMIN),
  asyncHandler(async (req, res) => {
    if (!req.user) {
      throw new HttpError(401, "Unauthorized");
    }

    const payload = uploadSchema.parse(req.body);
    const result = await healthService.ingest(req.user.id, payload);
    res.status(200).json(result);
  })
);

healthController.get(
  "/me",
  asyncHandler(async (req, res) => {
    if (!req.user) {
      throw new HttpError(401, "Unauthorized");
    }

    const records = await healthService.listMyHistory(req.user.id);
    res.status(200).json(records);
  })
);

healthController.get(
  "/me/trends",
  asyncHandler(async (req, res) => {
    if (!req.user) {
      throw new HttpError(401, "Unauthorized");
    }

    const trends = await healthService.aggregateMyTrends(req.user.id);
    res.status(200).json(trends);
  })
);

healthController.get(
  "/patient/:patientId",
  authorize(Role.CLINICIAN, Role.ADMIN),
  asyncHandler(async (req, res) => {
    if (!req.user) {
      throw new HttpError(401, "Unauthorized");
    }

    const params = patientParamSchema.parse(req.params);
    const records = await healthService.listPatientHistory(req.user.id, req.user.role, params.patientId);
    res.status(200).json(records);
  })
);
