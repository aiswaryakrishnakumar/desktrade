import React from 'react';

type Props = {
  item: any | null;
  qty: number;
  setQty: (n:number)=>void;
  onCancel: ()=>void;
  onConfirm: ()=>void;
  loading: boolean;
  result?: string | null;
};

export default function BookingModal({ item, qty, setQty, onCancel, onConfirm, loading, result }: Props) {
  if (!item) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h2 className="text-xl font-semibold">Book: {item.name}</h2>
        <p className="text-sm text-gray-600">Category: {item.categoryName || '-'} • Seller: {item.sellerName || '-'}</p>

        <div className="mt-4">
          <label className="block text-sm mb-1">Quantity</label>
          <input
            type="number"
            min={1}
            value={qty}
            onChange={(e) => setQty(Math.max(1, Number(e.target.value || 1)))}
            className="w-28 p-2 border rounded"
          />
        </div>

        {result && <div className="mt-3 text-sm text-gray-700">{result}</div>}

        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onCancel} className="px-3 py-2 border rounded">Cancel</button>
          <button onClick={onConfirm} disabled={loading} className="px-3 py-2 bg-blue-600 text-white rounded disabled:opacity-60">
            {loading ? "Booking..." : "Confirm booking"}
          </button>
        </div>
      </div>
    </div>
  );
}
