import { useEffect, useState } from "react";
import { AlertTable } from "../components/DataTables";
import { useAuth } from "../context/AuthContext";
import { apiRequest } from "../lib/api";
import type { Alert } from "../lib/types";

export const AlertsPage = () => {
  const { token } = useAuth();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    apiRequest<Alert[]>("/alerts/me", { token })
      .then(setAlerts)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Failed to load alerts"));
  }, [token]);

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Alerts</h1>
      </div>
      {error ? <p className="error-text">{error}</p> : null}
      <AlertTable alerts={alerts} />
    </div>
  );
};
