import { Navigate } from "react-router-dom";
import { AuthForm } from "../components/AuthForm";
import { useAuth } from "../context/AuthContext";

export const LoginPage = () => {
  const { token, login } = useAuth();

  if (token) return <Navigate to="/" replace />;

  return (
    <div className="login-shell">
      <div className="login-card">
        <div className="login-brand">
          <div className="login-logo">M</div>
          <span className="login-name">MediSync</span>
        </div>
        <AuthForm onAuthenticated={login} />
      </div>
    </div>
  );
};
