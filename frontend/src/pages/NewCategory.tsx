// src/pages/NewCategory.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";
import { createCategory, approveCategory } from "../services/api";

export default function NewCategory() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!name.trim()) {
      setError("Category name is required.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        description: description.trim() || null,
      };

      // Create category (backend usually creates PENDING)
      const created: any = await createCategory(payload);

      // Try to auto-approve (admin-created)
      const createdId = created?.id || created?.data?.id || created?.categoryId || null;
      if (createdId) {
        try {
          await approveCategory(createdId);
        } catch (e) {
          // non-fatal: approval failed — category still created
          console.warn("Auto-approve failed:", e);
        }
      }

      setSuccess("Category created successfully.");
      // small delay so user sees success briefly
      setTimeout(() => navigate("/admin/categories"), 700);
    } catch (err: any) {
      console.error("Create category error:", err);
      const msg = err?.body?.message || err?.message || "Failed to create category";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-shell">
      <div className="panel card centered-card">
        <div className="card-grid">
          {/* Left column - decorative / helpful text */}
          <aside className="card-side">
            <div className="brand">
              <div className="brand-icon">🏷️</div>
              <div>
                <h2 className="brand-title">DeskTrade</h2>
                <div className="brand-sub">Admin • Category Management</div>
              </div>
            </div>

            <div className="side-info">
              <h3>Create a category</h3>
              <p className="muted">
                Categories help organize marketplace listings. Add a clear name and a short description so users can find items easily.
              </p>
              <ul className="tips">
                <li>Use short, descriptive names</li>
                <li>Keep descriptions under 200 characters</li>
                <li>Admin-created categories are auto-approved</li>
              </ul>
            </div>
          </aside>

          {/* Right column - form */}
          <main className="card-main">
            <h1 className="page-title">Create New Category</h1>
            <p className="page-sub">Enter details below to add a new category to the marketplace.</p>

            <form onSubmit={handleSubmit} className="category-form" aria-labelledby="create-category">
              <label className="form-label" htmlFor="cat-name">Category Name</label>
              <input
                id="cat-name"
                className="form-input"
                placeholder="e.g., Office Electronics"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={100}
                required
              />
              <div className="hint">A unique name that identifies this category.</div>

              <label className="form-label" htmlFor="cat-desc" style={{ marginTop: 12 }}>Description</label>
              <textarea
                id="cat-desc"
                className="form-textarea"
                rows={4}
                placeholder="Describe what items belong to this category."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={500}
              />

              <div className="action-row">
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? "Creating…" : "Create Category"}
                </button>
                <button type="button" className="btn btn-ghost" onClick={() => navigate("/admin/categories")} disabled={submitting}>
                  Cancel
                </button>
              </div>

              {error && <div role="alert" className="error" style={{ marginTop: 12 }}>{error}</div>}
              {success && <div role="status" className="success" style={{ marginTop: 12 }}>{success}</div>}
            </form>
          </main>
        </div>
      </div>
    </div>
  );
}
