import type { DeviceType } from "@prisma/client";

export type UploadFormat = "JSON" | "CSV";

export interface UploadPayload {
  deviceType: DeviceType;
  format: UploadFormat;
  serialNumber: string;
  records?: Array<Record<string, unknown>> | undefined;
  csvData?: string | undefined;
}

export interface NormalizedHealthRecordInput {
  timestamp: Date;
  heartRate: number;
  spO2: number;
  hrv: number | null;
}

export interface DeviceParserStrategy {
  supports(deviceType: DeviceType, format: UploadFormat): boolean;
  parse(payload: UploadPayload): NormalizedHealthRecordInput[];
}
