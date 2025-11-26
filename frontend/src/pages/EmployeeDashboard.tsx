
// src/pages/EmployeeDashboard.tsx
import React, { useEffect, useState } from "react";
import ItemCard from "../components/ItemCard";
import UploadForm from "../components/UploadForm";
import BookingsDrawer from "../components/BookingsDrawer";
import NewCategory from "../pages/NewCategory";
import { api, createOrder, fetchMyOrders } from "../services/api";
import "../styles/employee.css";

function parseJwt(token: string | null) {
  if (!token) return null;
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
}

export default function EmployeeDashboard() {
  const [items, setItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState("");
  const [loading, setLoading] = useState(false);

  const [bookings, setBookings] = useState<any[]>([]);
  const [openBookings, setOpenBookings] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [sortBy, setSortBy] = useState<"recent" | "price-asc" | "price-desc">("recent");

  // New: modal control for Add Category
  const [showAddCategory, setShowAddCategory] = useState(false);

  const token = localStorage.getItem("token");
  const me = parseJwt(token);

  useEffect(() => {
    if (!token) return;
    fetchCategories();
    fetchItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-hide toasts
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError(null);
        setSuccess(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  async function fetchCategories() {
    try {
      const res = await api("/categories");
      let arr: any[] = [];
      if (Array.isArray(res)) arr = res;
      else if (res?.content && Array.isArray(res.content)) arr = res.content;
      else if (res?.data && Array.isArray(res.data)) arr = res.data;
      else arr = [];
      setCategories(arr);
    } catch (e) {
      console.error("fetchCategories error:", e);
      setError("Failed to load categories");
      setCategories([]);
    }
  }

  async function fetchItems() {
    setLoading(true);
    try {
      const q: string[] = [];
      if (search) q.push(`search=${encodeURIComponent(search)}`);
      if (cat) q.push(`category=${encodeURIComponent(cat)}`);
      q.push("status=approved"); // only approved items

      const qs = q.length ? `?${q.join("&")}` : "";
      const res = await api(`/items${qs}`);

      let arr: any[] = [];
      if (!res) arr = [];
      else if (Array.isArray(res)) arr = res;
      else if (res.content && Array.isArray(res.content)) arr = res.content;
      else if (res.data && Array.isArray(res.data)) arr = res.data;
      else arr = [];

      setItems(arr);
    } catch (err: any) {
      console.error("fetchItems error:", err);
      setError(err?.message || "Failed loading items");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  // Use createOrder helper
  async function bookItem(id: number) {
    try {
      await createOrder({ itemId: id });
      setSuccess("Item booked successfully");
      // refresh bookings
      await loadBookings();
      // remove item locally (so it disappears)
      setItems(prev => prev.filter(i => i.id !== id));
    } catch (err: any) {
      console.error("bookItem error:", err);
      setError(err?.data?.message || err?.message || "Booking failed");
    }
  }

  async function loadBookings() {
    try {
      const res = await fetchMyOrders();
      // normalize
      let arr: any[] = [];
      if (Array.isArray(res)) arr = res;
      else if (res?.content && Array.isArray(res.content)) arr = res.content;
      else if (res?.data && Array.isArray(res.data)) arr = res.data;
      else arr = [];

      setBookings(arr);
      setOpenBookings(true);
    } catch (err) {
      console.error("loadBookings error:", err);
      setError("Failed to load bookings");
    }
  }

  async function deleteItem(id: number) {
    if (!confirm("Delete this item?")) return;
    try {
      await api(`/items/${id}`, { method: "DELETE" });
      setItems(prev => prev.filter(i => i.id !== id));
      setSuccess("Item deleted");
    } catch (err: any) {
      setError(err?.message || "Delete failed");
    }
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    window.location.href = "/login";
  }

  if (!token) {
    window.location.href = "/login";
    return null;
  }

  // client-side filter: remove items with availability 0
  const visibleItems = (items ?? []).filter(i => {
    const available = i?.availableQuantity ?? i?.quantity ?? 0;
    return Number(available) > 0;
  });

  // client-side sort
  const sortedItems = [...visibleItems].sort((a: any, b: any) => {
    if (sortBy === "price-asc") {
      return Number(a.price ?? 0) - Number(b.price ?? 0);
    }
    if (sortBy === "price-desc") {
      return Number(b.price ?? 0) - Number(a.price ?? 0);
    }
    // recent by createdAt or id fallback
    const atA = a?.createdAt ? new Date(a.createdAt).getTime() : (a.id ?? 0);
    const atB = b?.createdAt ? new Date(b.createdAt).getTime() : (b.id ?? 0);
    return atB - atA;
  });

  // when clicking category chip
  function onSelectCategoryChip(c: any) {
    const idOrName = c?.id ?? (c?.name ?? String(c));
    setCat(String(idOrName));
    // reload
    fetchItems();
  }

  // skeleton cards while loading
  function SkeletonGrid() {
    const placeholders = new Array(6).fill(0);
    return (
      <div className="employee-grid">
        {placeholders.map((_, idx) => (
          <div key={idx} className="employee-item">
            <div className="skeleton-card">
              <div className="skeleton-header" />
              <div className="skeleton-text" />
              <div className="skeleton-meta" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="employee-page">
      {/* Floating toasts */}
      <div style={{ position: "fixed", right: 18, top: 18, zIndex: 1200 }}>
        {error && <div className="toast toast-error">{error}</div>}
        {success && <div className="toast toast-success">{success}</div>}
      </div>

      <header className="employee-header">
        <div className="employee-title-wrap">
          <h1 className="employee-title">Employee Dashboard</h1>
          <p className="employee-sub">Welcome, {me?.name || "Employee"}</p>
        </div>

        <div className="employee-actions">
          {/* Replaced "My Bookings" with Add New Category button */}
          <button
            className="employee-btn employee-btn-outline"
            onClick={() => setShowAddCategory(true)}
            title="Add new category"
          >
            + Add Category
          </button>

          <button className="employee-btn employee-btn-outline" onClick={logout}>
            Logout
          </button>
        </div>
      </header>

      <main className="employee-main">
        <section className="employee-left">
          <div className="employee-searchbar" style={{ alignItems: "center" }}>
            <input className="employee-input" placeholder="Search items..." value={search} onChange={(e) => setSearch(e.target.value)} />
            <select className="employee-select" value={cat} onChange={(e) => { setCat(e.target.value); }}>
              <option value="">All Categories</option>
              {(Array.isArray(categories) ? categories : []).map((c: any) => (
                <option key={c.id ?? c.name} value={c.id ?? c.name}>{c.name ?? String(c)}</option>
              ))}
            </select>

            <select className="employee-select" value={sortBy} onChange={(e) => setSortBy(e.target.value as any)}>
              <option value="recent">Sort: Recent</option>
              <option value="price-asc">Sort: Price (low → high)</option>
              <option value="price-desc">Sort: Price (high → low)</option>
            </select>

            <button onClick={fetchItems} className="employee-btn employee-btn-primary">Search</button>
          </div>

          {/* Category chips quick-filter */}
          <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button className={`chip ${cat === "" ? "chip-active" : ""}`} onClick={() => { setCat(""); fetchItems(); }}>All</button>
            {(Array.isArray(categories) ? categories : []).slice(0, 10).map((c: any) => (
              <button
                key={c.id ?? c.name}
                className={`chip ${String(c.id ?? c.name) === String(cat) ? "chip-active" : ""}`}
                onClick={() => onSelectCategoryChip(c)}
              >
                {c.name ?? String(c)}
              </button>
            ))}
          </div>

          {loading ? (
            <div style={{ marginTop: 18 }}>
              <SkeletonGrid />
            </div>
          ) : (
            <div style={{ marginTop: 18 }}>
              {sortedItems.length === 0 ? (
                <div className="employee-empty">No items found.</div>
              ) : (
                <div className="employee-grid">
                  {sortedItems.map((i: any) => (
                    <div key={i.id} className="employee-item">
                      <ItemCard
                        item={i}
                        onBook={bookItem}
                        showView={false}
                        showDelete={false}
                        onDelete={deleteItem}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>

        <aside className="employee-aside">
          <div className="employee-upload-card">
            <h3 className="employee-upload-title">Upload New Item</h3>
            <UploadForm
              categories={Array.isArray(categories) ? categories : []}
              onCreated={(newItem) => {
                // add to top only if it has availability > 0 and approved (or whatever your logic)
                setItems(prev => [newItem, ...prev]);
                setSuccess("Item uploaded");
              }}
            />
          </div>
        </aside>
      </main>

      {/* Add Category modal - reuses your NewCategory component */}
      {showAddCategory && (
        <div className="categories-modal-overlay" role="dialog" aria-modal="true" style={{
          position: "fixed", inset: 0, background: "rgba(8,6,12,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999
        }}>
          <div className="categories-modal" style={{ width: 640, maxWidth: "94%", padding: 20, borderRadius: 12 }}>
            <NewCategory
              onClose={() => setShowAddCategory(false)}
              onSuccess={(created) => {
                // refresh categories and items so the new category shows in selects and listing
                setShowAddCategory(false);
                fetchCategories();
                // optionally refetch items if you want newly-added category to be considered
                fetchItems();
                // small success toast
                setSuccess(created?.name ? `Category "${created.name}" created` : "Category created");
              }}
            />
          </div>
        </div>
      )}

      <BookingsDrawer open={openBookings} bookings={bookings} onClose={() => setOpenBookings(false)} />
    </div>
  );
}
