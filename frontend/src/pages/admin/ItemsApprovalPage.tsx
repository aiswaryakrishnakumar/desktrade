// src/pages/admin/ItemsApprovalPage.tsx
import { useEffect, useState, type JSX } from "react";
import { fetchPendingItems, approveItem, rejectItem } from "../../services/api";
import type { Item } from "../../services/api";
import AppLayout from "../../layouts/AppLayout";
import toast from "react-hot-toast";

function categoryName(c: Item["category"]): string {
  if (c == null) return "Uncategorized";
  if (typeof c === "string") return c;
  return (c as any).name ?? String((c as any).id ?? "Uncategorized");
}

export default function ItemsApprovalPage(): JSX.Element {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});

  const setBusy = (id: any, v: boolean) => setActionLoading(prev => ({ ...prev, [String(id)]: v }));

  async function load() {
    setLoading(true);
    try {
      const res = await fetchPendingItems();
      setItems(Array.isArray(res) ? res : []);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load pending items");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function onApprove(id?: number | string) {
    if (id == null) return;
    setBusy(id, true);
    try {
      await approveItem(id);
      setItems(prev => prev.filter(t => String(t.id) !== String(id)));
      toast.success("Item approved");
    } catch (e) {
      console.error(e);
      toast.error("Approve failed");
    } finally {
      setBusy(id, false);
    }
  }

  async function onReject(id?: number | string) {
    if (id == null) return;
    const reason = window.prompt("Reason for rejection (optional):", "");
    if (reason === null) return;
    setBusy(id, true);
    try {
      await rejectItem(id, reason ? { reason } : undefined);
      setItems(prev => prev.filter(t => String(t.id) !== String(id)));
      toast.success("Item rejected");
    } catch (e) {
      console.error(e);
      toast.error("Reject failed");
    } finally {
      setBusy(id, false);
    }
  }

  return (
    <AppLayout>
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold">Item Approvals</h1>
            <p className="text-sm text-slate-500 mt-1">Approve or reject items submitted by employees/sellers.</p>
          </div>
          <div>
            <button className="btn" onClick={load} disabled={loading}>Refresh</button>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white p-4 rounded-2xl shadow animate-pulse">
                <div className="h-6 bg-slate-200 rounded w-2/3 mb-3" />
                <div className="h-4 bg-slate-200 rounded w-1/2 mb-2" />
                <div className="h-4 bg-slate-200 rounded w-3/4" />
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="p-6 bg-white rounded-2xl shadow">No pending items.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map(i => (
              <article key={String(i.id)} className="bg-white rounded-2xl shadow p-4 flex flex-col">
                <div className="flex gap-4">
                  <div className="w-28 h-20 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                    {i.thumbnail ? (
                      <img src={i.thumbnail} alt={i.title ?? String(i.id)} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-sm text-slate-400">No image</div>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="text-lg font-semibold">{i.title ?? `#${String(i.id)}`}</div>
                    <div className="text-sm text-slate-500">{categoryName(i.category)}</div>
                    <div className="text-xs text-slate-400 mt-2">{i.createdAt ? new Date(i.createdAt).toLocaleString() : "—"}</div>

                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={() => onApprove(i.id)}
                        disabled={!!actionLoading[String(i.id)]}
                        className="px-3 py-1 rounded bg-emerald-600 text-white"
                      >
                        {actionLoading[String(i.id)] ? "…" : "Approve"}
                      </button>

                      <button
                        onClick={() => onReject(i.id)}
                        disabled={!!actionLoading[String(i.id)]}
                        className="px-3 py-1 rounded bg-rose-600 text-white"
                      >
                        {actionLoading[String(i.id)] ? "…" : "Reject"}
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
