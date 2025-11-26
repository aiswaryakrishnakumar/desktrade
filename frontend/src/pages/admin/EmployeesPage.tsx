// src/pages/admin/EmployeesPage.tsx
import { useEffect, useState, type JSX } from "react";
import { fetchEmployees, deleteEmployee } from "../../services/api";
import type { Employee } from "../../services/api";
import AppLayout from "../../layouts/AppLayout";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

export default function EmployeesPage(): JSX.Element {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | number | null>(null);

  async function load() {
    setLoading(true);
    try {
      const res = await fetchEmployees();
      setEmployees(Array.isArray(res) ? res : []);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load employees");
    } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  async function onDelete(id?: number | string) {
    if (!id) return;
    if (!confirm("Delete employee?")) return;
    setDeletingId(id);
    try {
      await deleteEmployee(id);
      toast.success("Deleted");
      await load();
    } catch (e) {
      console.error(e);
      toast.error("Delete failed");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <AppLayout>
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold">Employees</h1>
            <p className="text-sm text-slate-500 mt-1">View and manage employee accounts.</p>
          </div>

          <div>
            <Link to="/admin/employees/new" className="btn btn-primary">Add Employee</Link>
          </div>
        </div>

        {loading ? (
          <div className="p-6 bg-white rounded shadow">Loading…</div>
        ) : employees.length === 0 ? (
          <div className="p-6 bg-white rounded shadow">No employees found.</div>
        ) : (
          <div className="bg-white rounded-2xl shadow p-4">
            <table className="w-full text-left">
              <thead className="text-sm text-slate-500">
                <tr>
                  <th className="py-2">Name</th>
                  <th className="py-2">Email</th>
                  <th className="py-2">Role</th>
                  <th className="py-2">Created</th>
                  <th className="py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {employees.map(emp => (
                  <tr key={String(emp.id)} className="border-t">
                    <td className="py-3 font-medium">{emp.name ?? `#${String(emp.id)}`}</td>
                    <td className="py-3">{emp.email ?? "—"}</td>
                    <td className="py-3">{emp.role ?? "—"}</td>
                    <td className="py-3 text-sm text-slate-500">{(emp as any).createdAt ? new Date((emp as any).createdAt).toLocaleString() : "—"}</td>
                    <td className="py-3 text-right">
                      <Link to={`/admin/employees/${emp.id}`} className="px-3 py-1 border rounded text-sm mr-2">View</Link>
                      <Link to={`/admin/employees/${emp.id}/edit`} className="px-3 py-1 border rounded text-sm mr-2">Edit</Link>
                      <button className="px-3 py-1 rounded border text-sm" onClick={() => onDelete(emp.id)} disabled={deletingId === emp.id}>
                        {deletingId === emp.id ? "Deleting…" : "Delete"}
                      </button>
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
