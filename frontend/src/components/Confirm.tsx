import React from "react";

export default function Confirm({ open, title, message, onCancel, onConfirm }: { open: boolean; title?: string; message?: string; onCancel?: () => void; onConfirm?: () => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-lg overflow-hidden">
        <div className="p-4">
          <h3 className="font-semibold">{title || "Confirm"}</h3>
          <p className="text-sm text-gray-600 mt-2">{message}</p>
          <div className="mt-4 flex justify-end gap-2">
            <button onClick={onCancel} className="px-3 py-1 border rounded">Cancel</button>
            <button onClick={onConfirm} className="px-3 py-1 rounded bg-red-600 text-white">Confirm</button>
          </div>
        </div>
      </div>
    </div>
  );
}
