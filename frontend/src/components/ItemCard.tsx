// src/components/ItemCard.tsx
import React from "react";

export type Item = {
  id: number | string;
  name?: string;
  title?: string;
  description?: string;
  category?: string;
  price?: number;
  quantity?: number;
  availableQuantity?: number;
  status?: string;
  createdAt?: string;
};

type Props = {
  item: Item;
  onBook?: (id: string | number) => void | Promise<void>;
  onDelete?: (id: string | number) => void | Promise<void>;
  showView?: boolean;
  showDelete?: boolean;
  // optional favorite props (kept optional so old consumers don't break)
  isFavorite?: boolean;
  onToggleFavorite?: (id: string | number) => void;
};

const ItemCard: React.FC<Props> = ({
  item,
  onBook,
  onDelete,
  showView = true,
  showDelete = true,
  isFavorite = false,
  onToggleFavorite,
}) => {
  const title = item.name ?? item.title ?? "Item";
  const price = item.price ?? 0;
  const available = item.availableQuantity ?? item.quantity ?? 0;

  return (
    <div className="item-card" style={{ position: "relative" }}>
      {/* optional favorite button area (renders only if onToggleFavorite provided) */}
      {onToggleFavorite && (
        <button
          type="button"
          onClick={() => onToggleFavorite(item.id)}
          aria-label="toggle-favorite"
          style={{
            position: "absolute",
            right: 12,
            top: 12,
            border: "none",
            background: "transparent",
            cursor: "pointer",
            padding: 6,
          }}
        >
          {isFavorite ? "♥" : "♡"}
        </button>
      )}

      <div className="item-body" style={{ padding: 14 }}>
        <h3 style={{ margin: "4px 0", fontSize: 18, fontWeight: 700 }}>{title}</h3>
        <div style={{ color: "#666", marginBottom: 8 }}>{item.description ?? "—"}</div>

        <div className="item-meta" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ color: "var(--accent, #7b1fa2)", fontWeight: 800 }}>₹{price}</div>
            <div style={{ marginTop: 8, fontSize: 13, color: "#666" }}>
              <span style={{ marginRight: 8 }} className={`status ${((item.status ?? "APPROVED") as string).toLowerCase()}`.trim()}>
                {(item.status ?? "APPROVED").toString()}
              </span>
              <span>Available: {available}</span>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <button
              className="employee-btn"
              onClick={() => onBook?.(item.id)}
              style={{ background: "#10b981", color: "#fff", borderRadius: 8, padding: "8px 12px", border: "none" }}
            >
              Book
            </button>

            {showDelete && (
              <button className="employee-btn-ghost" onClick={() => onDelete?.(item.id)}>
                Delete
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemCard;
