// src/pages/admin/DashboardHome.tsx
import { useEffect, useState, type JSX } from "react";
import { getOverview, fetchPendingItems } from "../../services/api";
import type { Overview } from "../../services/api";

export default function DashboardHome(): JSX.Element {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const o = await getOverview().catch(() => null);
        if (!mounted) return;
        setOverview(o);
      } catch (err) {
        console.error(err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Seller Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">Overview of your items and sales.</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-2xl shadow">
          <div className="text-sm text-slate-500">Pending Approval</div>
          <div className="text-xl font-bold mt-2">{overview?.pending ?? "—"}</div>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow">
          <div className="text-sm text-slate-500">Total Items</div>
          <div className="text-xl font-bold mt-2">{overview?.totalItems ?? "—"}</div>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow">
          <div className="text-sm text-slate-500">Total Sales</div>
          <div className="text-xl font-bold mt-2">${overview?.totalSales ?? "—"}</div>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow">
          <div className="text-sm text-slate-500">Employees</div>
          <div className="text-xl font-bold mt-2">{overview?.totalEmployees ?? "—"}</div>
        </div>
      </div>

      <section className="bg-white rounded-2xl shadow p-4">
        <h3 className="text-lg font-semibold mb-4">Recent Items Pending</h3>
        {/* placeholder: fetch small list */}
        <div className="text-sm text-slate-500">
          {/* We'll render a small list here in next iteration */}
          <div>Loading recent pending items...</div>
        </div>
      </section>
    </div>
  );
}
