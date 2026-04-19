"use client";
import { useEffect, useState } from "react";

// Example categories for each type
const defaultCategories = {
  "502030": [
    { key: "rent", label: "Rent", group: "Needs", percent: 20 },
    { key: "utilities", label: "Utilities", group: "Needs", percent: 10 },
    { key: "groceries", label: "Groceries", group: "Needs", percent: 20 },
    { key: "dining", label: "Dining", group: "Wants", percent: 10 },
    {
      key: "entertainment",
      label: "Entertainment",
      group: "Wants",
      percent: 10,
    },
    { key: "savings", label: "Savings", group: "Savings", percent: 20 },
  ],
  zero: [
    { key: "rent", label: "Rent", percent: 0 },
    { key: "utilities", label: "Utilities", percent: 0 },
    { key: "groceries", label: "Groceries", percent: 0 },
    { key: "dining", label: "Dining", percent: 0 },
    { key: "entertainment", label: "Entertainment", percent: 0 },
    { key: "savings", label: "Savings", percent: 0 },
  ],
  custom: [], // Will be filled by user
};

const getInitialCategories = (
  type: string,
  income: number,
  customPercents?: Record<string, number>,
) => {
  if (type === "custom" && customPercents) {
    return Object.entries(customPercents).map(([key, percent]) => ({
      key,
      label: key.charAt(0).toUpperCase() + key.slice(1),
      percent,
      amount: Math.round((percent / 100) * income),
    }));
  }
  const cats = defaultCategories[type] || [];
  return cats.map((c) => ({
    ...c,
    amount: Math.round((c.percent / 100) * income),
  }));
};

export default function AIAllocationEditor() {
  const [income, setIncome] = useState(0);
  const [type, setType] = useState("502030");
  const [categories, setCategories] = useState<any[]>([]);
  const [customPercents, setCustomPercents] = useState<Record<string, number>>(
    {},
  );
  const [editing, setEditing] = useState(false);
  const [interestRate] = useState(0.03); // Example: 3% daily

  useEffect(() => {
    // Load from localStorage or defaults
    const storedIncome = Number(
      localStorage.getItem("demographics")
        ? JSON.parse(localStorage.getItem("demographics") || "{}").income
        : 0,
    );
    const storedType = localStorage.getItem("budget_type") || "502030";
    setIncome(storedIncome);
    setType(storedType);
    if (storedType === "custom") {
      const storedCustom = JSON.parse(
        localStorage.getItem("custom_percents") || "{}",
      ) as Record<string, number>;
      setCustomPercents(storedCustom);
      setCategories(
        getInitialCategories(storedType, storedIncome, storedCustom),
      );
    } else {
      setCategories(getInitialCategories(storedType, storedIncome));
    }
  }, []);

  const handleAmountChange = (idx: number, value: number) => {
    const updated = [...categories];
    updated[idx].amount = value;
    setCategories(updated);
  };

  // Calculate unassigned naira
  const totalAssigned = categories.reduce(
    (sum, c) => sum + Number(c.amount),
    0,
  );
  const unassigned = income - totalAssigned;

  // Auto-move unassigned to Savings
  useEffect(() => {
    if (!editing && income > 0 && categories.length) {
      const idx = categories.findIndex((c) => c.key === "savings");
      if (idx !== -1) {
        const updated = [...categories];
        updated[idx].amount = (updated[idx].amount || 0) + unassigned;
        setCategories(updated);
      }
    }
    // eslint-disable-next-line
  }, [editing, unassigned]);

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8 mt-8">
      <h2 className="text-2xl font-bold mb-4 text-center">
        AI Budget Allocation
      </h2>
      <div className="mb-4 text-center text-gray-700">
        Monthly Income: ₦{income.toLocaleString()}
      </div>
      <table className="w-full mb-4">
        <thead>
          <tr>
            <th className="text-left p-2">Category</th>
            <th className="text-right p-2">Amount (₦)</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((cat, idx) => (
            <tr key={cat.key}>
              <td className="p-2 font-medium">{cat.label}</td>
              <td className="p-2 text-right">
                <input
                  type="number"
                  className="border p-1 rounded w-32 text-right"
                  value={cat.amount}
                  min={0}
                  onFocus={() => setEditing(true)}
                  onBlur={() => setEditing(false)}
                  onChange={(e) =>
                    handleAmountChange(idx, Number(e.target.value))
                  }
                />
                {cat.key === "savings" && (
                  <span className="ml-2 text-green-600 text-xs">
                    +{interestRate * 100}%/day
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="text-right text-gray-600 mb-2">
        Unassigned: ₦{unassigned > 0 ? unassigned.toLocaleString() : 0}
      </div>
      <div className="text-xs text-gray-500 mb-2">
        Any unassigned naira is auto-moved to Savings.
      </div>
      <div className="text-xs text-blue-500">
        Savings earn daily interest (rate: {interestRate * 100}% as set by
        admin).
      </div>
    </div>
  );
}
