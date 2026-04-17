import type { Role } from "@prisma/client";

export interface AuthUser {
  id: string;
  role: Role;
}

export interface JwtPayload extends AuthUser {
  iat?: number;
  exp?: number;
}
