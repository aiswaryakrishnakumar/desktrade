// src/pages/MyBookings.tsx
import React, { useEffect, useState } from "react";
import { api } from "../../services/api";
import "../../styles/MyBookings.css";

export default function MyBookings() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadBookings() {
    try {
      setLoading(true);
      const res = await api("/orders/my"); // ← Your backend endpoint
      let arr = [];

      if (Array.isArray(res)) arr = res;
      else if (res?.content) arr = res.content;
      else if (res?.data) arr = res.data;

      setBookings(arr);
    } catch (e: any) {
      console.error(e);
      setError("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBookings();
  }, []);

  return (
    <div className="employee-page">
      <h1 className="employee-title">My Bookings</h1>

      {loading ? (
        <div className="employee-loading">Loading...</div>
      ) : bookings.length === 0 ? (
        <div className="employee-empty">No bookings found.</div>
      ) : (
        <table className="employee-table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Quantity</th>
              <th>Status</th>
              <th>Booked At</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b: any) => (
              <tr key={b.id}>
                <td>{b.item?.title || "Unnamed Item"}</td>
                <td>{b.quantity}</td>
                <td>{b.status}</td>
                <td>{new Date(b.bookedAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {error && <div className="employee-error">{error}</div>}
    </div>
  );
}
