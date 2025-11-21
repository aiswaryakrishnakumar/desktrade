// import React from 'react';

type Props = {
  item: any;
  onBook: (item: any) => void;
};

export default function ItemCard({ item, onBook }: Props) {
  return (
    <div className="border rounded p-3 flex flex-col justify-between bg-white">
      <div>
        <div className="font-medium text-lg">{item.name}</div>
        <div className="text-xs text-gray-500">{item.categoryName || 'Uncategorized'} • Seller: {item.sellerName || '-'}</div>
        <div className="mt-2 text-sm text-gray-700">{item.description}</div>
      </div>
      <div className="mt-4 flex items-center justify-between gap-2">
        <div className="text-sm">Available: {item.availableQuantity ?? '-'}</div>
        <div className="flex gap-2">
          <button onClick={() => onBook(item)} className="px-3 py-1 bg-green-600 text-white rounded text-sm">Book</button>
        </div>
      </div>
    </div>
  );
}
