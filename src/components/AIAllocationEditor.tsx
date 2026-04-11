import React, { useState, useEffect } from "react";

interface Pocket {
  name: string;
  amount: number;
  frequency: "daily" | "weekly" | "monthly";
  editable?: boolean;
  investProduct?: string;
}

interface AIAllocationEditorProps {
  income: number;
  budgetType: "502030" | "zero-based" | "custom";
  profile: {
    occupation?: string;
    age?: number;
    gender?: string;
    state?: string;
    country?: string;
  };
  onChange?: (pockets: Pocket[], totalAllocated: number, unallocated: number) => void;
}

// Example AI allocation logic (replace with real AI call)
function getInitialPockets(budgetType: string, income: number): Pocket[] {
  if (budgetType === "502030") {
    return [
      { name: "Needs", amount: income * 0.5, frequency: "monthly" },
      { name: "Wants", amount: income * 0.3, frequency: "monthly" },
      { name: "Savings", amount: income * 0.2, frequency: "monthly" },
    ];
  }
  if (budgetType === "zero-based") {
    return [
      { name: "Rent", amount: income * 0.25, frequency: "monthly" },
      { name: "Utilities", amount: income * 0.1, frequency: "monthly" },
      { name: "Groceries", amount: income * 0.15, frequency: "monthly" },
      { name: "Transport", amount: income * 0.1, frequency: "monthly" },
      { name: "Dining out", amount: income * 0.05, frequency: "monthly" },
      { name: "Entertainment", amount: income * 0.05, frequency: "monthly" },
      { name: "Shopping", amount: income * 0.05, frequency: "monthly" },
      { name: "Emergency fund", amount: income * 0.15, frequency: "monthly" },
      { name: "Investment top-up", amount: income * 0.1, frequency: "monthly" },
    ];
  }
  // Custom: start with empty, user adds
  return [];
}

const AIAllocationEditor: React.FC<AIAllocationEditorProps> = ({ income, budgetType, profile, onChange }) => {
  const [pockets, setPockets] = useState<Pocket[]>([]);
  const [customPocket, setCustomPocket] = useState({ name: "", amount: 0, frequency: "monthly" as const });
  const INVEST_PRODUCTS = [
    { key: "tbill", label: "T-bill" },
    { key: "bond", label: "Bond" },
    { key: "mutual", label: "Mutual Fund" },
  ];

  useEffect(() => {
    setPockets(getInitialPockets(budgetType, income));
  }, [budgetType, income]);

  const totalAllocated = pockets.reduce((sum, p) => sum + p.amount, 0);
  const unallocated = Math.max(0, income - totalAllocated);

  useEffect(() => {
    if (onChange) onChange(pockets, totalAllocated, unallocated);
  }, [pockets, totalAllocated, unallocated, onChange]);

  // Add or edit a pocket
  const handlePocketChange = (idx: number, field: keyof Pocket, value: any) => {
    setPockets(pockets => pockets.map((p, i) => i === idx ? { ...p, [field]: value } : p));
  };
  // Set investment product for Savings pocket and trigger backend investment
  const handleInvestProduct = async (idx: number, value: string) => {
    setPockets(pockets => pockets.map((p, i) => i === idx ? { ...p, investProduct: value } : p));
    // If user selects an investment product, POST to /api/invest
    const pocket = pockets[idx];
    if (pocket && pocket.amount > 0 && value) {
      await fetch("/api/invest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: "me", // Replace with real user id
          product_id: value,
          amount: pocket.amount
        })
      });
    }
  };

  // Remove a pocket
  const handleRemove = (idx: number) => {
    setPockets(pockets => pockets.filter((_, i) => i !== idx));
  };

  // Add custom pocket
  const handleAddCustom = () => {
    if (!customPocket.name || customPocket.amount <= 0) return;
    setPockets([...pockets, { ...customPocket }]);
    setCustomPocket({ name: "", amount: 0, frequency: "monthly" });
  };

  // Always show General Savings for unallocated
  const displayPockets = [
    ...pockets,
    ...(unallocated > 0 ? [{ name: "General Savings", amount: unallocated, frequency: "monthly", editable: false, investProduct: undefined }] : [])
  ];

  return (
    <div className="w-full max-w-2xl mx-auto mt-4">
      <div className="mb-4 text-lg font-semibold text-[#2c3e5f]">AI-Generated Spending Pockets</div>
      <div className="flex flex-wrap gap-2 mb-4">
        {displayPockets.map((p, idx) => (
          <div key={idx} className={`flex items-center gap-2 px-3 py-2 rounded-full shadow ${p.editable === false ? 'bg-[#e6f7e6] text-[#2c3e5f]' : 'bg-[#f3f4fa] text-[#2c3e5f]'}`}>
            <input
              className="w-28 bg-transparent font-semibold outline-none"
              value={p.name}
              disabled={p.editable === false}
              onChange={e => handlePocketChange(idx, "name", e.target.value)}
            />
            <input
              type="number"
              className="w-24 bg-transparent outline-none text-right"
              value={p.amount}
              disabled={p.editable === false}
              min={0}
              onChange={e => handlePocketChange(idx, "amount", Number(e.target.value))}
            />
            <span className="text-xs">₦</span>
            <select
              className="bg-transparent outline-none text-xs"
              value={p.frequency}
              disabled={p.editable === false}
              onChange={e => handlePocketChange(idx, "frequency", e.target.value)}
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
            {/* Investment selector for Savings pocket in zero-based budget */}
            {budgetType === "zero-based" && p.name.toLowerCase().includes("savings") && p.editable !== false && (
              <select
                className="ml-2 bg-transparent outline-none text-xs border border-[#d1d5db] rounded"
                value={p.investProduct || ""}
                onChange={e => handleInvestProduct(idx, e.target.value)}
              >
                <option value="">--Direct to--</option>
                {INVEST_PRODUCTS.map(prod => (
                  <option key={prod.key} value={prod.key}>{prod.label}</option>
                ))}
              </select>
            )}
            {p.editable !== false && (
              <button className="ml-1 text-red-500 hover:text-red-700" onClick={() => handleRemove(idx)}>&times;</button>
            )}
          </div>
        ))}
      </div>
      <div className="flex gap-2 mb-4">
        <input
          className="px-2 py-1 rounded border border-[#d1d5db] w-32"
          placeholder="Add pocket"
          value={customPocket.name}
          onChange={e => setCustomPocket({ ...customPocket, name: e.target.value })}
        />
        <input
          type="number"
          className="px-2 py-1 rounded border border-[#d1d5db] w-24"
          placeholder="Amount"
          value={customPocket.amount}
          min={0}
          onChange={e => setCustomPocket({ ...customPocket, amount: Number(e.target.value) })}
        />
        <select
          className="px-2 py-1 rounded border border-[#d1d5db]"
          value={customPocket.frequency}
          onChange={e => setCustomPocket({ ...customPocket, frequency: e.target.value as any })}
        >
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>
        <button className="bg-[#00e096] text-white px-3 py-1 rounded font-semibold" onClick={handleAddCustom}>Add</button>
      </div>
      <div className="w-full flex justify-between items-center bg-[#f3f4fa] rounded-lg px-4 py-2 font-semibold">
        <span>Allocated: ₦{totalAllocated.toLocaleString()}</span>
        <span>Unallocated (→ Savings): ₦{unallocated.toLocaleString()}</span>
      </div>
    </div>
  );
};

export default AIAllocationEditor;
