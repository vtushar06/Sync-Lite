import { type FormEvent, useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { apiRequest } from "../lib/api";
import type { AuthUser, ThresholdConfig } from "../lib/types";

export const AdminPage = () => {
  const { token } = useAuth();
  const [thresholds, setThresholds] = useState<ThresholdConfig | null>(null);
  const [maxRestingHeartRate, setMaxRestingHeartRate] = useState(150);
  const [minSpO2, setMinSpO2] = useState(90);
  const [criticalHeartRate, setCriticalHeartRate] = useState(170);
  const [criticalSpO2, setCriticalSpO2] = useState(85);
  const [patients, setPatients] = useState<AuthUser[]>([]);
  const [clinicians, setClinicians] = useState<AuthUser[]>([]);
  const [clinicianId, setClinicianId] = useState("");
  const [assignPatientId, setAssignPatientId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [assigned, setAssigned] = useState(false);

  useEffect(() => {
    if (!token) return;
    void Promise.all([
      apiRequest<ThresholdConfig>("/admin/thresholds", { token }),
      apiRequest<AuthUser[]>("/admin/users?role=PATIENT", { token }),
      apiRequest<AuthUser[]>("/admin/users?role=CLINICIAN", { token }),
    ]).then(([t, p, c]) => {
      setThresholds(t);
      setMaxRestingHeartRate(t.maxRestingHeartRate);
      setMinSpO2(t.minSpO2);
      setCriticalHeartRate(t.criticalHeartRate);
      setCriticalSpO2(t.criticalSpO2);
      setPatients(p);
      setClinicians(c);
    }).catch((e: unknown) => {
      setError(e instanceof Error ? e.message : "Failed to load admin data");
    });
  }, [token]);

  const saveThresholds = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!token) return;
    try {
      const updated = await apiRequest<ThresholdConfig>("/admin/thresholds", {
        token,
        method: "PUT",
        body: { maxRestingHeartRate, minSpO2, criticalHeartRate, criticalSpO2 },
      });
      setThresholds(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Could not update thresholds");
    }
  };

  const assignClinician = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!token) return;
    try {
      await apiRequest("/admin/assign-clinician", {
        token,
        method: "POST",
        body: { clinicianId, patientId: assignPatientId },
      });
      setAssigned(true);
      setTimeout(() => setAssigned(false), 2500);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Could not assign clinician");
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Admin</h1>
      </div>

      {error ? <p className="error-text" style={{ marginBottom: 16 }}>{error}</p> : null}

      {thresholds ? (
        <div className="panel" style={{ marginBottom: 16 }}>
          <div className="panel-head">
            <h3>Current Thresholds</h3>
          </div>
          <div className="threshold-grid">
            <div className="threshold-item">
              <div className="t-label">Max Resting HR</div>
              <div className="t-value">{thresholds.maxRestingHeartRate}</div>
            </div>
            <div className="threshold-item">
              <div className="t-label">Min SpO2</div>
              <div className="t-value">{thresholds.minSpO2}%</div>
            </div>
            <div className="threshold-item">
              <div className="t-label">Critical HR</div>
              <div className="t-value">{thresholds.criticalHeartRate}</div>
            </div>
            <div className="threshold-item">
              <div className="t-label">Critical SpO2</div>
              <div className="t-value">{thresholds.criticalSpO2}%</div>
            </div>
          </div>
        </div>
      ) : null}

      <div className="content-grid">
        <div className="panel">
          <h3 style={{ marginBottom: 14 }}>Update Thresholds</h3>
          <form className="stack" onSubmit={(e) => void saveThresholds(e)}>
            <div>
              <label>Max Resting Heart Rate</label>
              <input
                type="number"
                value={maxRestingHeartRate}
                onChange={(e) => setMaxRestingHeartRate(Number(e.target.value))}
              />
            </div>
            <div>
              <label>Min SpO2</label>
              <input
                type="number"
                value={minSpO2}
                onChange={(e) => setMinSpO2(Number(e.target.value))}
              />
            </div>
            <div>
              <label>Critical Heart Rate</label>
              <input
                type="number"
                value={criticalHeartRate}
                onChange={(e) => setCriticalHeartRate(Number(e.target.value))}
              />
            </div>
            <div>
              <label>Critical SpO2</label>
              <input
                type="number"
                value={criticalSpO2}
                onChange={(e) => setCriticalSpO2(Number(e.target.value))}
              />
            </div>
            <button type="submit" className="primary" style={{ marginTop: 0 }}>
              {saved ? "Saved" : "Save Thresholds"}
            </button>
          </form>
        </div>

        <div className="panel">
          <h3 style={{ marginBottom: 14 }}>Assign Clinician</h3>
          <form className="stack" onSubmit={(e) => void assignClinician(e)}>
            <div>
              <label>Clinician</label>
              <select value={clinicianId} onChange={(e) => setClinicianId(e.target.value)} required>
                <option value="">Select clinician</option>
                {clinicians.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.email}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label>Patient</label>
              <select value={assignPatientId} onChange={(e) => setAssignPatientId(e.target.value)} required>
                <option value="">Select patient</option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.email}
                  </option>
                ))}
              </select>
            </div>
            <button type="submit" className="primary" style={{ marginTop: 0 }}>
              {assigned ? "Assigned" : "Assign"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
