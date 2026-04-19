"use client";
import { useState } from "react";

const actions = [
  { key: "withdraw-budget", label: "Withdraw from Budget Category" },
  { key: "deposit-savings", label: "Deposit to Savings Goal" },
  { key: "withdraw-savings", label: "Withdraw from Savings" },
  { key: "safe-lock", label: "Create Safe Lock" },
  { key: "purchase-investment", label: "Purchase Investment" },
];

const recent = [
  {
    key: "deposit-savings",
    label: "Add ₦5,000 to Emergency Fund",
    amount: 5000,
  },
  {
    key: "withdraw-budget",
    label: "Withdraw ₦2,000 from Groceries",
    amount: 2000,
  },
];

export default function UnifiedTransactionFlow({
  onSuccess,
}: {
  onSuccess?: () => void;
}) {
  const [action, setAction] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const [fee, setFee] = useState<number>(0);
  const [pin, setPin] = useState("");
  const [step, setStep] = useState<"choose" | "amount" | "confirm" | "success">(
    "choose",
  );
  const [error, setError] = useState("");

  // Demo: relaxed mode overrun fee
  const handleAmount = (amt: string) => {
    setAmount(amt);
    if (action === "withdraw-budget" && Number(amt) > 10000) {
      setFee(Math.round((Number(amt) - 10000) * 0.035));
    } else {
      setFee(0);
    }
    setStep("confirm");
  };

  const handleConfirm = () => {
    setError("");
    if (!/^\d{4,6}$/.test(pin)) {
      setError("PIN must be 4-6 digits");
      return;
    }
    setStep("success");
    setTimeout(() => {
      if (onSuccess) onSuccess();
      setStep("choose");
      setAction(null);
      setAmount("");
      setFee(0);
      setPin("");
    }, 1200);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-[16px] shadow-lg p-8 w-full max-w-sm relative" style={{fontFamily: "'Inter', sans-serif", boxShadow: "0 6px 24px 0 rgba(26,95,122,0.13), 0 1.5px 0 #F4A261 inset"}}>
        {step === "choose" && (
          <>
            <h2 className="text-xl font-bold mb-4">Money Movement</h2>
            <div className="flex flex-wrap gap-2 mb-4">
              {recent.map((r) => (
                <button
                  key={r.key}
                  className="bg-[#F8F9FA] px-3 py-1 rounded-full text-[#1A5F7A] font-semibold shadow" style={{boxShadow: "2px 2px 0 #F4A26133"}}
                  onClick={() => {
                    setAction(r.key);
                    setAmount(String(r.amount));
                    setStep("confirm");
                  }}
                >
                  {r.label}
                </button>
              ))}
            </div>
            <div className="flex flex-col gap-3">
              {actions.map((a) => (
                <button
                  key={a.key}
                  className="bg-[#1A5F7A] text-white px-4 py-2 rounded-[12px] shadow" style={{boxShadow: "2px 2px 0 #F4A26133"}}
                  onClick={() => {
                    setAction(a.key);
                    setStep("amount");
                  }}
                >
                  {a.label}
                </button>
              ))}
            </div>
          </>
        )}
        {step === "amount" && (
          <div>
            <h3 className="font-bold mb-2">Enter Amount</h3>
            <input
              type="number"
              className="w-full border border-[#1A5F7A] p-3 rounded-[12px] text-2xl text-center mb-4 font-semibold"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              autoFocus
              style={{fontFamily: "'Inter', sans-serif"}}
            />
            <div className="grid grid-cols-3 gap-2 mb-4">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((n) => (
                <button
                  key={n}
                  className="bg-[#F8F9FA] text-xl py-3 rounded-[12px] shadow" style={{boxShadow: "2px 2px 0 #F4A26122"}}
                  onClick={() => setAmount((a) => a + n)}
                >
                  {n}
                </button>
              ))}
              <button
                className="bg-[#F8F9FA] py-3 rounded-[12px] shadow" style={{boxShadow: "2px 2px 0 #F4A26122"}}
                onClick={() => setAmount("")}
              >
                Clear
              </button>
              <button
                className="bg-[#F4A261] text-white py-3 rounded-[12px] col-span-2 shadow" style={{boxShadow: "2px 2px 0 #1A5F7A33"}}
                onClick={() => handleAmount(amount)}
              >
                Continue
              </button>
            </div>
          </div>
        )}
        {step === "confirm" && (
          <div>
            <h3 className="font-bold mb-2">Confirm Transaction</h3>
            <div className="mb-2">
              Action:{" "}
              <span className="font-semibold text-[#1A5F7A]">
                {actions.find((a) => a.key === action)?.label}
              </span>
            </div>
            <div className="mb-2">
              Amount:{" "}
              <span className="font-semibold text-[#1A5F7A]">
                ₦{Number(amount).toLocaleString()}
              </span>
            </div>
            {fee > 0 && (
              <div className="mb-2 text-[#ED6C02] font-semibold">
                Fee: ₦{fee.toLocaleString()} (for overrun)
              </div>
            )}
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
            {error && <div className="text-red-500">{error}</div>}
            <button
              className="w-full bg-green-600 text-white py-2 rounded mt-4 font-semibold"
              onClick={handleConfirm}
            >
              Confirm
            </button>
          </div>
        )}
        {step === "success" && (
          <div className="text-center text-green-600 font-bold text-lg">
            Transaction successful!
          </div>
        )}
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-700"
          onClick={() => setStep("choose")}
        >
          ×
        </button>
      </div>
    </div>
  );
}
