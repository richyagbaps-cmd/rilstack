"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function BudgetFinalize() {
  const [terms, setTerms] = useState(false);
  const [pin, setPin] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!terms) {
      setError("You must accept the terms and conditions.");
      return;
    }
    if (!/^\d{4,6}$/.test(pin)) {
      setError("PIN must be 4-6 digits.");
      return;
    }
    if (pin !== confirm) {
      setError("PINs do not match.");
      return;
    }
    setError("");

    // Gather budget data from localStorage
    try {
      const demographics = JSON.parse(localStorage.getItem("demographics") || "{}");
      const mode = localStorage.getItem("budgeting_mode") || "strict";
      const type = localStorage.getItem("budget_type") || "502030";
      const dates = JSON.parse(localStorage.getItem("budget_dates") || "{}");
      const window = localStorage.getItem("spending_window") || "monthly";
      const customPercents = JSON.parse(localStorage.getItem("custom_percents") || "{}");
      const income = Number(demographics.income || 0);
      // Categories: reconstruct from allocation logic
      let categories = [];
      if (type === "custom" && Object.keys(customPercents).length) {
        categories = Object.entries(customPercents).map(([key, percent]: [string, any]) => ({
          name: key.charAt(0).toUpperCase() + key.slice(1),
          allocated_amount: Math.round((percent / 100) * income),
          spent_amount: 0,
          rollover_enabled: false,
          spending_window: mode === "strict" ? window : null,
        }));
      } else {
        // Default categories for 50/30/20 or zero-based
        const defaultCats = type === "502030"
          ? [
              { name: "Rent", percent: 20 },
              { name: "Utilities", percent: 10 },
              { name: "Groceries", percent: 20 },
              { name: "Dining", percent: 10 },
              { name: "Entertainment", percent: 10 },
              { name: "Savings", percent: 20 },
            ]
          : [
              { name: "Rent", percent: 0 },
              { name: "Utilities", percent: 0 },
              { name: "Groceries", percent: 0 },
              { name: "Dining", percent: 0 },
              { name: "Entertainment", percent: 0 },
              { name: "Savings", percent: 0 },
            ];
        categories = defaultCats.map((c) => ({
          name: c.name,
          allocated_amount: Math.round((c.percent / 100) * income),
          spent_amount: 0,
          rollover_enabled: false,
          spending_window: mode === "strict" ? window : null,
        }));
      }

      // Prepare payload
      const payload = {
        type: mode,
        budgetStyle: type,
        startDate: dates.start,
        endDate: dates.end,
        totalIncome: income,
        totalAllocated: categories.reduce((sum, c) => sum + c.allocated_amount, 0),
        totalSpent: 0,
        status: "active",
        categories,
        pin, // Optionally send hashed PIN
        demographics,
      };

      const res = await fetch("/api/budget", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to create budget");
      localStorage.setItem("budget_finalized", "true");
      setTimeout(() => router.push("/dashboard"), 800);
    } catch (err: any) {
      setError(err.message || "Failed to create budget");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-8 mt-8 flex flex-col gap-4"
    >
      <h2 className="text-2xl font-bold mb-2 text-center">Finalize Budget</h2>
      <div className="mb-2 text-gray-700 text-sm max-h-32 overflow-auto border p-2 rounded">
        {/* Replace with real terms text */}
        By finalizing, you agree to the platform's terms and conditions. Your
        budget will be locked and PIN-protected.
      </div>
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={terms}
          onChange={(e) => setTerms(e.target.checked)}
        />
        <span>I accept the terms and conditions</span>
      </label>
      <div>
        <label className="block mb-1 font-medium">Enter PIN</label>
        <input
          type="password"
          maxLength={6}
          minLength={4}
          pattern="\d*"
          className="w-full border p-2 rounded"
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
          required
        />
      </div>
      <div>
        <label className="block mb-1 font-medium">Confirm PIN</label>
        <input
          type="password"
          maxLength={6}
          minLength={4}
          pattern="\d*"
          className="w-full border p-2 rounded"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value.replace(/\D/g, ""))}
          required
        />
      </div>
      {error && <div className="text-red-500">{error}</div>}
      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 rounded font-semibold"
      >
        Finalize & Go to Dashboard
      </button>
    </form>
  );
}
