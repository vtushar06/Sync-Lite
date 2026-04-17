import { parse } from "csv-parse/sync";
import { DeviceType } from "@prisma/client";
import { HttpError } from "../../utils/httpError.js";
import { normalizeRecord } from "./parserUtils.js";
import type { DeviceParserStrategy, UploadPayload } from "./types.js";

export class CsvParser implements DeviceParserStrategy {
  supports(_deviceType: DeviceType, format: "JSON" | "CSV"): boolean {
    return format === "CSV";
  }

  parse(payload: UploadPayload) {
    if (!payload.csvData || payload.csvData.trim().length === 0) {
      throw new HttpError(400, "CSV payload is empty");
    }

    const rows = parse(payload.csvData, {
      columns: true,
      trim: true,
      skip_empty_lines: true
    }) as Array<Record<string, unknown>>;

    if (rows.length === 0) {
      throw new HttpError(400, "No CSV rows found");
    }

    return rows.map((row) =>
      normalizeRecord(row, ["heartRate", "heart_rate", "bpm"], ["spO2", "spo2", "oxygen"], ["hrv", "variability", "hrvMs"])
    );
  }
}
