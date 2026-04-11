"use client";
import { useState } from "react";
import PinConfirmModal from "@/components/PinConfirmModal";

const CATEGORIES = [
  { key: "food", label: "Food & Groceries" },
  { key: "transport", label: "Transport" },
  { key: "bills", label: "Bills & Utilities" },
  { key: "entertainment", label: "Entertainment" },
  { key: "health", label: "Health" },
  { key: "other", label: "Other" },
];

export default function RelaxedBudgetPage() {
  const [pockets, setPockets] = useState(
    CATEGORIES.map(cat => ({ ...cat, amount: 0 }))
  );

  const handleNameChange = (idx: number, value: string) => {
    const newPockets = [...pockets];
    newPockets[idx].label = value;
    setPockets(newPockets);
  };

  const handleAddPocket = () => {
    setPockets([...pockets, { key: `custom${Date.now()}`, label: "New Expense", amount: 0 }]);
  };

  const handleDeletePocket = (idx: number) => {
    if (pockets.length === 1) return;
    setPockets(pockets.filter((_, i) => i !== idx));
  };
  const [agreed, setAgreed] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [enabled, setEnabled] = useState(false);

  const handleAmountChange = (idx: number, value: string) => {
    const newPockets = [...pockets];
    newPockets[idx].amount = Number(value.replace(/[^0-9.]/g, ""));
    setPockets(newPockets);
  };

  const handleWithdraw = (idx: number) => {
    alert(`Withdrawing from ${pockets[idx].label}. A 3.5% fee will be applied.`);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8f9fc] p-8">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl w-full flex flex-col items-center">
        <h1 className="text-2xl font-bold mb-6 text-[#FFD700]">Relaxed Budgeting</h1>
        <p className="mb-8 text-[#4A5B6E] text-center max-w-lg">
          Your money is divided into spending pockets for each category. In relaxed mode, you can withdraw from any pocket at any time, but a 3.5% fee applies to any amount withdrawn before the end date.
        </p>
        {!enabled && (
          <div className="w-full flex flex-col items-center mb-4">
            <label className="flex items-start gap-2 mb-2 text-xs text-[#4A5B6E]">
              <input
                type="checkbox"
                checked={agreed}
                onChange={e => setAgreed(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 accent-[#FFD700] cursor-pointer"
              />
              I agree to the <a href="/terms" target="_blank" className="text-[#00e096] underline ml-1">Terms & Conditions</a> and <a href="/privacy" target="_blank" className="text-[#00e096] underline ml-1">Privacy Policy</a> before enabling my budget.
            </label>
            <button
              className="w-full bg-[#FFD700] text-white font-bold py-2 rounded-lg shadow hover:bg-[#FFC300] transition text-base mt-2 disabled:opacity-50"
              disabled={!agreed || pockets.every(p => !p.amount)}
              onClick={() => setShowPinModal(true)}
            >Enable Budget</button>
          </div>
        )}
        {enabled && (
          <div className="w-full text-green-600 text-center font-semibold mb-2">Budget is now enabled. You can withdraw from any pocket (3.5% fee applies).</div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mb-8">
          {pockets.map((pocket, idx) => (
            <div key={pocket.key} className="bg-[#fffbe6] rounded-xl p-4 flex flex-col items-center shadow relative">
              <input
                type="text"
                className="text-lg font-bold text-[#FFD700] mb-2 text-center bg-white border border-[#cbd5e1] rounded-lg px-2 py-1 w-40 focus:outline-none focus:ring-2 focus:ring-[#FFD700]/30"
                value={pocket.label}
                onChange={e => handleNameChange(idx, e.target.value)}
                disabled={!enabled}
              />
              <input
                type="number"
                min="0"
                className="text-2xl font-extrabold text-[#FFD700] mb-2 text-center bg-white border border-[#cbd5e1] rounded-lg px-2 py-1 w-32 focus:outline-none focus:ring-2 focus:ring-[#FFD700]/30"
                value={pocket.amount}
                onChange={e => handleAmountChange(idx, e.target.value)}
                placeholder="₦0"
                disabled={!enabled}
              />
              <button
                className="bg-[#FFD700] text-white font-bold py-2 px-4 rounded-lg shadow hover:bg-[#FFC300] transition mt-2"
                onClick={() => handleWithdraw(idx)}
                disabled={!enabled}
              >Withdraw</button>
              {pockets.length > 1 && enabled === false && (
                <button
                  className="absolute top-2 right-2 text-red-500 hover:text-red-700 text-xs font-bold"
                  onClick={() => handleDeletePocket(idx)}
                  title="Delete pocket"
                >✕</button>
              )}
            </div>
          ))}
        </div>
        {enabled === false && (
          <button
            className="mb-4 px-4 py-2 bg-[#FFD700] text-white rounded-lg font-semibold hover:bg-[#FFC300] transition"
            onClick={handleAddPocket}
          >+ Add Expense</button>
        )}
        <div className="w-full text-xs text-[#7a869a] text-center">
          <strong>Note:</strong> You can withdraw from any pocket, but a 3.5% fee applies before the end date.
        </div>
      </div>
      <PinConfirmModal
        title="Confirm Budget"
        description="Enter your 4-digit PIN to enable your budget."
        onConfirm={() => { setEnabled(true); setShowPinModal(false); }}
        onCancel={() => setShowPinModal(false)}
        open={showPinModal}
      />
    </div>
  );
}
