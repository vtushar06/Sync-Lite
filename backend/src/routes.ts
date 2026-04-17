import { Router } from "express";
import { adminController } from "./controllers/adminController.js";
import { alertController } from "./controllers/alertController.js";
import { authController } from "./controllers/authController.js";
import { deviceController } from "./controllers/deviceController.js";
import { healthController } from "./controllers/healthController.js";

export const routes = Router();

routes.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok", service: "medi-sync-api" });
});

routes.use("/auth", authController);
routes.use("/devices", deviceController);
routes.use("/health-logs", healthController);
routes.use("/alerts", alertController);
routes.use("/admin", adminController);
