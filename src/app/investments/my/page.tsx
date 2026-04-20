"use client";
import { useState } from "react";

export default function MyInvestments() {
  const [investments, setInvestments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch user investments on mount
  React.useEffect(() => {
    const userId = localStorage.getItem("user_id");
    if (!userId) return;
    fetch(`/api/investment?userId=${userId}`)
      .then((res) => res.json())
      .then((data) => setInvestments(data || []))
      .catch(() => setError("Failed to load investments"))
      .finally(() => setLoading(false));
  }, []);


  const handleWithdraw = async (idx: number) => {
    const inv = investments[idx];
    try {
      const res = await fetch("/api/investment", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: inv.id, status: "withdrawn", withdrawnAt: new Date().toISOString() }),
      });
      if (!res.ok) throw new Error("Failed to withdraw");
      // Optionally, update status locally
      const updated = [...investments];
      updated[idx].status = "withdrawn";
      setInvestments(updated);
      alert("Withdrawn to savings!");
    } catch (err) {
      alert("Failed to withdraw. Please try again.");
    }
  };

  if (loading) {
    return <div className="text-center mt-20 text-xl">Loading investments...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-8 mt-8">
      <h2 className="text-xl font-bold mb-4">My Investments</h2>
      {error && <div className="text-red-600 mb-4">{error}</div>}
      <div className="space-y-6">
        {investments.map((inv, idx) => (
          <div key={idx} className="border rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <div className="font-bold text-lg">{inv.product?.name || inv.productId || "Investment"}</div>
              <div className="text-sm text-gray-600">
                Maturity: {inv.expectedEndDate ? new Date(inv.expectedEndDate).toLocaleDateString() : "-"}
              </div>
            </div>
            <div className="flex gap-6 mb-2">
              <div>
                Units: <span className="font-bold">{inv.units}</span>
              </div>
              <div>
                Invested: <span className="font-bold">₦{inv.amountInvested?.toLocaleString?.() || inv.amount?.toLocaleString?.() || 0}</span>
              </div>
              <div>
                Expected Return: <span className="font-bold">₦{inv.expectedReturnTotal?.toLocaleString?.() || inv.expectedReturn?.toLocaleString?.() || 0}</span>
              </div>
            </div>
            {inv.status === "active" && (
              <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                <div className="bg-blue-500 h-3 rounded-full" style={{ width: "60%" }} />
              </div>
            )}
            {inv.status === "matured" && (
              <div className="text-green-700 font-semibold mb-2">Matured! Final return: ₦{inv.expectedReturnTotal?.toLocaleString?.() || inv.expectedReturn?.toLocaleString?.() || 0}</div>
            )}
            {inv.status === "matured" && (
              <button className="bg-green-600 text-white px-4 py-2 rounded" onClick={() => handleWithdraw(idx)}>Withdraw to Savings</button>
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
