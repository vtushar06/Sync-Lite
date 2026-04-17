import { Role } from "@prisma/client";
import { Router } from "express";
import { z } from "zod";
import { authorize, authenticate } from "../middleware/auth.middleware.js";
import { AlertService } from "../services/alertService.js";
import { HttpError } from "../utils/httpError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const patientParamSchema = z.object({
  patientId: z.string().min(1)
});

const alertParamSchema = z.object({
  alertId: z.string().min(1)
});

export const alertController = Router();
const alertService = new AlertService();

alertController.use(authenticate);

alertController.get(
  "/me",
  asyncHandler(async (req, res) => {
    if (!req.user) {
      throw new HttpError(401, "Unauthorized");
    }

    const alerts = await alertService.listMyAlerts(req.user.id);
    res.status(200).json(alerts);
  })
);

alertController.get(
  "/patient/:patientId",
  authorize(Role.CLINICIAN, Role.ADMIN),
  asyncHandler(async (req, res) => {
    if (!req.user) {
      throw new HttpError(401, "Unauthorized");
    }

    const params = patientParamSchema.parse(req.params);
    const alerts = await alertService.listPatientAlerts(req.user.id, req.user.role, params.patientId);
    res.status(200).json(alerts);
  })
);

alertController.patch(
  "/:alertId/resolve",
  authorize(Role.CLINICIAN, Role.ADMIN),
  asyncHandler(async (req, res) => {
    if (!req.user) {
      throw new HttpError(401, "Unauthorized");
    }

    const params = alertParamSchema.parse(req.params);
    const result = await alertService.resolveAlert(req.user.id, req.user.role, params.alertId);
    res.status(200).json(result);
  })
);
