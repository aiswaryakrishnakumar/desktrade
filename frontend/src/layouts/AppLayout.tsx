// src/layouts/AppLayout.tsx
import { Outlet } from "react-router-dom";
import type { JSX, ReactNode } from "react";
import AdminSidebar from "../components/AdminSidebar";
import AdminTopbar from "../components/AdminTopbar";

type Props = {
  children?: ReactNode;
};

/**
 * AppLayout supports:
 *  - usage as <AppLayout>...children...</AppLayout>
 *  - usage as a route element <Route element={<AppLayout/>}> with nested <Outlet />
 *
 * The component intentionally prefers rendering `children` when provided,
 * and falls back to <Outlet/> otherwise.
 */
export default function AppLayout({ children }: Props): JSX.Element {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex">
        <AdminSidebar />

        <div className="flex-1 min-h-screen">
          <AdminTopbar />

          <main className="p-6 max-w-7xl mx-auto">
            {/* If a page passed children explicitly (e.g. <AppLayout>...</AppLayout>)
                render them. Otherwise render the nested outlet used by react-router. */}
            {children ?? <Outlet />}
          </main>
        </div>
      </div>
    </div>
  );
}

