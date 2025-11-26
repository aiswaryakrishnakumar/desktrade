// src/components/AdminTopbar.tsx
import { useState, type JSX } from "react";
import { FiSearch, FiBell, FiUser } from "react-icons/fi";
import toast from "react-hot-toast";

export default function AdminTopbar(): JSX.Element {
  const [q, setQ] = useState("");
  return (
    <header className="bg-slate-50 border-b py-4 px-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search..."
              className="pl-9 pr-3 py-2 rounded-lg border bg-white text-sm w-80"
            />
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400"><FiSearch /></span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button className="p-2 rounded-md hover:bg-slate-100"><FiBell /></button>

          <div className="flex items-center gap-2 bg-white border rounded-lg px-3 py-1">
            <FiUser />
            <div className="text-sm">
              <div className="font-medium">Admin</div>
              <div className="text-xs text-slate-500">Superuser</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
