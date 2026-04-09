"use client";
import React from "react";


function WithdrawalBankSection() {
  const [bankName, setBankName] = React.useState("");
  const [accountNumber, setAccountNumber] = React.useState("");
  const [accountName, setAccountName] = React.useState("");
  const [success, setSuccess] = React.useState("");
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [confirmedName, setConfirmedName] = React.useState("");

  React.useEffect(() => {
    const saved = localStorage.getItem("rilstack_bank");
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setBankName(data.bankName || "");
        setAccountNumber(data.accountNumber || "");
        setAccountName(data.accountName || "");
      } catch {}
    }
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setConfirmedName("");
    if (!bankName.trim() || !accountNumber.trim()) {
      setError("Bank name and account number are required.");
      return;
    }
    setLoading(true);
    try {
      // Map bank name to bank code (should be dynamic in production)
      const bankCodes: Record<string, string> = {
        "Access Bank": "044",
        "GTBank": "058",
        "First Bank": "011",
        "UBA": "033",
        "Zenith Bank": "057",
        // Add more as needed
      };
      const code = bankCodes[bankName] || bankName;
      const res = await fetch("/api/flutterwave/resolve-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ account_number: accountNumber, account_bank: code }),
      });
      const data = await res.json();
      if (data.status === "success" && data.data?.account_name) {
        setConfirmedName(data.data.account_name);
        setAccountName(data.data.account_name);
        localStorage.setItem("rilstack_bank", JSON.stringify({ bankName, accountNumber, accountName: data.data.account_name }));
        setSuccess("Bank details confirmed and saved.");
      } else {
        setError(data.message || "Could not confirm account. Check details and try again.");
      }
    } catch (err) {
      setError("Network or server error. Try again.");
    } finally {
      setLoading(false);
      setTimeout(() => setSuccess("");
    }, 2000);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#f3f4fa] flex flex-col items-center py-8">
      <div className="w-full max-w-md mx-auto bg-white rounded-2xl shadow p-6">
        <h1 className="text-2xl font-bold text-[#2c3e5f] mb-6 text-center">Change Withdrawal Bank</h1>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Bank Name</label>
            <input
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500"
              value={bankName}
              onChange={e => setBankName(e.target.value)}
              placeholder="e.g. Access Bank"
              list="bank-list"
            />
            <datalist id="bank-list">
              <option value="Access Bank" />
              <option value="GTBank" />
              <option value="First Bank" />
              <option value="UBA" />
              <option value="Zenith Bank" />
            </datalist>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Account Number</label>
            <input
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500"
              value={accountNumber}
              onChange={e => setAccountNumber(e.target.value.replace(/[^0-9]/g, ""))}
              maxLength={10}
              placeholder="e.g. 0123456789"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Account Name</label>
            <input
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500"
              value={confirmedName || accountName}
              onChange={e => setAccountName(e.target.value)}
              placeholder="e.g. John Doe"
              readOnly={!!confirmedName}
            />
            {confirmedName && (
              <div className="text-green-700 text-xs mt-1">Account name confirmed: {confirmedName}</div>
            )}
          </div>
          {error && <div className="text-red-600 text-xs">{error}</div>}
          {success && <div className="text-green-600 text-xs">{success}</div>}
          <button
            type="submit"
            className="rounded-xl bg-[#2c3e5f] px-5 py-3 text-sm font-semibold text-white hover:bg-[#1e2d46] w-full"
            disabled={loading}
          >{loading ? "Confirming..." : "Save Bank Details"}</button>
        </form>
      </div>
    </div>
  );
}

export default WithdrawalBankSection;
