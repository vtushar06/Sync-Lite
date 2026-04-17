import { DeviceType } from "@prisma/client";
import { HttpError } from "../../utils/httpError.js";
import { normalizeRecord } from "./parserUtils.js";
import type { DeviceParserStrategy, UploadPayload } from "./types.js";

export class FitbitJsonParser implements DeviceParserStrategy {
  supports(deviceType: DeviceType, format: "JSON" | "CSV"): boolean {
    return deviceType === DeviceType.FITBIT && format === "JSON";
  }

  parse(payload: UploadPayload) {
    if (!payload.records || payload.records.length === 0) {
      throw new HttpError(400, "No records found in JSON payload");
    }

    return payload.records.map((row) =>
      normalizeRecord(row, ["bpm", "heart_rate", "heartRate"], ["oxygen", "spo2", "spO2"], ["variability", "hrv", "hrvMs"])
    );
  }
}
