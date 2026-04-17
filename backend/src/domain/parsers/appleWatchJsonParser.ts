import { DeviceType } from "@prisma/client";
import { HttpError } from "../../utils/httpError.js";
import { normalizeRecord } from "./parserUtils.js";
import type { DeviceParserStrategy, UploadPayload } from "./types.js";

export class AppleWatchJsonParser implements DeviceParserStrategy {
  supports(deviceType: DeviceType, format: "JSON" | "CSV"): boolean {
    return deviceType === DeviceType.APPLE && format === "JSON";
  }

  parse(payload: UploadPayload) {
    if (!payload.records || payload.records.length === 0) {
      throw new HttpError(400, "No records found in JSON payload");
    }

    return payload.records.map((row) =>
      normalizeRecord(row, ["heartRate", "hr", "bpm"], ["spO2", "spo2", "oxygen"], ["hrv", "hrvMs"])
    );
  }
}
