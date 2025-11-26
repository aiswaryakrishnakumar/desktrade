// src/components/EmployeeItemCard.tsx
import React from "react";
import type { Item } from "../services/api";

type Props = {
  item: Item;
  onView?: (id: number) => void;
  onBook?: (id: number) => void;
  onDelete?: (id: number) => void;
};

export default function EmployeeItemCard({ item, onView, onBook, onDelete }: Props) {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden border hover:shadow-md transition">
      <div className="h-44 bg-gray-100 flex items-center justify-center">
        {item.thumbnail ? (
          <img src={item.thumbnail} className="w-full h-full object-cover" alt={item.title || item.name} />
        ) : (
          <div className="text-gray-400 text-sm">No Image</div>
        )}
      </div>

      <div className="p-3">
        <h3 className="font-semibold text-sm truncate">{item.title || item.name}</h3>
        <div className="mt-1 text-xs text-gray-500 flex justify-between">
          <span>{item.categoryName || (item.category ?? "—")}</span>
          <span>{item.price ? `₹ ${item.price}` : "Price N/A"}</span>
        </div>

        {item.description && <p className="text-xs text-gray-600 mt-2 line-clamp-2">{item.description}</p>}

        <div className="mt-3 flex items-center gap-2">
          <button onClick={() => onView?.(item.id!)} className="px-3 py-1 text-xs border rounded hover:bg-gray-50">View</button>
          <button onClick={() => onBook?.(item.id!)} className="px-3 py-1 text-xs bg-emerald-600 text-white rounded hover:bg-emerald-700">Book</button>
          <button onClick={() => onDelete?.(item.id!)} className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 ml-auto">Delete</button>
        </div>
      </div>
    </div>
  );
}
