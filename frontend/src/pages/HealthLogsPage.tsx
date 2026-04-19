import { useEffect, useState } from "react";
import { HealthLogTable } from "../components/DataTables";
import { useAuth } from "../context/AuthContext";
import { apiRequest } from "../lib/api";
import type { HealthLog } from "../lib/types";

export const HealthLogsPage = () => {
  const { token } = useAuth();
  const [logs, setLogs] = useState<HealthLog[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    apiRequest<HealthLog[]>("/health-logs/me", { token })
      .then(setLogs)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Failed to load logs"));
  }, [token]);

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Health Logs</h1>
      </div>
      {error ? <p className="error-text">{error}</p> : null}
      <HealthLogTable logs={logs} />
    </div>
  );
};
