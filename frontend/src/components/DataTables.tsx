import type { Alert, Device, HealthLog } from "../lib/types";

export const HealthLogTable = ({ logs }: { logs: HealthLog[] }) => {
  return (
    <div className="panel">
      <h3>Health Logs</h3>
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
                <td>{log.isAnomaly ? "Yes" : "No"}</td>
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
                <td>{alert.severity}</td>
                <td>{alert.message}</td>
                <td>{alert.isResolved ? "Resolved" : "Open"}</td>
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
