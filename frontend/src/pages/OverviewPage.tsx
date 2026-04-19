import { useEffect, useMemo, useState } from "react";
import type { Alert, Device, HealthLog } from "../lib/types";
import { apiRequest } from "../lib/api";
import { useAuth } from "../context/AuthContext";

const IconLogs = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="1,8 4,8 5,4 7,12 9,6 11,8 15,8" />
  </svg>
);

const IconAlerts = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round">
    <path d="M8 1a5 5 0 0 1 5 5v3l1.5 2.5H1.5L3 9V6a5 5 0 0 1 5-5z" />
    <path d="M6.5 13a1.5 1.5 0 0 0 3 0" strokeLinecap="round" />
  </svg>
);

const IconDevices = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <rect x="4" y="4" width="8" height="8" rx="2" />
    <path d="M6 4V2.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 .5.5V4" />
    <path d="M6 12v1.5a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5V12" />
  </svg>
);

export const OverviewPage = () => {
  const { token, user } = useAuth();
  const [logs, setLogs] = useState<HealthLog[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);

  const openAlerts = useMemo(() => alerts.filter((a) => !a.isResolved).length, [alerts]);
  const criticalAlerts = useMemo(
    () => alerts.filter((a) => a.severity === "CRITICAL" && !a.isResolved).length,
    [alerts]
  );
  const latestLog = useMemo(
    () => (logs[0] ? new Date(logs[0].timestamp).toLocaleString() : "No data yet"),
    [logs]
  );

  useEffect(() => {
    if (!token || user?.role !== "PATIENT") return;
    void Promise.all([
      apiRequest<HealthLog[]>("/health-logs/me", { token }),
      apiRequest<Alert[]>("/alerts/me", { token }),
      apiRequest<Device[]>("/devices/me", { token }),
    ]).then(([l, a, d]) => {
      setLogs(l);
      setAlerts(a);
      setDevices(d);
    });
  }, [token, user?.role]);

  if (user?.role !== "PATIENT") {
    return (
      <div className="page">
        <div className="page-header">
          <h1 className="page-title">Overview</h1>
          <p className="page-subtitle">Welcome back, {user?.email}</p>
        </div>
        <div className="panel">
          <p style={{ color: "var(--muted)", fontSize: 14 }}>
            {user?.role === "CLINICIAN"
              ? "Use Patients to look up a patient's health data and resolve alerts."
              : "Use Patients to look up patient data, Admin to manage thresholds and assign clinicians."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Overview</h1>
        <p className="page-subtitle">Your health monitoring summary</p>
      </div>

      <div className="stat-strip">
        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-label">Health Logs</span>
            <span className="stat-icon"><IconLogs /></span>
          </div>
          <div className="stat-value">{logs.length}</div>
          <div className="stat-note">Last: {latestLog}</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-label">Open Alerts</span>
            <span className="stat-icon"><IconAlerts /></span>
          </div>
          <div className="stat-value">{openAlerts}</div>
          <div className="stat-note">Critical: {criticalAlerts}</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-label">Devices</span>
            <span className="stat-icon"><IconDevices /></span>
          </div>
          <div className="stat-value">{devices.length}</div>
          <div className="stat-note">Registered to this account</div>
        </div>
      </div>
    </div>
  );
};
