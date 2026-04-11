"use client";
import React, { useEffect, useState } from "react";

interface Product {
  id: string;
  name: string;
  available_for_purchase: number;
  sold: number;
  type: string;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [amount, setAmount] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then(setProducts);
  }, []);

  const handleSelect = (id: string) => {
    setSelectedId(id);
    const prod = products.find((p) => p.id === id);
    setAmount(prod ? prod.available_for_purchase : 0);
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    const res = await fetch("/api/products", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: selectedId, available_for_purchase: amount }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Failed to update");
    } else {
      setSuccess("Updated successfully");
      setProducts((prev) =>
        prev.map((p) => (p.id === selectedId ? { ...p, available_for_purchase: amount } : p))
      );
    }
  };

  return (
    <div className="max-w-xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Set Available Investment Amount</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-semibold mb-1">Select Product</label>
          <select
            className="w-full border rounded px-3 py-2"
            value={selectedId}
            onChange={(e) => handleSelect(e.target.value)}
            required
          >
            <option value="">-- Select --</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.type})
              </option>
            ))}
          </select>
        </div>
        {selectedId && (
          <div>
            <label className="block font-semibold mb-1">Available for Purchase</label>
            <input
              type="number"
              className="w-full border rounded px-3 py-2"
              value={amount}
              min={products.find((p) => p.id === selectedId)?.sold || 0}
              onChange={(e) => setAmount(Number(e.target.value))}
              required
            />
            <div className="text-xs text-slate-500 mt-1">
              Already sold: {products.find((p) => p.id === selectedId)?.sold || 0}
            </div>
          </div>
        )}
        {error && <div className="text-red-600 font-semibold">{error}</div>}
        {success && <div className="text-green-600 font-semibold">{success}</div>}
        <button
          type="submit"
          className="bg-[#2c3e5f] text-white px-6 py-2 rounded font-semibold mt-2 disabled:opacity-50"
          disabled={!selectedId || loading}
        >
          {loading ? "Saving..." : "Save"}
        </button>
      </form>
    </div>
  );
}
