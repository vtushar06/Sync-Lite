import { useEffect, useState } from "react";
import { DeviceTable } from "../components/DataTables";
import { useAuth } from "../context/AuthContext";
import { apiRequest } from "../lib/api";
import type { Device } from "../lib/types";

export const DevicesPage = () => {
  const { token } = useAuth();
  const [devices, setDevices] = useState<Device[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    apiRequest<Device[]>("/devices/me", { token })
      .then(setDevices)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Failed to load devices"));
  }, [token]);

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Devices</h1>
      </div>
      {error ? <p className="error-text">{error}</p> : null}
      <DeviceTable devices={devices} />
    </div>
  );
};
