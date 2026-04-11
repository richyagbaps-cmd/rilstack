import React, { useState } from "react";

interface TermsPinStepProps {
  mode: "strict" | "relaxed";
  onConfirm: (pin: string) => void;
}

const TERMS = {
  strict: `\
Strict Mode Terms & Conditions\n\n- All funds are locked for the selected period (minimum 10 days per pocket).\n- Early withdrawal is not allowed except for emergencies (subject to admin approval).\n- You agree to abide by the lock schedule you set for each pocket.\n- The platform is not liable for losses due to your spending choices.\n`,
  relaxed: `\
Relaxed Mode Terms & Conditions\n\n- You may withdraw from any pocket at any time.\n- Each withdrawal incurs a 3.5% penalty fee.\n- You agree to the penalty and understand its impact on your savings.\n- The platform is not liable for losses due to your spending choices.\n`,
};

export default function TermsPinStep({ mode, onConfirm }: TermsPinStepProps) {
  const [agreed, setAgreed] = useState(false);
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  const handleConfirm = () => {
    if (!agreed) {
      setError("You must agree to the terms.");
      return;
    }
    if (!/^\d{6}$/.test(pin)) {
      setError("Enter your 6-digit PIN.");
      return;
    }
    setError("");
    onConfirm(pin);
  };

  return (
    <div className="w-full max-w-md mx-auto mt-4">
      <div className="mb-4 text-lg font-semibold text-[#2c3e5f]">Terms & PIN Confirmation</div>
      <div className="bg-[#f3f4fa] rounded-lg p-4 mb-4 max-h-48 overflow-y-auto whitespace-pre-line text-sm text-[#2c3e5f]">
        {TERMS[mode]}
      </div>
      <div className="flex items-center gap-2 mb-4">
        <input type="checkbox" id="agree" checked={agreed} onChange={e => setAgreed(e.target.checked)} />
        <label htmlFor="agree" className="text-[#2c3e5f] text-sm cursor-pointer">
          I agree to the terms and understand the {mode === "relaxed" ? "penalty for early withdrawal" : "lock rules"}.
        </label>
      </div>
      <input
        type="password"
        inputMode="numeric"
        pattern="\d{6}"
        maxLength={6}
        className="w-full px-3 py-2 rounded border border-[#d1d5db] mb-2 text-center tracking-widest text-lg"
        placeholder="Enter 6-digit PIN"
        value={pin}
        onChange={e => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
      />
      {error && <div className="text-red-600 text-sm mb-2">{error}</div>}
      <button className="w-full bg-[#00e096] text-white px-4 py-2 rounded font-semibold mt-2" onClick={handleConfirm}>
        Confirm & Create Budget
      </button>
    </div>
  );
}
