import React, { useEffect, useState } from "react";

interface Investment {
  id: string;
  symbol: string;
  name: string;
  shares: number;
  currentPrice: number;
  totalValue: number;
}

interface SafeLock {
  id: string;
  amount: number;
  releaseDate: string;
  createdAt: string;
}

export default function UnifiedPortfolio() {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [safeLocks, setSafeLocks] = useState<SafeLock[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPortfolio() {
      setLoading(true);
      const invRes = await fetch("/api/investments");
      const invData = await invRes.json();
      setInvestments(invData);
      // For demo, fetch safe locks from savings dashboard localStorage or API
      const locks = JSON.parse(localStorage.getItem("safeLocks") || "[]");
      setSafeLocks(locks);
      setLoading(false);
    }
    fetchPortfolio();
  }, []);

  if (loading) return <div className="text-center py-8">Loading portfolio...</div>;

  return (
    <div className="w-full max-w-3xl mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-6 text-[#2c3e5f]">Unified Portfolio</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Investments */}
        <div className="bg-white rounded-2xl p-6 shadow">
          <div className="text-lg font-bold mb-4 text-[#2c3e5f]">Investments</div>
          {investments.length === 0 && <div className="text-[#4A5B6E]">No investments yet.</div>}
          {investments.map(inv => (
            <div key={inv.id} className="mb-4 p-4 rounded-lg bg-[#f8f9fc]">
              <div className="flex justify-between items-center">
                <div className="font-semibold text-[#2c3e5f]">{inv.name} ({inv.symbol})</div>
                <div className="text-xs text-[#4A5B6E]">₦{inv.totalValue.toLocaleString()}</div>
              </div>
              <div className="text-xs text-[#4A5B6E]">Shares: {inv.shares} @ ₦{inv.currentPrice.toLocaleString()}</div>
            </div>
          ))}
        </div>
        {/* Safe Locks as cash-like holdings */}
        <div className="bg-white rounded-2xl p-6 shadow">
          <div className="text-lg font-bold mb-4 text-[#2c3e5f]">Safe Locks (Cash-like)</div>
          {safeLocks.length === 0 && <div className="text-[#4A5B6E]">No safe locks yet.</div>}
          {safeLocks.map(lock => (
            <div key={lock.id} className="mb-4 p-4 rounded-lg bg-[#f8f9fc]">
              <div className="flex justify-between items-center">
                <div className="font-semibold text-[#2c3e5f]">₦{lock.amount.toLocaleString()}</div>
                <div className="text-xs text-[#4A5B6E]">Unlocks: {lock.releaseDate}</div>
              </div>
              <div className="text-xs text-[#00e096]">Earning daily interest</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
