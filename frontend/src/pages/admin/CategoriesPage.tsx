// src/pages/admin/CategoriesPage.tsx
import { useEffect, useState, type JSX } from "react";
import { fetchAdminCategories, approveCategory, rejectCategory, createCategory, deleteCategory } from "../../services/api";
import type { Category } from "../../services/api";
import AppLayout from "../../layouts/AppLayout";
import toast from "react-hot-toast";

export default function CategoriesPage(): JSX.Element {
  const [cats, setCats] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");

  async function load() {
    setLoading(true);
    try {
      const res = await fetchAdminCategories();
      setCats(Array.isArray(res) ? res : []);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load categories");
    } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  async function onCreate() {
    if (!newName.trim()) return toast.error("Name required");
    setCreating(true);
    try {
      const created = await createCategory({ name: newName.trim() });
      toast.success("Category created");
      setNewName("");
      await load();
    } catch (e) {
      console.error(e);
      toast.error("Create failed");
    } finally { setCreating(false); }
  }

  async function onApprove(id?: number | string) {
    if (!id) return;
    try {
      await approveCategory(id);
      toast.success("Approved");
      await load();
    } catch (e) { console.error(e); toast.error("Approve failed"); }
  }

  async function onReject(id?: number | string) {
    if (!id) return;
    if (!confirm("Reject category?")) return;
    try {
      await rejectCategory(id);
      toast.success("Rejected");
      await load();
    } catch (e) { console.error(e); toast.error("Reject failed"); }
  }

  async function onDelete(id?: number | string) {
    if (!id) return;
    if (!confirm("Delete category? This cannot be undone.")) return;
    try {
      await deleteCategory(id);
      toast.success("Deleted");
      await load();
    } catch (e) { console.error(e); toast.error("Delete failed"); }
  }

  return (
    <AppLayout>
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold">Categories</h1>
            <p className="text-sm text-slate-500 mt-1">Create and moderate categories.</p>
          </div>

          <div className="flex items-center gap-2">
            <input value={newName} onChange={(e) => setNewName(e.target.value)} className="px-3 py-2 rounded border bg-white text-sm" placeholder="New category name" />
            <button className="btn btn-primary" onClick={onCreate} disabled={creating}>{creating ? "Creating…" : "Create"}</button>
          </div>
        </div>

        {loading ? (
          <div className="p-6 bg-white rounded shadow">Loading…</div>
        ) : cats.length === 0 ? (
          <div className="p-6 bg-white rounded shadow">No categories found.</div>
        ) : (
          <div className="bg-white rounded-2xl shadow p-4">
            <table className="w-full text-left">
              <thead className="text-sm text-slate-500">
                <tr>
                  <th className="py-2">Name</th>
                  <th className="py-2">Status</th>
                  <th className="py-2">Created</th>
                  <th className="py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {cats.map(c => (
                  <tr key={String(c.id)} className="border-t">
                    <td className="py-3 font-medium">{c.name}</td>
                    <td className="py-3">{String(c.status || "—").toUpperCase()}</td>
                    <td className="py-3 text-sm text-slate-500">{c.createdAt ? new Date(c.createdAt).toLocaleString() : "—"}</td>
                    <td className="py-3 text-right">
                      {String((c.status || "").toLowerCase()) === "pending" && (
                        <>
                          <button className="px-3 py-1 rounded bg-emerald-600 text-white mr-2" onClick={() => onApprove(c.id)}>Approve</button>
                          <button className="px-3 py-1 rounded bg-rose-600 text-white mr-2" onClick={() => onReject(c.id)}>Reject</button>
                        </>
                      )}
                      <button className="px-3 py-1 rounded border text-sm" onClick={() => onDelete(c.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
