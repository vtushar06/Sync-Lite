import type { Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { UserRepository } from "../repositories/userRepository.js";
import { HttpError } from "../utils/httpError.js";

export class AuthService {
  constructor(private readonly userRepository = new UserRepository()) {}

  async register(email: string, password: string, role: Role) {
    const existing = await this.userRepository.findByEmail(email);
    if (existing) {
      throw new HttpError(409, "Email is already in use");
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await this.userRepository.create({
      email,
      passwordHash,
      role
    });

    const token = this.signToken(user.id, user.role);

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    };
  }

  async login(email: string, password: string) {
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new HttpError(401, "Invalid credentials");
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordCorrect) {
      throw new HttpError(401, "Invalid credentials");
    }

    const token = this.signToken(user.id, user.role);

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    };
  }

  private signToken(userId: string, role: Role): string {
    return jwt.sign({ id: userId, role }, env.JWT_SECRET, {
      expiresIn: "7d"
    });
  }
}
