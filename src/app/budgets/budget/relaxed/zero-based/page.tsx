"use client";
import { useState } from "react";
import PinConfirmModal from "@/components/PinConfirmModal";
import { motion, AnimatePresence } from "framer-motion";
import { FaCheckCircle, FaInfoCircle } from "react-icons/fa";
import DemographicsForm from "@/components/DemographicsForm";

export default function RelaxedZeroBasedPage() {
  const [pockets, setPockets] = useState([
    { key: "income", label: "Income", amount: 0 },
    { key: "expense1", label: "Expense 1", amount: 0 },
    { key: "expense2", label: "Expense 2", amount: 0 },
  ]);
  const [agreed, setAgreed] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [enabled, setEnabled] = useState(false);

  const handleNameChange = (idx: number, value: string) => {
    const newPockets = [...pockets];
    newPockets[idx].label = value;
    setPockets(newPockets);
  };
  const handleAmountChange = (idx: number, value: string) => {
    const newPockets = [...pockets];
    newPockets[idx].amount = Number(value.replace(/[^0-9.]/g, ""));
    setPockets(newPockets);
  };
  const handleAddPocket = () => {
    setPockets([
      ...pockets,
      {
        key: `custom${Date.now()}`,
        label: `Expense ${pockets.length}`,
        amount: 0,
      },
    ]);
  };
  const handleDeletePocket = (idx: number) => {
    if (pockets.length <= 2 || idx === 0) return;
    setPockets(pockets.filter((_, i) => i !== idx));
  };

  const totalExpenses = pockets
    .slice(1)
    .reduce((sum, p) => sum + (p.amount || 0), 0);
  const income = pockets[0].amount || 0;
  const isBalanced = income === totalExpenses;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#f8f9fc] to-[#e0f0e8] p-8">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full flex flex-col items-center relative"
      >
        <h1 className="text-3xl font-extrabold mb-4 text-[#00e096] flex items-center gap-2">
          Zero-Based Budget
          <span
            className="tooltip ml-2"
            title="Every naira is assigned a job. Income minus expenses should be zero."
          >
            <FaInfoCircle className="text-[#00e096] text-lg" />
          </span>
        </h1>
        <p className="mb-6 text-[#4A5B6E] text-center text-lg">
          Assign every naira a job. Your income minus expenses should equal
          zero.
        </p>
        {/* Summary Card */}
        <motion.div
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          className="w-full mb-6"
        >
          <div className="flex justify-between items-center bg-[#f3f4fa] rounded-xl px-4 py-3 mb-2">
            <span className="text-[#00e096] font-semibold">Income</span>
            <span className="text-[#2c3e5f] font-bold text-lg">
              ₦{income.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between items-center bg-[#f3f4fa] rounded-xl px-4 py-3 mb-2">
            <span className="text-[#00e096] font-semibold">Total Expenses</span>
            <span className="text-[#2c3e5f] font-bold text-lg">
              ₦{totalExpenses.toLocaleString()}
            </span>
          </div>
          <div
            className={`flex justify-between items-center rounded-xl px-4 py-3 ${isBalanced ? "bg-green-50" : "bg-red-50"}`}
          >
            <span className="font-semibold">Status</span>
            <span
              className={`font-bold ${isBalanced ? "text-green-600" : "text-red-500"}`}
            >
              {isBalanced ? "Balanced" : "Not Balanced"}
            </span>
          </div>
        </motion.div>
        <div className="flex flex-col gap-6 w-full mb-8">
          <AnimatePresence>
            {pockets.map((pocket, idx) => (
              <motion.div
                key={pocket.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.3, delay: idx * 0.08 }}
                className="bg-[#e0f0e8] rounded-xl p-4 flex flex-col items-center shadow relative group"
                tabIndex={0}
                aria-label={pocket.label}
              >
                <input
                  type="text"
                  className="text-lg font-bold text-[#2c3e5f] mb-2 text-center bg-white border border-[#cbd5e1] rounded-lg px-2 py-1 w-40 focus:outline-none focus:ring-2 focus:ring-[#00e096]/30 transition-all duration-200 group-hover:shadow-lg"
                  value={pocket.label}
                  onChange={(e) => handleNameChange(idx, e.target.value)}
                  disabled={enabled || idx === 0}
                  aria-label={`Label for pocket ${idx + 1}`}
                />
                <input
                  type="number"
                  min="0"
                  className="text-2xl font-extrabold text-[#2c3e5f] mb-2 text-center bg-white border border-[#cbd5e1] rounded-lg px-2 py-1 w-32 focus:outline-none focus:ring-2 focus:ring-[#00e096]/30 transition-all duration-200 group-hover:shadow-lg"
                  value={pocket.amount}
                  onChange={(e) => handleAmountChange(idx, e.target.value)}
                  placeholder="₦0"
                  disabled={enabled && idx !== 0}
                  aria-label={`Amount for ${pocket.label}`}
                />
                {idx > 0 && pockets.length > 2 && !enabled && (
                  <button
                    className="absolute top-2 right-2 text-red-500 hover:text-red-700 text-xs font-bold"
                    onClick={() => handleDeletePocket(idx)}
                    title="Delete pocket"
                    aria-label={`Delete pocket ${pocket.label}`}
                  >
                    ✕
                  </button>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        <AnimatePresence>
          {!enabled && (
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="mb-4 px-4 py-2 bg-[#00e096] text-white rounded-lg font-semibold hover:bg-[#00c080] transition"
              onClick={handleAddPocket}
            >
              + Add Expense
            </motion.button>
          )}
        </AnimatePresence>
        <div className="w-full text-center mb-4">
          <span className="text-[#2c3e5f] font-bold">Income:</span> ₦
          {income.toLocaleString()}
          <br />
          <span className="text-[#2c3e5f] font-bold">Total Expenses:</span> ₦
          {totalExpenses.toLocaleString()}
          <br />
          <span
            className={`font-bold ${isBalanced ? "text-green-600" : "text-red-500"}`}
          >
            Budget {isBalanced ? "Balanced" : "Not Balanced"}
          </span>
        </div>
        <AnimatePresence>
          {!enabled && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="w-full flex flex-col items-center mb-4"
            >
              <label className="flex items-start gap-2 mb-2 text-xs text-[#4A5B6E]">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 accent-[#00e096] cursor-pointer"
                  aria-label="Agree to terms"
                />
                I agree to the{" "}
                <a
                  href="/terms"
                  target="_blank"
                  className="text-[#00e096] underline ml-1"
                >
                  Terms & Conditions
                </a>{" "}
                and{" "}
                <a
                  href="/privacy"
                  target="_blank"
                  className="text-[#00e096] underline ml-1"
                >
                  Privacy Policy
                </a>{" "}
                before enabling my budget.
              </label>
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-[#00e096] text-white font-bold py-2 rounded-lg shadow hover:bg-[#00c080] transition text-base mt-2 disabled:opacity-50"
                disabled={!agreed || !isBalanced || income === 0}
                onClick={() => setShowPinModal(true)}
                aria-disabled={!agreed || !isBalanced || income === 0}
              >
                Enable Budget
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {enabled && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="w-full flex flex-col items-center justify-center mt-4"
            >
              <FaCheckCircle className="text-green-500 text-4xl mb-2 animate-bounce" />
              <div className="w-full text-green-600 text-center font-semibold mb-2">
                Budget is now enabled. You can withdraw from any pocket (3.5%
                fee applies).
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      <PinConfirmModal
        title="Confirm Enable"
        description="Enter your 4-digit PIN to enable your budget."
        onConfirm={() => {
          setEnabled(true);
          setShowPinModal(false);
        }}
        onCancel={() => setShowPinModal(false)}
        open={showPinModal}
      />
    </div>
  );
}
