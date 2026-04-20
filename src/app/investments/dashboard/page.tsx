"use client";
import { useState } from "react";

import { useEffect } from "react";

export default function InvestmentsDashboard() {
  const [products, setProducts] = useState<any[]>([]);
  const [investments, setInvestments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInvest, setShowInvest] = useState<number | null>(null);
  const [error, setError] = useState("");

  // Fetch products and user investments on mount
  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => setProducts(data || []));
    const userId = localStorage.getItem("user_id");
    if (!userId) return;
    fetch(`/api/investment?userId=${userId}`)
      .then((res) => res.json())
      .then((data) => setInvestments(data || []))
      .catch(() => setError("Failed to load investments"))
      .finally(() => setLoading(false));
  }, []);



  const totalInvested = investments.reduce((sum, i) => sum + (i.amountInvested || 0), 0);
  const totalReturns = investments.reduce((sum, i) => sum + (i.expectedReturnTotal || 0), 0);
  const netValue = totalInvested + totalReturns;

  const handleInvest = async (idx: number, amt: number) => {
    setError("");
    const prod = products[idx];
    const userId = localStorage.getItem("user_id");
    if (!userId) {
      setError("User not logged in");
      return;
    }
    try {
      const res = await fetch("/api/investment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          productId: prod.id,
          units: Math.floor(amt / (prod.unit || 1)),
          amountInvested: amt,
          expectedReturnTotal: Math.round(amt * (prod.rate || 0)),
          startDate: new Date(),
          expectedEndDate: new Date(new Date().setMonth(new Date().getMonth() + (parseInt(prod.tenor) || 6))),
          status: "active",
        }),
      });
      if (!res.ok) throw new Error("Failed to invest");
      // Refresh investments
      const updated = await fetch(`/api/investment?userId=${userId}`).then((r) => r.json());
      setInvestments(updated || []);
    } catch (err) {
      setError("Failed to invest");
    }
    setShowInvest(null);
  };

  if (loading) {
    return <div className="text-center mt-20 text-xl">Loading investments...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8 mt-8">
      <h2 className="text-2xl font-bold mb-4 text-center">Investments Dashboard</h2>
      {error && <div className="text-red-600 mb-4">{error}</div>}
      <div className="flex justify-between mb-6">
        <div>
          <div className="text-gray-700">Total Invested</div>
          <div className="text-2xl font-bold">₦{totalInvested.toLocaleString()}</div>
        </div>
        <div>
          <div className="text-gray-700">Total Returns</div>
          <div className="text-2xl font-bold text-green-600">₦{totalReturns.toLocaleString()}</div>
        </div>
        <div>
          <div className="text-gray-700">Net Value</div>
          <div className="text-2xl font-bold text-blue-600">₦{netValue.toLocaleString()}</div>
        </div>
      </div>
      <h3 className="text-xl font-bold mb-4">Available Investment Products</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {products.map((p, idx) => (
          <div key={p.name} className="border rounded-lg p-4 flex flex-col justify-between">
            <div>
              <div className="font-bold text-lg mb-1">{p.name}</div>
              <div className="text-gray-700 mb-1">Unit: ₦{p.unit.toLocaleString()}</div>
              <div className="text-gray-700 mb-1">Expected Return: {(p.rate * 100).toFixed(1)}%</div>
              <div className="text-gray-700 mb-1">Tenor: {p.tenor}</div>
              <div className="text-gray-700 mb-2">Risk: <span className={`font-bold ${p.risk === "Low" ? "text-green-600" : p.risk === "Medium" ? "text-yellow-600" : "text-red-600"}`}>{p.risk}</span></div>
            </div>
            <button className="bg-blue-600 text-white px-4 py-2 rounded mt-2" onClick={() => setShowInvest(idx)}>Invest now</button>
            {showInvest === idx && (
              <div className="mt-2 flex gap-2">
                <input type="number" className="border p-2 rounded w-32" placeholder={`Min ₦${p.unit}`} min={p.unit} id={`inv-amt-${idx}`} />
                <button className="bg-green-600 text-white px-3 py-1 rounded" onClick={() => {
                  const amt = Number((document.getElementById(`inv-amt-${idx}`) as HTMLInputElement)?.value || 0);
                  if (amt >= p.unit) handleInvest(idx, amt);
                }}>Confirm</button>
                <button className="bg-gray-300 px-3 py-1 rounded" onClick={() => setShowInvest(null)}>Cancel</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
