import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const IconOverview = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
    <rect x="1" y="1" width="6" height="6" rx="1" />
    <rect x="9" y="1" width="6" height="6" rx="1" />
    <rect x="1" y="9" width="6" height="6" rx="1" />
    <rect x="9" y="9" width="6" height="6" rx="1" />
  </svg>
);

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

const IconUpload = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 10V2M8 2L5 5M8 2l3 3" />
    <path d="M2 13h12" />
  </svg>
);

const IconPatients = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <circle cx="8" cy="5" r="3" />
    <path d="M2 14c0-3.314 2.686-5 6-5s6 1.686 6 5" />
  </svg>
);

const IconAdmin = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <circle cx="8" cy="8" r="2.5" />
    <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.41 1.41M11.54 11.54l1.41 1.41M3.05 12.95l1.41-1.41M11.54 4.46l1.41-1.41" />
  </svg>
);

const IconLogout = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 14H3a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1h3" />
    <path d="M10 11l4-3-4-3" />
    <path d="M14 8H6" />
  </svg>
);

const patientNav = [
  { to: "/", label: "Overview", icon: <IconOverview /> },
  { to: "/upload", label: "Upload", icon: <IconUpload /> },
  { to: "/logs", label: "Health Logs", icon: <IconLogs /> },
  { to: "/alerts", label: "Alerts", icon: <IconAlerts /> },
  { to: "/devices", label: "Devices", icon: <IconDevices /> },
];

const clinicianNav = [
  { to: "/", label: "Overview", icon: <IconOverview /> },
  { to: "/patients", label: "Patients", icon: <IconPatients /> },
  { to: "/logs", label: "Health Logs", icon: <IconLogs /> },
  { to: "/alerts", label: "Alerts", icon: <IconAlerts /> },
];

const adminNav = [
  { to: "/", label: "Overview", icon: <IconOverview /> },
  { to: "/patients", label: "Patients", icon: <IconPatients /> },
  { to: "/admin", label: "Admin", icon: <IconAdmin /> },
];

export const Sidebar = () => {
  const { user, logout } = useAuth();

  const navItems =
    user?.role === "PATIENT" ? patientNav : user?.role === "CLINICIAN" ? clinicianNav : adminNav;

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span className="sidebar-logo">M</span>
        <span className="sidebar-brand-name">MediSync</span>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) => `sidebar-link${isActive ? " active" : ""}`}
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-email" title={user?.email}>
            {user?.email}
          </div>
          <span className={`role-chip role-${user?.role.toLowerCase()}`}>{user?.role}</span>
        </div>
        <button className="sidebar-logout" onClick={logout}>
          <IconLogout />
          Logout
        </button>
      </div>
    </aside>
  );
};
