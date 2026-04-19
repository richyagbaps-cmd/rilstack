"use client";
import { useState } from "react";

// Demo investments
const myInvestments = [
  {
    product: "Rilstack Fixed Income",
    units: 2,
    amount: 20000,
    expectedReturn: 23600,
    maturity: "2026-10-19",
    status: "active",
  },
  {
    product: "Tech Growth Fund",
    units: 1,
    amount: 5000,
    expectedReturn: 6400,
    maturity: "2026-06-01",
    status: "matured",
  },
];

export default function MyInvestments() {
  const [investments, setInvestments] = useState<any[]>(myInvestments);

  const handleWithdraw = (idx: number) => {
    // Simulate withdraw to savings
    alert("Withdrawn to savings!");
    const updated = [...investments];
    updated[idx].status = "withdrawn";
    setInvestments(updated);
  };

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-8 mt-8">
      <h2 className="text-xl font-bold mb-4">My Investments</h2>
      <div className="space-y-6">
        {investments.map((inv, idx) => (
          <div key={idx} className="border rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <div className="font-bold text-lg">{inv.product}</div>
              <div className="text-sm text-gray-600">
                Maturity: {inv.maturity}
              </div>
            </div>
            <div className="flex gap-6 mb-2">
              <div>
                Units: <span className="font-bold">{inv.units}</span>
              </div>
              <div>
                Invested:{" "}
                <span className="font-bold">
                  ₦{inv.amount.toLocaleString()}
                </span>
              </div>
              <div>
                Expected Return:{" "}
                <span className="font-bold">
                  ₦{inv.expectedReturn.toLocaleString()}
                </span>
              </div>
            </div>
            {inv.status === "active" && (
              <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                <div
                  className="bg-blue-500 h-3 rounded-full"
                  style={{ width: "60%" }}
                />
              </div>
            )}
            {inv.status === "matured" && (
              <div className="text-green-700 font-semibold mb-2">
                Matured! Final return: ₦{inv.expectedReturn.toLocaleString()}
              </div>
            )}
            {inv.status === "matured" && (
              <button
                className="bg-green-600 text-white px-4 py-2 rounded"
                onClick={() => handleWithdraw(idx)}
              >
                Withdraw to Savings
              </button>
            )}
            {inv.status === "withdrawn" && (
              <div className="text-gray-500">Withdrawn to savings</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
