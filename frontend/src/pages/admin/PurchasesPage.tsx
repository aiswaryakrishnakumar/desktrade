// src/pages/admin/PurchasesPage.tsx
import { useEffect, useState, type JSX } from "react";
import { fetchAllOrders, updateOrderStatus } from "../../services/api";
import type { Order } from "../../services/api";
import AppLayout from "../../layouts/AppLayout";
import toast from "react-hot-toast";

export default function PurchasesPage(): JSX.Element {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await fetchAllOrders();
      setOrders(Array.isArray(res) ? res : []);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load orders");
    } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  async function onUpdateStatus(id?: number | string, status?: string) {
    if (!id || !status) return;
    try {
      await updateOrderStatus(id, status);
      toast.success("Status updated");
      await load();
    } catch (e) {
      console.error(e);
      toast.error("Update failed");
    }
  }

  return (
    <AppLayout>
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold">Purchases / Orders</h1>
            <p className="text-sm text-slate-500 mt-1">View and update order statuses.</p>
          </div>
          <div>
            <button className="btn" onClick={load} disabled={loading}>Refresh</button>
          </div>
        </div>

        {loading ? (
          <div className="p-6 bg-white rounded shadow">Loading…</div>
        ) : orders.length === 0 ? (
          <div className="p-6 bg-white rounded shadow">No orders found.</div>
        ) : (
          <div className="bg-white rounded-2xl shadow p-4 overflow-auto">
            <table className="w-full text-left">
              <thead className="text-sm text-slate-500">
                <tr>
                  <th className="py-2">Order</th>
                  <th className="py-2">Item</th>
                  <th className="py-2">Buyer</th>
                  <th className="py-2">Amount</th>
                  <th className="py-2">Created</th>
                  <th className="py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(o => (
                  <tr key={String(o.id)} className="border-t align-top">
                    <td className="py-3">#{String(o.id)}</td>
                    <td className="py-3">{o.itemTitle ?? "—"}</td>
                    <td className="py-3">{o.buyerName ?? "—"}</td>
                    <td className="py-3">{o.amount != null ? `$${o.amount}` : "—"}</td>
                    <td className="py-3 text-sm text-slate-500">{o.createdAt ? new Date(o.createdAt).toLocaleString() : "—"}</td>
                    <td className="py-3 text-right">
                      <div className="inline-flex gap-2">
                        <button className="px-3 py-1 rounded bg-indigo-600 text-white" onClick={() => onUpdateStatus(o.id, "SHIPPED")}>Mark Shipped</button>
                        <button className="px-3 py-1 rounded border" onClick={() => onUpdateStatus(o.id, "CANCELLED")}>Cancel</button>
                      </div>
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
