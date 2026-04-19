import { type FormEvent, useState } from "react";
import { AlertTable, HealthLogTable } from "../components/DataTables";
import { useAuth } from "../context/AuthContext";
import { apiRequest } from "../lib/api";
import type { Alert, HealthLog } from "../lib/types";

export const PatientPage = () => {
  const { token } = useAuth();
  const [patientId, setPatientId] = useState("");
  const [logs, setLogs] = useState<HealthLog[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  const fetchPatient = async () => {
    if (!token || !patientId.trim()) return;
    try {
      setError(null);
      const [l, a] = await Promise.all([
        apiRequest<HealthLog[]>(`/health-logs/patient/${patientId}`, { token }),
        apiRequest<Alert[]>(`/alerts/patient/${patientId}`, { token }),
      ]);
      setLogs(l);
      setAlerts(a);
      setSearched(true);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to fetch patient data");
    }
  };

  const resolveAlert = async (alertId: string) => {
    if (!token) return;
    try {
      await apiRequest(`/alerts/${alertId}/resolve`, { token, method: "PATCH" });
      await fetchPatient();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Could not resolve alert");
    }
  };

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    void fetchPatient();
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Patient Lookup</h1>
      </div>

      <div className="panel">
        <h3>Find Patient</h3>
        <form className="stack" onSubmit={onSubmit} style={{ marginTop: 14 }}>
          <label>Patient ID</label>
          <input
            value={patientId}
            onChange={(e) => setPatientId(e.target.value)}
            placeholder="Enter patient UUID"
            required
          />
          <button type="submit" className="primary" style={{ marginTop: 0 }}>
            Fetch Data
          </button>
        </form>
      </div>

      {error ? <p className="error-text">{error}</p> : null}

      {searched ? (
        <>
          <div className="panel">
            <div className="panel-head">
              <h3>Alerts</h3>
              <span className="panel-count">{alerts.length}</span>
            </div>
            {alerts.length === 0 ? (
              <p className="empty-state">No alerts found.</p>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Severity</th>
                      <th>Message</th>
                      <th>Status</th>
                      <th>Created</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {alerts.map((alert) => (
                      <tr key={alert.id}>
                        <td>
                          <span
                            className={`badge ${
                              alert.severity === "CRITICAL"
                                ? "badge-critical"
                                : alert.severity === "HIGH"
                                  ? "badge-high"
                                  : "badge-low"
                            }`}
                          >
                            {alert.severity}
                          </span>
                        </td>
                        <td>{alert.message}</td>
                        <td>
                          <span className={alert.isResolved ? "badge badge-ok" : "badge badge-alert"}>
                            {alert.isResolved ? "Resolved" : "Open"}
                          </span>
                        </td>
                        <td>{new Date(alert.createdAt).toLocaleString()}</td>
                        <td>
                          {!alert.isResolved ? (
                            <button className="danger-sm" onClick={() => resolveAlert(alert.id)}>
                              Resolve
                            </button>
                          ) : (
                            <span style={{ color: "var(--muted)", fontSize: 13 }}>—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <HealthLogTable logs={logs} />
        </>
      ) : null}
    </div>
  );
};
