// src/components/BookingsDrawer.tsx
import React from "react";

export default function BookingsDrawer({
  open,
  bookings,
  onClose,
}: {
  open: boolean;
  bookings: any[];
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/30 z-40 flex items-end justify-center">
      <div className="w-full md:w-1/2 bg-white p-4 rounded-t-2xl shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xl font-semibold">My Bookings</h3>
          <button onClick={onClose} className="text-gray-600">
            Close
          </button>
        </div>

        <div className="space-y-3 max-h-[60vh] overflow-y-auto">
          {bookings.length === 0 && (
            <div className="p-3 text-gray-500 text-sm">No bookings yet.</div>
          )}

          {bookings.map((b) => (
            <div
              key={b.id}
              className="p-3 border rounded-lg flex justify-between items-center"
            >
              <div>
                <div className="font-medium">Item ID: {b.itemId}</div>
                <div className="text-xs text-gray-500">
                  Status: {b.status || "Unknown"}
                </div>
              </div>
              <div className="text-xs text-gray-500">
                {b.bookedAt
                  ? new Date(b.bookedAt).toLocaleString()
                  : "Not Available"}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
