import { useEffect, useMemo, useState } from "react";
import { AuthForm } from "./components/AuthForm";
import { AlertTable, DeviceTable, HealthLogTable } from "./components/DataTables";
import { UploadForm } from "./components/UploadForm";
import { apiRequest } from "./lib/api";
import type { Alert, AuthResponse, AuthUser, HealthLog, Role, ThresholdConfig, Device } from "./lib/types";

const tokenKey = "medisync_token";
const userKey = "medisync_user";

function App() {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(tokenKey));
  const [user, setUser] = useState<AuthUser | null>(() => {
    const raw = localStorage.getItem(userKey);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  });
  const [logs, setLogs] = useState<HealthLog[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [thresholds, setThresholds] = useState<ThresholdConfig | null>(null);
  const [patientId, setPatientId] = useState("");
  const [patientLogs, setPatientLogs] = useState<HealthLog[]>([]);
  const [patientAlerts, setPatientAlerts] = useState<Alert[]>([]);
  const [clinicianId, setClinicianId] = useState("");
  const [assignPatientId, setAssignPatientId] = useState("");
  const [maxRestingHeartRate, setMaxRestingHeartRate] = useState(150);
  const [minSpO2, setMinSpO2] = useState(90);
  const [criticalHeartRate, setCriticalHeartRate] = useState(170);
  const [criticalSpO2, setCriticalSpO2] = useState(85);
  const [patientUsers, setPatientUsers] = useState<AuthUser[]>([]);
  const [clinicianUsers, setClinicianUsers] = useState<AuthUser[]>([]);
  const [error, setError] = useState<string | null>(null);

  const isClinicianOrAdmin = useMemo(() => user?.role === "CLINICIAN" || user?.role === "ADMIN", [user]);
  const openAlertCount = useMemo(() => alerts.filter((alert) => !alert.isResolved).length, [alerts]);

  const onAuthenticated = (payload: AuthResponse) => {
    setToken(payload.token);
    setUser(payload.user);
    localStorage.setItem(tokenKey, payload.token);
    localStorage.setItem(userKey, JSON.stringify(payload.user));
    setError(null);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setLogs([]);
    setAlerts([]);
    setDevices([]);
    localStorage.removeItem(tokenKey);
    localStorage.removeItem(userKey);
  };

  const loadSelfData = async () => {
    if (!token || !user) {
      return;
    }

    try {
      setError(null);
      const [myLogs, myAlerts, myDevices, config] = await Promise.all([
        apiRequest<HealthLog[]>("/health-logs/me", { token }),
        apiRequest<Alert[]>("/alerts/me", { token }),
        apiRequest<Device[]>("/devices/me", { token }),
        apiRequest<ThresholdConfig>("/admin/thresholds", { token })
      ]);

      setLogs(myLogs);
      setAlerts(myAlerts);
      setDevices(myDevices);
      setThresholds(config);
      setMaxRestingHeartRate(config.maxRestingHeartRate);
      setMinSpO2(config.minSpO2);
      setCriticalHeartRate(config.criticalHeartRate);
      setCriticalSpO2(config.criticalSpO2);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed loading user data");
    }
  };

  const loadAdminUsers = async () => {
    if (!token || user?.role !== "ADMIN") {
      return;
    }

    try {
      const [patients, clinicians] = await Promise.all([
        apiRequest<AuthUser[]>("/admin/users?role=PATIENT", { token }),
        apiRequest<AuthUser[]>("/admin/users?role=CLINICIAN", { token })
      ]);
      setPatientUsers(patients);
      setClinicianUsers(clinicians);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed loading users");
    }
  };

  const queryPatientData = async () => {
    if (!token || !patientId.trim()) {
      return;
    }

    try {
      setError(null);
      const [targetLogs, targetAlerts] = await Promise.all([
        apiRequest<HealthLog[]>(`/health-logs/patient/${patientId}`, { token }),
        apiRequest<Alert[]>(`/alerts/patient/${patientId}`, { token })
      ]);
      setPatientLogs(targetLogs);
      setPatientAlerts(targetAlerts);
    } catch (queryError) {
      setError(queryError instanceof Error ? queryError.message : "Failed fetching patient data");
    }
  };

  const resolveAlert = async (alertId: string) => {
    if (!token) {
      return;
    }

    try {
      await apiRequest(`/alerts/${alertId}/resolve`, {
        token,
        method: "PATCH"
      });
      await queryPatientData();
    } catch (resolveError) {
      setError(resolveError instanceof Error ? resolveError.message : "Could not resolve alert");
    }
  };

  const updateThresholds = async () => {
    if (!token || user?.role !== "ADMIN") {
      return;
    }

    try {
      const updated = await apiRequest<ThresholdConfig>("/admin/thresholds", {
        token,
        method: "PUT",
        body: {
          maxRestingHeartRate,
          minSpO2,
          criticalHeartRate,
          criticalSpO2
        }
      });
      setThresholds(updated);
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Could not update thresholds");
    }
  };

  const assignClinician = async () => {
    if (!token || user?.role !== "ADMIN") {
      return;
    }

    try {
      await apiRequest("/admin/assign-clinician", {
        token,
        method: "POST",
        body: {
          clinicianId,
          patientId: assignPatientId
        }
      });
    } catch (assignError) {
      setError(assignError instanceof Error ? assignError.message : "Could not assign clinician");
    }
  };

  useEffect(() => {
    void loadSelfData();
  }, [token, user]);

  useEffect(() => {
    void loadAdminUsers();
  }, [token, user?.role]);

  if (!token || !user) {
    return (
      <main className="container centered">
        <section className="hero">
          <p className="kicker">Wearable Monitoring Platform</p>
          <h1>MediSync</h1>
          <p className="muted">
            Ingest device vitals, normalize data, and monitor anomalies through a focused clinical dashboard.
          </p>
        </section>
        <AuthForm onAuthenticated={onAuthenticated} />
      </main>
    );
  }

  return (
    <main className="container">
      <header className="topbar">
        <div>
          <h1>MediSync Dashboard</h1>
          <p className="muted">
            {user.email} ({user.role})
          </p>
        </div>
        <button className="danger" onClick={logout}>
          Logout
        </button>
      </header>

      {error ? <p className="error-text">{error}</p> : null}

      <section className="stats-grid">
        <article className="stat-card">
          <p className="stat-label">Health Logs</p>
          <p className="stat-value">{logs.length}</p>
        </article>
        <article className="stat-card">
          <p className="stat-label">Open Alerts</p>
          <p className="stat-value">{openAlertCount}</p>
        </article>
        <article className="stat-card">
          <p className="stat-label">Devices</p>
          <p className="stat-value">{devices.length}</p>
        </article>
      </section>

      {user.role === "PATIENT" ? <UploadForm token={token} onUploaded={loadSelfData} /> : null}

      <div className="grid two">
        <HealthLogTable logs={logs} />
        <AlertTable alerts={alerts} />
      </div>

      <DeviceTable devices={devices} />

      {thresholds ? (
        <div className="panel">
          <h3>Current Thresholds</h3>
          <div className="threshold-grid">
            <p>Max Resting HR: {thresholds.maxRestingHeartRate}</p>
            <p>Min SpO2: {thresholds.minSpO2}</p>
            <p>Critical HR: {thresholds.criticalHeartRate}</p>
            <p>Critical SpO2: {thresholds.criticalSpO2}</p>
          </div>
        </div>
      ) : null}

      {isClinicianOrAdmin ? (
        <div className="panel">
          <h3>Patient Lookup</h3>
          <label>Patient ID</label>
          <input value={patientId} onChange={(event) => setPatientId(event.target.value)} />
          <button onClick={queryPatientData}>Fetch Patient Data</button>
        </div>
      ) : null}

      {patientAlerts.length > 0 && isClinicianOrAdmin ? (
        <div className="panel">
          <h3>Patient Alerts (Resolve)</h3>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Severity</th>
                  <th>Message</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {patientAlerts.map((alert) => (
                  <tr key={alert.id}>
                    <td>{alert.severity}</td>
                    <td>{alert.message}</td>
                    <td>{alert.isResolved ? "Resolved" : "Open"}</td>
                    <td>
                      {!alert.isResolved ? <button onClick={() => resolveAlert(alert.id)}>Resolve</button> : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {patientLogs.length > 0 && isClinicianOrAdmin ? <HealthLogTable logs={patientLogs} /> : null}

      {user.role === "ADMIN" ? (
        <div className="grid two">
          <div className="panel">
            <h3>Update Thresholds</h3>
            <label>Max Resting Heart Rate</label>
            <input
              type="number"
              value={maxRestingHeartRate}
              onChange={(event) => setMaxRestingHeartRate(Number(event.target.value))}
            />

            <label>Min SpO2</label>
            <input type="number" value={minSpO2} onChange={(event) => setMinSpO2(Number(event.target.value))} />

            <label>Critical Heart Rate</label>
            <input
              type="number"
              value={criticalHeartRate}
              onChange={(event) => setCriticalHeartRate(Number(event.target.value))}
            />

            <label>Critical SpO2</label>
            <input
              type="number"
              value={criticalSpO2}
              onChange={(event) => setCriticalSpO2(Number(event.target.value))}
            />

            <button onClick={updateThresholds}>Save Thresholds</button>
          </div>

          <div className="panel">
            <h3>Assign Clinician to Patient</h3>

            <label>Clinician</label>
            <select value={clinicianId} onChange={(event) => setClinicianId(event.target.value)}>
              <option value="">Select clinician</option>
              {clinicianUsers.map((entry) => (
                <option value={entry.id} key={entry.id}>
                  {entry.email}
                </option>
              ))}
            </select>

            <label>Patient</label>
            <select value={assignPatientId} onChange={(event) => setAssignPatientId(event.target.value)}>
              <option value="">Select patient</option>
              {patientUsers.map((entry) => (
                <option value={entry.id} key={entry.id}>
                  {entry.email}
                </option>
              ))}
            </select>

            <button onClick={assignClinician}>Assign</button>
          </div>
        </div>
      ) : null}
    </main>
  );
}

export default App;
