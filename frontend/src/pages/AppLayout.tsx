import { Navigate, Outlet } from "react-router-dom";
import { Sidebar } from "../components/Sidebar";
import { useAuth } from "../context/AuthContext";

export const AppLayout = () => {
  const { token } = useAuth();

  if (!token) return <Navigate to="/login" replace />;

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-area">
        <Outlet />
      </div>
    </div>
  );
};
