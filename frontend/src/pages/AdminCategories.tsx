// src/pages/AdminCategories.tsx
import React, { useEffect, useState, type JSX } from "react";
import {
  fetchAdminCategories,
  approveCategory,
  rejectCategory,
  deleteCategory,
  type Category as APICategory
} from "../services/api";
import NewCategory from "./NewCategory";
import "../styles/categories.css"; // use the dedicated categories stylesheet

type Category = APICategory & {
  id?: number | string;
  name?: string;
  description?: string | null;
  status?: string | null;
  createdAt?: string | null;
};

function normalizeList<T>(res: any): T[] {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if (res.content && Array.isArray(res.content)) return res.content;
  if (res.data && Array.isArray(res.data)) return res.data;
  return [];
}

export default function AdminCategories(): JSX.Element {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const [showNew, setShowNew] = useState<boolean>(false);

  const setItemLoading = (id: number | string, v: boolean) =>
    setLoadingMap(prev => ({ ...prev, [String(id)]: v }));

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res: any = await fetchAdminCategories();
      const cats = normalizeList<Category>(res).map((c: any, i: number) => ({
        id: c?.id ?? i,
        name: c?.name ?? `Category ${i + 1}`,
        description: c?.description ?? null,
        status: (c?.status ?? "PENDING").toString(),
        createdAt: c?.createdAt ?? c?.created_at ?? null,
        ...c,
      }));
      setCategories(cats);
    } catch (e: any) {
      console.error("Failed to load categories", e);
      setError(e?.data?.message ?? e?.message ?? "Failed to load categories");
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const onApprove = async (cat: Category) => {
    if (!cat?.id) return;
    if (!confirm(`Approve category "${cat.name}"?`)) return;
    setItemLoading(cat.id!, true);
    try {
      await approveCategory(Number(cat.id));
      setCategories(prev => prev.map(c => c.id === cat.id ? { ...c, status: "APPROVED" } : c));
    } catch (e: any) {
      console.error("approve failed", e);
      alert(e?.data?.message ?? e?.message ?? "Approve failed");
    } finally {
      setItemLoading(cat.id!, false);
    }
  };

  const onReject = async (cat: Category) => {
    if (!cat?.id) return;
    const reason = window.prompt(`Reason to reject "${cat.name}" (optional):`, "");
    if (reason === null) return;
    setItemLoading(cat.id!, true);
    try {
      await rejectCategory(Number(cat.id), reason || undefined);
      setCategories(prev => prev.map(c => c.id === cat.id ? { ...c, status: "REJECTED" } : c));
    } catch (e: any) {
      console.error("reject failed", e);
      alert(e?.data?.message ?? e?.message ?? "Reject failed");
    } finally {
      setItemLoading(cat.id!, false);
    }
  };

  const onDelete = async (cat: Category) => {
    if (!cat?.id) return;
    if (!confirm(`Delete category "${cat.name}" permanently?`)) return;
    setItemLoading(cat.id!, true);
    try {
      await deleteCategory(Number(cat.id));
      setCategories(prev => prev.filter(c => c.id !== cat.id));
    } catch (e: any) {
      console.error("delete failed", e);
      alert(e?.data?.message ?? e?.message ?? "Delete failed");
    } finally {
      setItemLoading(cat.id!, false);
    }
  };

  const pending = categories.filter(c => (c.status || "PENDING").toString().toUpperCase() === "PENDING");
  const approved = categories.filter(c => (c.status || "").toString().toUpperCase() === "APPROVED");
  const rejected = categories.filter(c => (c.status || "").toString().toUpperCase() === "REJECTED");

  return (
    <div className="categories-page">
      <header className="categories-topbar">
        <div>
          <h1 className="categories-title">Categories — Admin</h1>
          <p className="categories-sub">Approve, reject or delete categories submitted by users.</p>
        </div>

        <div className="categories-actions">
          <button className="categories-btn-primary" onClick={() => load()}>
            Refresh
          </button>

          <button
            className="categories-btn-secondary"
            onClick={() => setShowNew(true)}
            title="Add new category"
          >
            + Add New Category
          </button>
        </div>
      </header>

      {error && <div className="categories-error" role="alert">{error}</div>}

      {loading && <div className="categories-loading">Loading categories…</div>}

      {/* SUMMARY CARDS */}
      <div style={{ display: "flex", gap: 12, marginTop: 12, marginBottom: 8 }}>
        <div style={{ flex: 1 }} className="stat-card">
          <div style={{ fontWeight: 700 }}>Pending</div>
          <div style={{ fontSize: 22, marginTop: 8 }}>{pending.length}</div>
        </div>
        <div style={{ flex: 1 }} className="stat-card">
          <div style={{ fontWeight: 700 }}>Approved</div>
          <div style={{ fontSize: 22, marginTop: 8 }}>{approved.length}</div>
        </div>
        <div style={{ flex: 1 }} className="stat-card">
          <div style={{ fontWeight: 700 }}>Total</div>
          <div style={{ fontSize: 22, marginTop: 8 }}>{categories.length}</div>
        </div>
      </div>

      {/* PENDING SECTION */}
      <section className="categories-section" aria-labelledby="pending-heading">
        <div className="categories-section-title">
          <h2 id="pending-heading">Pending Categories</h2>
          <div className="count">{pending.length}</div>
        </div>

        {pending.length === 0 ? (
          <div className="categories-empty">No pending categories.</div>
        ) : (
          <div className="categories-grid">
            {pending.map(cat => {
              const busy = !!loadingMap[String(cat.id)];
              return (
                <article className="categories-card" key={String(cat.id)}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                    <div>
                      <div className="categories-card-title">{cat.name}</div>
                      <div className="categories-card-desc">{cat.description ?? "No description"}</div>
                      <div className="categories-card-date">{cat.createdAt ? new Date(cat.createdAt).toLocaleString() : "—"}</div>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end" }}>
                      <span className="categories-badge pending">PENDING</span>
                    </div>
                  </div>

                  <div className="categories-card-actions">
                    <button className="categories-btn" disabled={busy} onClick={() => onApprove(cat)}>
                      {busy ? "…" : "Approve"}
                    </button>

                    <button className="categories-btn-ghost" disabled={busy} onClick={() => onReject(cat)}>
                      {busy ? "…" : "Reject"}
                    </button>

                    <button className="categories-btn-ghost" style={{ background: "#fff5f5", borderColor: "rgba(239,68,68,0.06)" }} disabled={busy} onClick={() => onDelete(cat)}>
                      {busy ? "…" : "Delete"}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* APPROVED SECTION */}
      <section className="categories-section" aria-labelledby="approved-heading">
        <div className="categories-section-title">
          <h2 id="approved-heading">Approved Categories</h2>
          <div className="count">{approved.length}</div>
        </div>

        {approved.length === 0 ? (
          <div className="categories-empty">No approved categories yet.</div>
        ) : (
          <div className="categories-grid">
            {approved.map(cat => {
              const busy = !!loadingMap[String(cat.id)];
              return (
                <article className="categories-card" key={String(cat.id)}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                    <div>
                      <div className="categories-card-title">{cat.name}</div>
                      <div className="categories-card-desc">{cat.description ?? "No description"}</div>
                      <div className="categories-card-date">{cat.createdAt ? new Date(cat.createdAt).toLocaleString() : "—"}</div>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end" }}>
                      <span className="categories-badge approved">APPROVED</span>
                    </div>
                  </div>

                  <div className="categories-card-actions">
                    <button className="categories-btn" onClick={() => alert(`View ${cat.name}`)}>
                      View
                    </button>

                    <button className="categories-btn-ghost" disabled={busy} onClick={() => onDelete(cat)}>
                      {busy ? "…" : "Delete"}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* REJECTED SECTION (optional) */}
      {rejected.length > 0 && (
        <section className="categories-section" aria-labelledby="rejected-heading">
          <div className="categories-section-title">
            <h2 id="rejected-heading">Rejected Categories</h2>
            <div className="count">{rejected.length}</div>
          </div>

          <div className="categories-grid">
            {rejected.map(cat => (
              <article className="categories-card" key={String(cat.id)}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                  <div>
                    <div className="categories-card-title">{cat.name}</div>
                    <div className="categories-card-desc">{cat.description ?? "No description"}</div>
                    <div className="categories-card-date">{cat.createdAt ? new Date(cat.createdAt).toLocaleString() : "—"}</div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end" }}>
                    <span className="categories-badge rejected">REJECTED</span>
                  </div>
                </div>

                <div className="categories-card-actions">
                  <button className="categories-btn" onClick={() => alert(`View ${cat.name}`)}>View</button>
                  <button className="categories-btn-ghost" disabled={!!loadingMap[String(cat.id)]} onClick={() => onDelete(cat)}>Delete</button>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* Add New Category modal */}
      {showNew && (
        <div className="categories-modal-overlay" role="dialog" aria-modal="true">
          <div className="categories-modal">
            <NewCategory
              onClose={() => setShowNew(false)}
              onSuccess={(created) => {
                setShowNew(false);
                // prefer reloading to keep server-state authoritative
                load();
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
