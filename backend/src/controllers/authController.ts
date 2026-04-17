import { Role } from "@prisma/client";
import { Router } from "express";
import { z } from "zod";
import { AuthService } from "../services/authService.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  role: z.nativeEnum(Role).default(Role.PATIENT)
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

export const authController = Router();
const authService = new AuthService();

authController.post(
  "/register",
  asyncHandler(async (req, res) => {
    const payload = registerSchema.parse(req.body);
    const result = await authService.register(payload.email, payload.password, payload.role);
    res.status(201).json(result);
  })
);

authController.post(
  "/login",
  asyncHandler(async (req, res) => {
    const payload = loginSchema.parse(req.body);
    const result = await authService.login(payload.email, payload.password);
    res.status(200).json(result);
  })
);
