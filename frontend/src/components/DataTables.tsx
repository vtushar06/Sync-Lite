import type { Alert, Device, HealthLog } from "../lib/types";

export const HealthLogTable = ({ logs }: { logs: HealthLog[] }) => {
  return (
    <div className="panel">
      <h3>Health Logs</h3>
      {logs.length === 0 ? <p className="muted">No health logs yet.</p> : null}
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Time</th>
              <th>HR</th>
              <th>SpO2</th>
              <th>HRV</th>
              <th>Anomaly</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id}>
                <td>{new Date(log.timestamp).toLocaleString()}</td>
                <td>{log.heartRate}</td>
                <td>{log.spO2}</td>
                <td>{log.hrv ?? "-"}</td>
                <td>
                  <span className={log.isAnomaly ? "badge badge-alert" : "badge badge-ok"}>
                    {log.isAnomaly ? "Yes" : "No"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const AlertTable = ({ alerts }: { alerts: Alert[] }) => {
  return (
    <div className="panel">
      <h3>Alerts</h3>
      {alerts.length === 0 ? <p className="muted">No alerts found.</p> : null}
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Severity</th>
              <th>Message</th>
              <th>Status</th>
              <th>Created</th>
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const DeviceTable = ({ devices }: { devices: Device[] }) => {
  return (
    <div className="panel">
      <h3>Registered Devices</h3>
      {devices.length === 0 ? <p className="muted">No devices registered.</p> : null}
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Type</th>
              <th>Serial</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {devices.map((device) => (
              <tr key={device.id}>
                <td>{device.deviceType}</td>
                <td>{device.serialNumber}</td>
                <td>{new Date(device.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
