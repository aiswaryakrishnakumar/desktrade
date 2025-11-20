// src/pages/NewCategory.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";
import { createCategory, approveCategory } from "../services/api";

export default function NewCategory() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Category name is required");
      return;
    }

    setSubmitting(true);

    try {
      // 1. Create category (backend sets status = PENDING)
      const payload = {
        name: name.trim(),
        description: description.trim() || null,
      };

      const created: any = await createCategory(payload);

      // Extract new category ID
      const newId =
        created?.id || created?.data?.id || created?.categoryId || null;

      // 2. Auto-approve because ADMIN is creating it
      if (newId) {
        await approveCategory(newId);
      }

      // 3. Redirect to categories list
      navigate("/admin/categories");
    } catch (err: any) {
      console.error("Category creation failed:", err);
      setError(err?.message || "Failed to create category");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="admin-root">
      <main className="admin-main">
        <header className="admin-topbar">
          <h1 className="admin-title">Create New Category</h1>
          <p className="admin-sub">
            Enter details below to add a new category to the marketplace.
          </p>
        </header>

        <section className="panel" style={{ maxWidth: 800, padding: 20 }}>
          <form onSubmit={handleSubmit}>
            {/* NAME */}
            <div style={{ marginBottom: 16 }}>
              <label className="form-label">Category Name</label>
              <input
                className="form-input"
                placeholder="e.g., Office Electronics"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <div className="hint">A unique name that identifies this category.</div>
            </div>

            {/* DESCRIPTION */}
            <div style={{ marginBottom: 16 }}>
              <label className="form-label">Description</label>
              <textarea
                className="form-textarea"
                rows={4}
                placeholder="Describe what items belong to this category"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <div className="hint">
                A short, meaningful summary for marketplace users.
              </div>
            </div>

            {/* ACTIONS */}
            <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting}
              >
                {submitting ? "Creating…" : "Create Category"}
              </button>

              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => navigate("/admin/categories")}
              >
                Cancel
              </button>
            </div>

            {/* ERROR */}
            {error && (
              <div className="error" style={{ marginTop: 16 }}>
                {error}
              </div>
            )}
          </form>
        </section>
      </main>
    </div>
  );
}
