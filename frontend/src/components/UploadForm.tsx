import { useState } from "react";
import { apiRequest } from "../lib/api";
import type { DeviceType } from "../lib/types";

interface UploadFormProps {
  token: string;
  onUploaded: () => Promise<void>;
}

export const UploadForm = ({ token, onUploaded }: UploadFormProps) => {
  const [deviceType, setDeviceType] = useState<DeviceType>("APPLE");
  const [format, setFormat] = useState<"JSON" | "CSV">("JSON");
  const [serialNumber, setSerialNumber] = useState("DEV-001");
  const [payloadText, setPayloadText] = useState(
    '[{"timestamp":"2026-04-17T09:00:00Z","heartRate":82,"spO2":97,"hrv":45}]'
  );
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const submit = async () => {
    try {
      setError(null);
      setMessage(null);

      const body =
        format === "JSON"
          ? {
              deviceType,
              format,
              serialNumber,
              records: JSON.parse(payloadText)
            }
          : {
              deviceType,
              format,
              serialNumber,
              csvData: payloadText
            };

      const result = await apiRequest<{ savedCount: number; anomalyCount: number; discardedCount: number }>(
        "/health-logs/upload",
        {
          method: "POST",
          token,
          body
        }
      );

      setMessage(
        `Saved ${result.savedCount}, anomalies ${result.anomalyCount}, discarded ${result.discardedCount}`
      );
      await onUploaded();
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Upload failed");
    }
  };

  return (
    <div className="panel">
      <h3>Upload Health Data</h3>

      <label>Device Type</label>
      <select value={deviceType} onChange={(event) => setDeviceType(event.target.value as DeviceType)}>
        <option value="APPLE">Apple Watch</option>
        <option value="FITBIT">Fitbit</option>
        <option value="CUSTOM">Custom</option>
      </select>

      <label>Format</label>
      <select value={format} onChange={(event) => setFormat(event.target.value as "JSON" | "CSV")}>
        <option value="JSON">JSON</option>
        <option value="CSV">CSV</option>
      </select>

      <label>Serial Number</label>
      <input value={serialNumber} onChange={(event) => setSerialNumber(event.target.value)} />

      <label>{format === "JSON" ? "JSON Records" : "CSV Data"}</label>
      <textarea value={payloadText} onChange={(event) => setPayloadText(event.target.value)} rows={8} />

      {error ? <p className="error-text">{error}</p> : null}
      {message ? <p className="ok-text">{message}</p> : null}

      <button onClick={submit}>Submit Upload</button>
    </div>
  );
};
