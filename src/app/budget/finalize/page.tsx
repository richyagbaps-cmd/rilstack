"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function BudgetFinalize() {
  const [terms, setTerms] = useState(false);
  const [pin, setPin] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
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
    // Save budget as finalized (can POST to backend here)
    localStorage.setItem("budget_finalized", "true");
    setTimeout(() => router.push("/dashboard"), 800);
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
