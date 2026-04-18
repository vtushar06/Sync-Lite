import { useState, type FormEvent } from "react";
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

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

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
      <div className="panel-head auth-head">
        <div>
          <p className="kicker">Secure Access</p>
          <h2>{mode === "login" ? "Welcome back" : "Create your account"}</h2>
          <p className="muted">
            {mode === "login"
              ? "Sign in to continue monitoring your health streams."
              : "Register a new user profile with role-based access."}
          </p>
        </div>
      </div>

      <div className="mode-switch" role="tablist" aria-label="Authentication mode">
        <button
          type="button"
          className={mode === "login" ? "mode-btn mode-btn-active" : "mode-btn"}
          onClick={() => setMode("login")}
        >
          Sign In
        </button>
        <button
          type="button"
          className={mode === "register" ? "mode-btn mode-btn-active" : "mode-btn"}
          onClick={() => setMode("register")}
        >
          Register
        </button>
      </div>

      <form onSubmit={submit} className="stack">
        <label>Email</label>
        <input
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          type="email"
          autoComplete="email"
          required
        />

        <label>Password</label>
        <input
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          type="password"
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          required
          minLength={8}
        />

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

        <button type="submit" disabled={loading}>
          {loading ? "Please wait" : mode === "login" ? "Login to Dashboard" : "Create Account"}
        </button>
      </form>
    </div>
  );
};
