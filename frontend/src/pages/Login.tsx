
// src/pages/Login.tsx
import React, { useState, type JSX } from "react";
import { useNavigate } from "react-router-dom";
import "../styles.css";
import banner from "../assets/loginimage.png";

/** decode JWT payload (safe) */
function parseJwt(token: string | null): Record<string, any> | null {
  if (!token) return null;
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(payload);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

/** Try to derive a single canonical role string from token payload or response.user */
function getRoleFromResponseOrToken(data: any, token: string | null): string | null {
  // 1) try server-sent user object
  if (data?.user?.role) {
    return String(data.user.role);
  }
  if (data?.user?.roles) {
    const r = data.user.roles;
    if (Array.isArray(r)) return String(r[0]);
    return String(r);
  }

  // 2) try token claims
  const claims = parseJwt(token);
  if (!claims) return null;

  // common claim keys
  const claimCandidates = ["role", "roles", "authorities", "authority", "scope"];
  for (const k of claimCandidates) {
    const v = claims[k];
    if (!v) continue;
    if (Array.isArray(v) && v.length > 0) return String(v[0]);
    if (typeof v === "string") return v;
    // authority objects like [{authority: "ROLE_ADMIN"}]
    if (Array.isArray(v) && typeof v[0] === "object" && v[0].authority) return String(v[0].authority);
  }

  // some JWTs include authorities under nested claim 'authorities' as array of strings or objects
  if (claims?.authorities) {
    const a = claims.authorities;
    if (Array.isArray(a)) {
      if (a.length === 0) return null;
      const first = a[0];
      if (typeof first === "string") return first;
      if (typeof first === "object") return first.authority ?? first.role ?? null;
    }
  }

  return null;
}

/** Normalize to 'admin' or 'employee' */
function normalizeRole(rawRole: string | null): "admin" | "employee" | null {
  if (!rawRole) return null;
  const r = String(rawRole).toUpperCase();

  if (r.includes("ROLE_ADMIN") || r.includes("ADMIN")) return "admin";
  if (r.includes("ROLE_EMPLOYEE") || r.includes("EMPLOYEE") || r.includes("ROLE_USER") || r.includes("USER")) return "employee";

  // fallback: if role contains 'STAFF' treat as employee
  if (r.includes("STAFF")) return "employee";

  return null;
}

export default function Login(): JSX.Element {
  const nav = useNavigate();
  const API_BASE = (import.meta as any)?.env?.VITE_API_BASE ?? "/api";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e?: React.FormEvent) {
    e?.preventDefault?.();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      if (!res.ok) {
        if (res.status === 401) setError("Invalid email or password.");
        else setError(`Login failed (${res.status}).`);
        setLoading(false);
        return;
      }

      const data = await res.json().catch(() => ({}));
      const token = data?.token ?? data?.accessToken ?? data?.jwt ?? data?.access_token ?? null;

      if (!token) {
        setError("Login succeeded but server did not return a token.");
        setLoading(false);
        return;
      }

      // persist token
      localStorage.setItem("token", token);
      if (data?.user) localStorage.setItem("user", JSON.stringify(data.user));

      // derive role (from response first, then token)
      const rawRole = getRoleFromResponseOrToken(data, token);
      const role = normalizeRole(rawRole);

      if (role === "admin") {
        localStorage.setItem("role", "admin");
        nav("/admin");
        return;
      }
      if (role === "employee") {
        localStorage.setItem("role", "employee");
        nav("/employee");
        return;
      }

      // fallback: try to inspect token claims for any ROLE_ADMIN/ROLE_EMPLOYEE substrings
      const claims = parseJwt(token);
      const joined = claims ? JSON.stringify(claims).toUpperCase() : "";
      if (joined.includes("ROLE_ADMIN")) {
        localStorage.setItem("role", "admin");
        nav("/admin");
        return;
      }
      if (joined.includes("ROLE_EMPLOYEE") || joined.includes("ROLE_USER")) {
        localStorage.setItem("role", "employee");
        nav("/employee");
        return;
      }

      // final fallback: default to employee
      localStorage.setItem("role", "employee");
      nav("/employee");
    } catch (err: any) {
      console.error("Login error:", err);
      setError("Network error. Check backend or proxy configuration.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page center-screen">
      <div className="login-card" role="dialog" aria-labelledby="signin-title">
        <div className="left-panel" aria-hidden="true">
          <div className="brand-row">
            <div className="brand-icon">🏷️</div>
            <div>
              <h3 className="brand-title">DeskTrade</h3>
              <p className="brand-sub">Your Internal Employee Marketplace.</p>
            </div>
          </div>

          <div className="illustration">
            <img src={banner} alt="Team at desk" className="illustration-img" />
          </div>
        </div>

        <div className="right-panel">
          <div>
            <h1 className="page-title" id="signin-title">Sign In</h1>
            <p className="sub">Welcome back! Please enter your details.</p>
          </div>

          <form onSubmit={submit} className="login-form" aria-label="Login form">
            <label className="form-label">
              <div className="label-text">Email Address</div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                required
                className="form-input"
                aria-label="Email address"
              />
            </label>

            <label className="form-label">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="label-text">Password</div>
                <button
                  type="button"
                  className="link-button"
                  onClick={() => { /* placeholder: wire to Forgot password flow */ }}
                >
                  Forgot Password?
                </button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="form-input"
                  aria-label="Password"
                />
                <button
                  type="button"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  onClick={() => setShowPassword((s) => !s)}
                  className="eye-button"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </label>

            <div style={{ marginTop: 12 }}>
              <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%' }}>
                {loading ? 'Signing in...' : 'Log In'}
              </button>
            </div>

            {error && <div className="error" role="alert" style={{ marginTop: 12 }}>{error}</div>}

            <p className="help" style={{ marginTop: 16 }}>
              Need help? <a href="#" onClick={(e) => e.preventDefault()}>Contact Support</a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

