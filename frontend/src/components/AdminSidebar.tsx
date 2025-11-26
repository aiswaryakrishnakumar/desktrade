// src/components/AdminSidebar.tsx
import { NavLink } from "react-router-dom";
import { FiHome, FiUsers, FiTag, FiList, FiShoppingCart, FiFileText } from "react-icons/fi";
import type { JSX } from "react";

const nav = [
  { to: "/admin", label: "Dashboard", icon: <FiHome /> },
  { to: "/admin/employees", label: "Employees", icon: <FiUsers /> },
  { to: "/admin/categories", label: "Categories", icon: <FiTag /> },
  { to: "/admin/items", label: "Item Approvals", icon: <FiList /> },
  { to: "/admin/purchases", label: "Purchases", icon: <FiShoppingCart /> },
  { to: "/admin/orders", label: "Orders", icon: <FiFileText /> },
];

export default function AdminSidebar(): JSX.Element {
  return (
    <aside className="w-64 bg-white border-r min-h-screen p-4 sticky top-0">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-indigo-600">DeskTrade</h2>
        <div className="text-sm text-slate-500 mt-1">Admin Console</div>
      </div>

      <nav className="space-y-1">
        {nav.map((n) => (
          <NavLink
            key={n.to}
            to={n.to}
            end
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-md text-sm ${isActive ? "bg-indigo-50 text-indigo-600 font-medium" : "text-slate-700 hover:bg-slate-100"}`
            }
          >
            <span className="text-lg">{n.icon}</span>
            <span>{n.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="mt-8">
        <button className="w-full px-3 py-2 rounded-md bg-indigo-600 text-white text-sm">Admin Console</button>
      </div>
    </aside>
  );
}
