"use client";
import { useState } from "react";

// Demo investment products (would be fetched from backend/admin)
const products = [
  {
    name: "Rilstack Fixed Income",
    unit: 10000,
    rate: 0.18,
    tenor: "6 months",
    risk: "Low",
  },
  {
    name: "Tech Growth Fund",
    unit: 5000,
    rate: 0.28,
    tenor: "12 months",
    risk: "Medium",
  },
  {
    name: "Green Energy Bond",
    unit: 20000,
    rate: 0.22,
    tenor: "9 months",
    risk: "Low",
  },
];

// Demo user investments
const demoInvestments = [
  { product: "Rilstack Fixed Income", amount: 20000, returns: 1800 },
  { product: "Tech Growth Fund", amount: 5000, returns: 1400 },
];

export default function InvestmentsDashboard() {
  const [investments, setInvestments] = useState<any[]>(demoInvestments);
  const [showInvest, setShowInvest] = useState<number | null>(null);

  const totalInvested = investments.reduce((sum, i) => sum + i.amount, 0);
  const totalReturns = investments.reduce((sum, i) => sum + i.returns, 0);
  const netValue = totalInvested + totalReturns;

  const handleInvest = (idx: number, amt: number) => {
    const prod = products[idx];
    setInvestments([
      ...investments,
      { product: prod.name, amount: amt, returns: 0 },
    ]);
    setShowInvest(null);
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8 mt-8">
      <h2 className="text-2xl font-bold mb-4 text-center">
        Investments Dashboard
      </h2>
      <div className="flex justify-between mb-6">
        <div>
          <div className="text-gray-700">Total Invested</div>
          <div className="text-2xl font-bold">
            ₦{totalInvested.toLocaleString()}
          </div>
        </div>
        <div>
          <div className="text-gray-700">Total Returns</div>
          <div className="text-2xl font-bold text-green-600">
            ₦{totalReturns.toLocaleString()}
          </div>
        </div>
        <div>
          <div className="text-gray-700">Net Value</div>
          <div className="text-2xl font-bold text-blue-600">
            ₦{netValue.toLocaleString()}
          </div>
        </div>
      </div>
      <h3 className="text-xl font-bold mb-4">Available Investment Products</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {products.map((p, idx) => (
          <div
            key={p.name}
            className="border rounded-lg p-4 flex flex-col justify-between"
          >
            <div>
              <div className="font-bold text-lg mb-1">{p.name}</div>
              <div className="text-gray-700 mb-1">
                Unit: ₦{p.unit.toLocaleString()}
              </div>
              <div className="text-gray-700 mb-1">
                Expected Return: {(p.rate * 100).toFixed(1)}%
              </div>
              <div className="text-gray-700 mb-1">Tenor: {p.tenor}</div>
              <div className="text-gray-700 mb-2">
                Risk:{" "}
                <span
                  className={`font-bold ${p.risk === "Low" ? "text-green-600" : p.risk === "Medium" ? "text-yellow-600" : "text-red-600"}`}
                >
                  {p.risk}
                </span>
              </div>
            </div>
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded mt-2"
              onClick={() => setShowInvest(idx)}
            >
              Invest now
            </button>
            {showInvest === idx && (
              <div className="mt-2 flex gap-2">
                <input
                  type="number"
                  className="border p-2 rounded w-32"
                  placeholder={`Min ₦${p.unit}`}
                  min={p.unit}
                  id={`inv-amt-${idx}`}
                />
                <button
                  className="bg-green-600 text-white px-3 py-1 rounded"
                  onClick={() => {
                    const amt = Number(
                      (
                        document.getElementById(
                          `inv-amt-${idx}`,
                        ) as HTMLInputElement
                      )?.value || 0,
                    );
                    if (amt >= p.unit) handleInvest(idx, amt);
                  }}
                >
                  Confirm
                </button>
                <button
                  className="bg-gray-300 px-3 py-1 rounded"
                  onClick={() => setShowInvest(null)}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
