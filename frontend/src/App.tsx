import { useEffect, useMemo, useState, type FormEvent } from "react";
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
  const criticalAlertCount = useMemo(
    () => alerts.filter((alert) => alert.severity === "CRITICAL" && !alert.isResolved).length,
    [alerts]
  );
  const latestLogTime = useMemo(
    () => (logs[0] ? new Date(logs[0].timestamp).toLocaleString() : "No logs yet"),
    [logs]
  );

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

  const submitPatientLookup = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void queryPatientData();
  };

  const submitThresholdUpdate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void updateThresholds();
  };

  const submitAssignment = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void assignClinician();
  };

  useEffect(() => {
    void loadSelfData();
  }, [token, user]);

  useEffect(() => {
    void loadAdminUsers();
  }, [token, user?.role]);

  if (!token || !user) {
    return (
      <main className="landing-shell">
        <section className="landing-hero">
          <p className="kicker">Clinical Monitoring Suite</p>
          <h1>MediSync</h1>
          <p className="muted lead">
            Professional wearable intelligence for patients, clinicians, and administrators in one secure workspace.
          </p>
          <ul className="hero-points">
            <li>Unified ingestion for Apple Watch, Fitbit, and CSV sources.</li>
            <li>Rule-based anomaly detection with traceable alerts.</li>
            <li>Role-based workflows for patient care and system control.</li>
          </ul>
        </section>
        <section className="landing-auth-wrap">
          <AuthForm onAuthenticated={onAuthenticated} />
        </section>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <div className="container">
        <header className="app-header">
          <div className="brand-block">
            <p className="kicker">MediSync Control Center</p>
            <h1>Patient Monitoring Dashboard</h1>
            <p className="muted">Signed in as {user.email}</p>
          </div>
          <div className="header-actions">
            <span className={`role-chip role-${user.role.toLowerCase()}`}>{user.role}</span>
            <button className="danger compact" onClick={logout}>
              Logout
            </button>
          </div>
        </header>

        {error ? <p className="error-text banner">{error}</p> : null}

        <section className="stat-strip">
          <article className="stat-card">
            <p className="stat-label">Health Logs</p>
            <p className="stat-value">{logs.length}</p>
            <p className="stat-note">Last update: {latestLogTime}</p>
          </article>
          <article className="stat-card">
            <p className="stat-label">Open Alerts</p>
            <p className="stat-value">{openAlertCount}</p>
            <p className="stat-note">Critical open: {criticalAlertCount}</p>
          </article>
          <article className="stat-card">
            <p className="stat-label">Registered Devices</p>
            <p className="stat-value">{devices.length}</p>
            <p className="stat-note">Synced to this account</p>
          </article>
        </section>

        <div className="content-layout">
          <section className="content-main">
            {user.role === "PATIENT" ? <UploadForm token={token} onUploaded={loadSelfData} /> : null}

            <div className="grid two">
              <HealthLogTable logs={logs} />
              <AlertTable alerts={alerts} />
            </div>

            <DeviceTable devices={devices} />

            {patientAlerts.length > 0 && isClinicianOrAdmin ? (
              <div className="panel">
                <div className="panel-head">
                  <h3>Patient Alerts</h3>
                  <span className="panel-count">{patientAlerts.length}</span>
                </div>
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
                            {!alert.isResolved ? (
                              <button className="compact" onClick={() => resolveAlert(alert.id)}>
                                Resolve
                              </button>
                            ) : (
                              "-"
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : null}

            {patientLogs.length > 0 && isClinicianOrAdmin ? <HealthLogTable logs={patientLogs} /> : null}
          </section>

          <aside className="content-side">
            {thresholds ? (
              <div className="panel">
                <div className="panel-head">
                  <h3>Threshold Profile</h3>
                  <span className="panel-count">Live</span>
                </div>
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
                <form className="stack" onSubmit={submitPatientLookup}>
                  <label>Patient ID</label>
                  <input value={patientId} onChange={(event) => setPatientId(event.target.value)} />
                  <button type="submit">Fetch Patient Data</button>
                </form>
              </div>
            ) : null}

            {user.role === "ADMIN" ? (
              <>
                <div className="panel">
                  <h3>Update Thresholds</h3>
                  <form className="stack" onSubmit={submitThresholdUpdate}>
                    <label>Max Resting Heart Rate</label>
                    <input
                      type="number"
                      value={maxRestingHeartRate}
                      onChange={(event) => setMaxRestingHeartRate(Number(event.target.value))}
                    />

                    <label>Min SpO2</label>
                    <input
                      type="number"
                      value={minSpO2}
                      onChange={(event) => setMinSpO2(Number(event.target.value))}
                    />

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

                    <button type="submit">Save Thresholds</button>
                  </form>
                </div>

                <div className="panel">
                  <h3>Assign Clinician</h3>
                  <form className="stack" onSubmit={submitAssignment}>
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

                    <button type="submit">Assign</button>
                  </form>
                </div>
              </>
            ) : null}
          </aside>
        </div>
      </div>
    </main>
  );
}

export default App;
