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

export default function StrictBudgetPage() {
  // Example: Each pocket starts with a set amount
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
  const [locked, setLocked] = useState(false);

  const handleAmountChange = (idx: number, value: string) => {
    const newPockets = [...pockets];
    newPockets[idx].amount = Number(value.replace(/[^0-9.]/g, ""));
    setPockets(newPockets);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8f9fc] p-8">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl w-full flex flex-col items-center">
        <h1 className="text-2xl font-bold mb-6 text-[#2c3e5f]">Strict Budgeting</h1>
        <p className="mb-8 text-[#4A5B6E] text-center max-w-lg">
          Your money is divided into spending pockets for each category. In strict mode, all funds are locked until the end date. You cannot withdraw from any pocket until your budget period ends.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mb-8">
          {pockets.map((pocket, idx) => (
            <div key={pocket.key} className="bg-[#eaf2fa] rounded-xl p-4 flex flex-col items-center shadow relative">
              <input
                type="text"
                className="text-lg font-bold text-[#2c3e5f] mb-2 text-center bg-white border border-[#cbd5e1] rounded-lg px-2 py-1 w-40 focus:outline-none focus:ring-2 focus:ring-[#2c3e5f]/30"
                value={pocket.label}
                onChange={e => handleNameChange(idx, e.target.value)}
                disabled={locked}
              />
              <input
                type="number"
                min="0"
                className="text-2xl font-extrabold text-[#2c3e5f] mb-2 text-center bg-white border border-[#cbd5e1] rounded-lg px-2 py-1 w-32 focus:outline-none focus:ring-2 focus:ring-[#2c3e5f]/30"
                value={pocket.amount}
                onChange={e => handleAmountChange(idx, e.target.value)}
                placeholder="₦0"
                disabled={locked}
              />
              <button
                className="bg-gray-300 text-gray-500 font-bold py-2 px-4 rounded-lg cursor-not-allowed opacity-60 mt-2"
                disabled
              >Withdraw (Locked)</button>
              {pockets.length > 1 && !locked && (
                <button
                  className="absolute top-2 right-2 text-red-500 hover:text-red-700 text-xs font-bold"
                  onClick={() => handleDeletePocket(idx)}
                  title="Delete pocket"
                >✕</button>
              )}
            </div>
          ))}
        </div>
        {!locked && (
          <div>
            <button
              className="mb-4 px-4 py-2 bg-[#2c3e5f] text-white rounded-lg font-semibold hover:bg-[#1a2253] transition"
              onClick={handleAddPocket}
            >+ Add Expense</button>
            <div className="w-full flex flex-col items-center mb-4">
              <label className="flex items-start gap-2 mb-2 text-xs text-[#4A5B6E]">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={e => setAgreed(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 accent-[#2c3e5f] cursor-pointer"
                />
                I agree to the <a href="/terms" target="_blank" className="text-[#00e096] underline ml-1">Terms & Conditions</a> and <a href="/privacy" target="_blank" className="text-[#00e096] underline ml-1">Privacy Policy</a> before locking my funds.
              </label>
            </div>
            <button
              className="w-full bg-[#00e096] text-white font-bold py-2 rounded-lg shadow hover:bg-[#00c080] transition text-base mt-2 disabled:opacity-50"
              disabled={!agreed || pockets.every(p => !p.amount)}
              onClick={() => setShowPinModal(true)}
            >Lock Funds</button>
          </div>
        )}
        {locked && (
          <div className="w-full text-green-600 text-center font-semibold mb-2">Funds are now locked until the end date.</div>
        )}
        <div className="w-full text-xs text-[#7a869a] text-center">
          <strong>Note:</strong> All pockets are locked. You can only withdraw after your budget period ends.
        </div>
      </div>
      <PinConfirmModal
        title="Confirm Lock"
        description="Enter your 4-digit PIN to lock your funds."
        onConfirm={() => { setLocked(true); setShowPinModal(false); }}
        onCancel={() => setShowPinModal(false)}
        open={showPinModal}
      />
    </div>
  );
}
