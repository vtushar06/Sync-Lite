export type Role = "PATIENT" | "CLINICIAN" | "ADMIN";

export type DeviceType = "APPLE" | "FITBIT" | "CUSTOM";

export interface AuthUser {
  id: string;
  email: string;
  role: Role;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export interface HealthLog {
  id: string;
  userId: string;
  timestamp: string;
  heartRate: number;
  spO2: number;
  hrv: number | null;
  isAnomaly: boolean;
  sourceDeviceType: DeviceType;
}

export interface Alert {
  id: string;
  userId: string;
  logId: string;
  severity: "LOW" | "HIGH" | "CRITICAL";
  message: string;
  isResolved: boolean;
  createdAt: string;
}

export interface Device {
  id: string;
  userId: string;
  deviceType: DeviceType;
  serialNumber: string;
  createdAt: string;
}

export interface ThresholdConfig {
  id: string;
  maxRestingHeartRate: number;
  minSpO2: number;
  criticalHeartRate: number;
  criticalSpO2: number;
}
