// src/pages/Categories.tsx
import React, { useEffect, useState, type JSX } from 'react';
import { Link } from 'react-router-dom';
import "../styles/categories.css";

import { fetchAdminCategories, rejectCategory } from '../services/api';
import type { Category } from '../services/api';

export default function CategoriesPage(): JSX.Element {
  const [cats, setCats] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState<string | number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res: any = await fetchAdminCategories();
      const raw = Array.isArray(res) ? res : res?.content || res?.data || res;

      const normalized = Array.isArray(raw)
        ? raw.map((c: any, i: number) => ({
            id: c?.id ?? i,
            name: c?.name ?? `Category ${i}`,
            description: c?.description,
            status: c?.status,
            createdAt: c?.createdAt,
          }))
        : [];

      setCats(normalized);
    } catch (err: any) {
      console.error(err);
      setError("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const onReject = async (id: any) => {
    if (!confirm("Reject this category?")) return;
    setBusyId(id);
    try {
      await rejectCategory(id);
      await load();
    } catch (err: any) {
      setError(err.message || "Reject failed");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="categories-page">
      {/* HEADER */}
      <header className="categories-topbar">
        <div>
          <h1 className="categories-title">Categories</h1>
          <p className="categories-sub">Manage categories in the marketplace.</p>
        </div>

        <Link to="/admin/categories/new" className="categories-btn-primary">
          + Create Category
        </Link>
      </header>

      {/* ERROR */}
      {error && <div className="categories-error">{error}</div>}

      {loading && <div className="categories-loading">Loading categories…</div>}

      {!loading && cats.length === 0 && (
        <div className="categories-empty">No categories found.</div>
      )}

      {/* TILES */}
      <div className="categories-section">
        <h2 className="categories-section-title">Pending Categories</h2>
        <div className="categories-grid">
          {cats
            .filter((c) => (c.status || "").toLowerCase() === "pending")
            .map((c) => (
              <div className="categories-card" key={c.id}>
                <h3 className="categories-card-title">{c.name}</h3>
                <p className="categories-card-desc">{c.description || "No description"}</p>
                <p className="categories-card-date">
                  {c.createdAt ? new Date(c.createdAt).toLocaleString() : "—"}
                </p>

                <div className="categories-card-actions">
                  <Link className="categories-btn" to={`/admin/categories/${c.id}`}>
                    View
                  </Link>

                  <button
                    className="categories-btn-ghost"
                    disabled={busyId === c.id}
                    onClick={() => onReject(c.id)}
                  >
                    {busyId === c.id ? "..." : "Reject"}
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>

      <div className="categories-section">
        <h2 className="categories-section-title">Approved Categories</h2>
        <div className="categories-grid">
          {cats
            .filter((c) => (c.status || "").toLowerCase() === "approved")
            .map((c) => (
              <div className="categories-card" key={c.id}>
                <h3 className="categories-card-title">{c.name}</h3>
                <p className="categories-card-desc">{c.description || "No description"}</p>
                <p className="categories-card-date">
                  {c.createdAt ? new Date(c.createdAt).toLocaleString() : "—"}
                </p>

                <div className="categories-card-actions">
                  <Link className="categories-btn" to={`/admin/categories/${c.id}`}>
                    View
                  </Link>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
