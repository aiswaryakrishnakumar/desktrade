// src/pages/NewEmployee.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";
import { createEmployee } from "../services/api";

type CreateEmployeePayload = {
  name: string;
  email: string;
  password: string;
  role?: string;
  roles?: string[];
  department?: string;
};

export default function NewEmployee() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("employee");
  const [department, setDepartment] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Normalize role helpers
  const normalizeRoleForRoleField = (r?: string) => {
    if (!r) return undefined;
    return r.toString().trim().toLowerCase();
  };

  const normalizeRoleForRolesArray = (r?: string) => {
    if (!r) return undefined;
    return [r.toString().trim().toUpperCase()];
  };

  const submit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);

    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("Name, Email, and Password are required");
      return;
    }

    setLoading(true);

    try {
      const normalizedRoleLower = normalizeRoleForRoleField(role || "employee");
      const normalizedRolesUpper = normalizeRoleForRolesArray(role || "employee");

      const payload: CreateEmployeePayload = {
        name: name.trim(),
        email: email.trim(),
        password,
        role: normalizedRoleLower, // backend expects lowercase role field (e.g. 'employee')
        roles: normalizedRolesUpper, // and roles array uppercase (e.g. ['EMPLOYEE'])
        department: department?.trim() || undefined,
      };

      // call API
      await createEmployee(payload as any);

      // navigate back to list
      navigate("/admin/employees");
    } catch (err: any) {
      console.error("Error creating employee:", err);
      const msg = err?.body?.message || err?.message || "Failed to create employee";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-root">
      <main className="admin-main">
        <header className="admin-topbar">
          <h1 className="admin-title">Add Employee</h1>
          <p className="admin-sub">Create a new employee account.</p>
        </header>

        <section className="panel" style={{ maxWidth: 700 }}>
          <form onSubmit={submit} style={{ padding: 18 }}>
            <div style={{ marginBottom: 12 }}>
              <label className="form-label">Full Name</label>
              <input
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
              />
            </div>

            <div style={{ marginBottom: 12 }}>
              <label className="form-label">Email</label>
              <input
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@example.com"
              />
            </div>

            <div style={{ marginBottom: 12 }}>
              <label className="form-label">Password</label>
              <input
                className="form-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
              />
            </div>

            <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
              <div style={{ flex: 1 }}>
                <label className="form-label">Department</label>
                <input
                  className="form-input"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="IT, Sales..."
                />
              </div>

              <div style={{ width: 180 }}>
                <label className="form-label">Role</label>
                <select
                  className="form-input"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option value="employee">Employee</option>
                  <option value="admin">Admin</option>
                  <option value="seller">Seller</option>
                </select>
              </div>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn btn-primary" disabled={loading}>
                {loading ? "Creating…" : "Create"}
              </button>
              <button
                className="btn btn-ghost"
                type="button"
                onClick={() => navigate("/admin/employees")}
              >
                Cancel
              </button>
            </div>

            {error && <div className="error" style={{ marginTop: 12 }}>{error}</div>}
          </form>
        </section>
      </main>
    </div>
  );
}
