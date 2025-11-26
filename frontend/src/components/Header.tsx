import React, { type JSX } from "react";
import { useNavigate } from "react-router-dom";

export default function Header(): JSX.Element {
  const nav = useNavigate();
  function logout() {
    localStorage.removeItem("token");
    nav("/login");
  }

  return (
    <header className="bg-white border-b p-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="text-lg font-semibold">Admin Console</div>
      </div>
      <div className="flex items-center gap-4">
        <input placeholder="Search..." className="border rounded px-3 py-1 text-sm hidden md:inline-block" />
        <button onClick={logout} className="px-3 py-1 rounded border text-sm">Logout</button>
      </div>
    </header>
  );
}
