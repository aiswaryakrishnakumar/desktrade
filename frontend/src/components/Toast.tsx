// src/components/Toast.tsx
import React, { createContext, useCallback, useContext, useState } from "react";

type Toast = {
  id: string;
  message: string;
  type?: "success" | "error" | "info";
};

const ToastContext = createContext<any>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push = useCallback((message: string, type: Toast["type"] = "info") => {
    const id = Date.now().toString();
    setToasts((s) => [{ id, message, type }, ...s]);
    setTimeout(() => {
      setToasts((s) => s.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const remove = useCallback(
    (id: string) => setToasts((s) => s.filter((t) => t.id !== id)),
    []
  );

  return (
    <ToastContext.Provider value={{ push, remove }}>
      {children}

      {/* Toast Container */}
      <div className="fixed right-4 bottom-6 space-y-2 z-50">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`max-w-xs px-4 py-3 border rounded-lg shadow text-sm
              ${
                t.type === "success"
                  ? "bg-emerald-50 border-emerald-300"
                  : t.type === "error"
                  ? "bg-red-50 border-red-300"
                  : "bg-white border-gray-300"
              }`}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within <ToastProvider>");
  return ctx as { push: (msg: string, type?: Toast["type"]) => void };
}
