// src/pages/NewItem.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";
import { createItem, uploadItemImage } from "../services/api";

/**
 * Compress image client-side using canvas.
 * Returns a Blob suitable for uploading.
 */
async function compressImage(file: File, maxWidth = 1200, quality = 0.8): Promise<Blob> {
  if (!file.type.startsWith("image/")) return file;
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const i = new Image();
    i.onload = () => resolve(i);
    i.onerror = reject;
    i.src = URL.createObjectURL(file);
  });

  const ratio = Math.min(1, maxWidth / img.width);
  const w = Math.round(img.width * ratio);
  const h = Math.round(img.height * ratio);

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");
  ctx.drawImage(img, 0, 0, w, h);

  return await new Promise<Blob>((resolve) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        // fallback: return original file as blob
        resolve(file);
      } else {
        resolve(blob);
      }
    }, "image/jpeg", quality);
  });
}

function parseJwt(token: string | null) {
  try {
    if (!token) return null;
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    return payload;
  } catch {
    return null;
  }
}

export default function NewItem({ onSuccess }: { onSuccess?: (created?: any) => void }) {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const [quantity, setQuantity] = useState<number | "">(1);
  const [categoryId, setCategoryId] = useState<number | "">("");
  const [sellerEmailManual, setSellerEmailManual] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const tokenPayload = parseJwt(token);
  const inferredEmail = tokenPayload?.email || tokenPayload?.sub || tokenPayload?.username || "";

  const validate = (): string | null => {
    if (!title.trim()) return "Title is required";
    if (!price || Number(price) <= 0) return "Price must be greater than 0";
    if (!categoryId) return "Please select a category (enter category id)";
    if (!inferredEmail && !sellerEmailManual.trim()) return "Seller email required";
    if (file) {
      if (!file.type.startsWith("image/")) return "Selected file must be an image";
      if (file.size > 10 * 1024 * 1024) return "Image too large (max 10MB)";
    }
    return null;
  };

  const handleFileChange = (f: File | null) => {
    setFile(f);
    if (f) {
      const url = URL.createObjectURL(f);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);

    const v = validate();
    if (v) {
      setError(v);
      return;
    }

    setLoading(true);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim() || undefined,
        price: Number(price),
        quantity: quantity === "" ? 0 : Number(quantity),
        categoryId: categoryId === "" ? undefined : Number(categoryId),
        sellerEmail: inferredEmail || sellerEmailManual.trim(),
      };

      const created: any = await createItem(payload as any);

      if (file && created && created.id) {
        try {
          const compressedBlob = await compressImage(file, 1200, 0.8);
          const compressedFile = new File([compressedBlob], file.name.replace(/\.[^/.]+$/, ".jpg"), { type: "image/jpeg" });
          const up = await uploadItemImage(created.id, compressedFile as File);
          created.image = up?.url || created.image;
        } catch (uploadErr: any) {
          console.error("Image upload failed", uploadErr);
          alert("Item created but image upload failed: " + (uploadErr?.message || uploadErr));
        }
      }

      if (onSuccess) onSuccess(created);
      else navigate("/admin");
    } catch (err: any) {
      console.error("Failed to create item", err);
      const msg = err?.body?.message || err?.message || "Failed to create item";
      setError(msg);
    } finally {
      setLoading(false);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
    }
  };

  return (
    <div className="admin-root">
      <main className="admin-main">
        <header className="admin-topbar">
          <h1 className="admin-title">Add Item</h1>
          <p className="admin-sub">Create a new listing (pending approval).</p>
        </header>

        <section className="panel" style={{ maxWidth: 720 }}>
          <form onSubmit={handleSubmit} style={{ padding: 18 }}>
            <div style={{ marginBottom: 12 }}>
              <label className="form-label">Title</label>
              <input
                className="form-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="E.g. Office Chair - good condition"
              />
            </div>

            <div style={{ marginBottom: 12 }}>
              <label className="form-label">Description</label>
              <textarea
                className="form-input"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Details about the item..."
                rows={4}
              />
            </div>

            <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
              <div style={{ flex: 1 }}>
                <label className="form-label">Price</label>
                <input
                  className="form-input"
                  type="number"
                  min="0"
                  step="0.01"
                  value={price as any}
                  onChange={(e) => setPrice(e.target.value === "" ? "" : Number(e.target.value))}
                  placeholder="0.00"
                />
              </div>

              <div style={{ width: 180 }}>
                <label className="form-label">Quantity</label>
                <input
                  className="form-input"
                  type="number"
                  min="0"
                  value={quantity as any}
                  onChange={(e) => setQuantity(e.target.value === "" ? "" : Number(e.target.value))}
                />
              </div>

              <div style={{ width: 220 }}>
                <label className="form-label">Category ID</label>
                <input
                  className="form-input"
                  type="number"
                  value={categoryId as any}
                  onChange={(e) => setCategoryId(e.target.value === "" ? "" : Number(e.target.value))}
                  placeholder="Category ID"
                />
                <small style={{ color: '#6b7280' }}>Enter a category id from admin categories list.</small>
              </div>
            </div>

            <div style={{ marginBottom: 12 }}>
              <label className="form-label">Item Image (optional)</label>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const f = e.target.files && e.target.files[0];
                    handleFileChange(f || null);
                  }}
                />
                {previewUrl && (
                  <img src={previewUrl} alt="preview" style={{ width: 120, height: 80, objectFit: 'cover', borderRadius: 6, boxShadow: '0 1px 4px rgba(0,0,0,0.15)' }} />
                )}
              </div>
              <small style={{ color: '#6b7280' }}>Optional image to show with the item listing. Images are compressed before upload.</small>
            </div>

            {!inferredEmail && (
              <div style={{ marginBottom: 12 }}>
                <label className="form-label">Seller Email (manual)</label>
                <input
                  className="form-input"
                  value={sellerEmailManual}
                  onChange={(e) => setSellerEmailManual(e.target.value)}
                  placeholder="seller@example.com"
                />
                <small style={{ color: '#6b7280' }}>
                  No logged-in user detected — enter seller email for testing.
                </small>
              </div>
            )}

            {inferredEmail && (
              <div style={{ marginBottom: 12 }}>
                <strong>Seller email:</strong> <span style={{ marginLeft: 8 }}>{inferredEmail}</span>
              </div>
            )}

            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn btn-primary" disabled={loading}>
                {loading ? "Creating…" : "Create"}
              </button>
              <button
                className="btn btn-ghost"
                type="button"
                onClick={() => navigate("/admin")}
              >
                Cancel
              </button>
            </div>

            {error && <div className="error" style={{ marginTop: 12 }}>{error}</div>}
          </form>
        </section>
      </main>
    </div>
  );
}
