import { useState } from "react";
import { apiRequest } from "../lib/api";
import type { AuthResponse, Role } from "../lib/types";

interface AuthFormProps {
  onAuthenticated: (payload: AuthResponse) => void;
}

export const AuthForm = ({ onAuthenticated }: AuthFormProps) => {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("PATIENT");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    try {
      setLoading(true);
      setError(null);

      const payload =
        mode === "login"
          ? await apiRequest<AuthResponse>("/auth/login", {
              method: "POST",
              body: { email, password }
            })
          : await apiRequest<AuthResponse>("/auth/register", {
              method: "POST",
              body: { email, password, role }
            });

      onAuthenticated(payload);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="panel auth-panel">
      <h2>{mode === "login" ? "Sign in" : "Create account"}</h2>
      <label>Email</label>
      <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" />

      <label>Password</label>
      <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" />

      {mode === "register" ? (
        <>
          <label>Role</label>
          <select value={role} onChange={(event) => setRole(event.target.value as Role)}>
            <option value="PATIENT">Patient</option>
            <option value="CLINICIAN">Clinician</option>
            <option value="ADMIN">Admin</option>
          </select>
        </>
      ) : null}

      {error ? <p className="error-text">{error}</p> : null}

      <button onClick={submit} disabled={loading}>
        {loading ? "Please wait" : mode === "login" ? "Login" : "Register"}
      </button>

      <button className="ghost" onClick={() => setMode(mode === "login" ? "register" : "login")}>
        {mode === "login" ? "Need an account? Register" : "Already registered? Login"}
      </button>
    </div>
  );
};
