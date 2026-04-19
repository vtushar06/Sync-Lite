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
              body: { email, password },
            })
          : await apiRequest<AuthResponse>("/auth/register", {
              method: "POST",
              body: { email, password, role },
            });
      onAuthenticated(payload);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 8, color: "var(--text)" }}>
          {mode === "login" ? "Welcome back" : "Create your account"}
        </h2>
        <p style={{ fontSize: 14, color: "var(--muted)", margin: 0, fontWeight: 500 }}>
          {mode === "login"
            ? "Sign in to access your health monitoring dashboard"
            : "Join MediSync and manage your health data"}
        </p>
      </div>

      <div className="mode-switch" role="tablist" aria-label="Authentication mode">
        <button
          type="button"
          className={mode === "login" ? "mode-btn mode-btn-active" : "mode-btn"}
          onClick={() => setMode("login")}
          style={{ fontSize: 13, fontWeight: 600 }}
        >
          Sign In
        </button>
        <button
          type="button"
          className={mode === "register" ? "mode-btn mode-btn-active" : "mode-btn"}
          onClick={() => setMode("register")}
          style={{ fontSize: 13, fontWeight: 600 }}
        >
          Sign Up
        </button>
      </div>

      {error ? (
        <div style={{
          background: "var(--danger-light)",
          border: "1px solid #fecaca",
          color: "var(--danger)",
          padding: "12px 14px",
          borderRadius: "var(--radius)",
          fontSize: 13,
          marginBottom: 20,
          fontWeight: 500
        }}>
          {error}
        </div>
      ) : null}

      <form onSubmit={(e) => void submit(e)} className="stack">
        <div>
          <label style={{ marginBottom: 6, display: "block" }}>Email address</label>
          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            required
            style={{ fontSize: 15 }}
          />
        </div>

        <div>
          <label style={{ marginBottom: 6, display: "block" }}>Password</label>
          <input
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            type="password"
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            placeholder={mode === "login" ? "Enter password" : "Min. 8 characters"}
            required
            minLength={8}
            style={{ fontSize: 15 }}
          />
        </div>

        {mode === "register" ? (
          <div>
            <label style={{ marginBottom: 6, display: "block" }}>Role</label>
            <select value={role} onChange={(event) => setRole(event.target.value as Role)} style={{ fontSize: 15 }}>
              <option value="PATIENT">Patient</option>
              <option value="CLINICIAN">Clinician</option>
              <option value="ADMIN">Administrator</option>
            </select>
          </div>
        ) : null}

        <button
          type="submit"
          className="primary"
          disabled={loading}
          style={{ marginTop: 24, padding: "11px 16px", fontSize: 15, fontWeight: 700, letterSpacing: "0.5px" }}
        >
          {loading ? "Loading…" : mode === "login" ? "Sign In" : "Create Account"}
        </button>
      </form>

      <div style={{ marginTop: 20, textAlign: "center", paddingTop: 20, borderTop: "1px solid var(--border)" }}>
        <p style={{ fontSize: 13, color: "var(--muted)", margin: 0, marginBottom: 8 }}>
          {mode === "login" ? "Don't have an account?" : "Already have an account?"}
        </p>
        <button
          type="button"
          onClick={() => setMode(mode === "login" ? "register" : "login")}
          style={{
            background: "transparent",
            border: "none",
            color: "var(--brand)",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            padding: 0,
            textDecoration: "none",
            transition: "opacity 100ms"
          }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.8")}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
        >
          {mode === "login" ? "Sign up here" : "Sign in instead"}
        </button>
      </div>
    </>
  );
};
