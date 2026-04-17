import { HttpError } from "../../utils/httpError.js";

export const pickNumber = (row: Record<string, unknown>, keys: string[]): number => {
  for (const key of keys) {
    const value = row[key];
    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }
    if (typeof value === "string" && value.trim().length > 0) {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
  }
  throw new HttpError(400, `Missing numeric value for fields: ${keys.join(", ")}`);
};

export const pickDate = (row: Record<string, unknown>, keys: string[]): Date => {
  for (const key of keys) {
    const value = row[key];
    if (value instanceof Date && !Number.isNaN(value.getTime())) {
      return value;
    }
    if (typeof value === "string" && value.trim().length > 0) {
      const parsed = new Date(value);
      if (!Number.isNaN(parsed.getTime())) {
        return parsed;
      }
    }
  }
  throw new HttpError(400, `Missing timestamp field. Expected one of: ${keys.join(", ")}`);
};

export const normalizeRecord = (
  row: Record<string, unknown>,
  heartRateKeys: string[],
  spO2Keys: string[],
  hrvKeys: string[]
) => {
  const timestamp = pickDate(row, ["timestamp", "time", "recordedAt"]);
  const heartRate = pickNumber(row, heartRateKeys);
  const spO2 = pickNumber(row, spO2Keys);

  let hrv: number | null = null;
  try {
    hrv = pickNumber(row, hrvKeys);
  } catch {
    hrv = null;
  }

  return {
    timestamp: new Date(timestamp.toISOString()),
    heartRate,
    spO2,
    hrv
  };
};
