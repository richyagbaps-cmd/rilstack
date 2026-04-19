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
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-sm relative">
        {step === "choose" && (
          <>
            <h2 className="text-xl font-bold mb-4">Money Movement</h2>
            <div className="flex flex-wrap gap-2 mb-4">
              {recent.map((r) => (
                <button
                  key={r.key}
                  className="bg-blue-50 px-3 py-1 rounded-full text-blue-700 font-semibold"
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
                  className="bg-blue-600 text-white px-4 py-2 rounded"
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
              className="w-full border p-3 rounded text-2xl text-center mb-4"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              autoFocus
            />
            <div className="grid grid-cols-3 gap-2 mb-4">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((n) => (
                <button
                  key={n}
                  className="bg-gray-100 text-xl py-3 rounded"
                  onClick={() => setAmount((a) => a + n)}
                >
                  {n}
                </button>
              ))}
              <button
                className="bg-gray-200 py-3 rounded"
                onClick={() => setAmount("")}
              >
                Clear
              </button>
              <button
                className="bg-blue-600 text-white py-3 rounded col-span-2"
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
              <span className="font-semibold">
                {actions.find((a) => a.key === action)?.label}
              </span>
            </div>
            <div className="mb-2">
              Amount:{" "}
              <span className="font-semibold">
                ₦{Number(amount).toLocaleString()}
              </span>
            </div>
            {fee > 0 && (
              <div className="mb-2 text-yellow-700">
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
