// src/components/UploadForm.tsx
import React, { useState } from "react";
import type { Category } from "../services/api";
import { createItemForEmployee } from "../services/api";

type Props = {
  categories: Category[];
  onCreated: (item: any) => void;
};

export default function UploadForm({ categories = [], onCreated }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const [quantity, setQuantity] = useState<number | "">("");
  const [categoryId, setCategoryId] = useState<number | "">("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    if (categoryId === "") {
      setError("Please select a category");
      return;
    }

    setLoading(true);
    try {
      // call backend helper (keeps existing behaviour)
      const created = await createItemForEmployee({
        title: title.trim(),
        description: description.trim(),
        price: price === "" ? undefined : Number(price),
        quantity: quantity === "" ? 1 : Number(quantity),
        categoryId: Number(categoryId),
      });

      onCreated(created);

      // reset form
      setTitle("");
      setDescription("");
      setPrice("");
      setQuantity("");
      setCategoryId("");
    } catch (err: any) {
      setError(err?.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="upload-form p-4 bg-white rounded-xl shadow grid gap-3">
      <input
        required
        className="upload-input"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title"
        aria-label="Title"
      />

      <textarea
        className="upload-textarea"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description..."
        rows={4}
        aria-label="Description"
      />

      <input
        className="upload-input"
        type="number"
        value={price}
        onChange={(e) => setPrice(e.target.value === "" ? "" : Number(e.target.value))}
        placeholder="Price"
        aria-label="Price"
        min={0}
      />

      <input
        className="upload-input"
        type="number"
        min={1}
        value={quantity}
        onChange={(e) => setQuantity(e.target.value === "" ? "" : Number(e.target.value))}
        placeholder="Quantity"
        aria-label="Quantity"
      />

      <select
        className="upload-select"
        value={categoryId === "" ? "" : String(categoryId)}
        onChange={(e) => {
          const v = e.target.value;
          setCategoryId(v === "" ? "" : Number(v));
        }}
        aria-label="Category"
      >
        <option value="">Select category</option>
        {categories.map((c) => (
          // defensive keys: support both { id, name } and plain string categories
          <option key={String((c as any).id ?? c)} value={String((c as any).id ?? c)}>
            {(c as any).name ?? String(c)}
          </option>
        ))}
      </select>

      <div style={{ display: "flex", gap: 12 }}>
        <button
          type="submit"
          className="employee-btn employee-btn-primary"
          disabled={loading}
          aria-disabled={loading}
        >
          {loading ? "Saving..." : "Create Item"}
        </button>

        <button
          type="button"
          className="employee-btn employee-btn-ghost"
          onClick={() => {
            setTitle("");
            setDescription("");
            setPrice("");
            setQuantity("");
            setCategoryId("");
            setError(null);
          }}
        >
          Reset
        </button>
      </div>

      {error && <div className="mt-2 text-red-600 text-sm" role="alert">{error}</div>}
    </form>
  );
}
