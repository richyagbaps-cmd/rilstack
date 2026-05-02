"use client";
import React from "react";
import Link from "next/link";

interface SavedBankView {
  bankName: string;
  accountNumber: string;
  accountName: string;
}

function WithdrawalBankSection() {
  const [bankName, setBankName] = React.useState("");
  const [accountNumber, setAccountNumber] = React.useState("");
  const [accountName, setAccountName] = React.useState("");
  const [success, setSuccess] = React.useState("");
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [loadingInitial, setLoadingInitial] = React.useState(true);
  const [confirmedName, setConfirmedName] = React.useState("");
  const [savedBank, setSavedBank] = React.useState<SavedBankView | null>(null);

  React.useEffect(() => {
    const loadBankSettings = async () => {
      try {
        const res = await fetch("/api/settings/bank", { method: "GET" });
        const payload = await res.json();

        if (res.ok && payload?.bank) {
          const nextBank: SavedBankView = {
            bankName: payload.bank.bankName || "",
            accountNumber: payload.bank.accountNumber || "",
            accountName: payload.bank.accountName || "",
          };
          setBankName(nextBank.bankName);
          setAccountNumber(nextBank.accountNumber);
          setAccountName(nextBank.accountName);
          setSavedBank(nextBank);
          return;
        }
      } catch {}

      const saved = localStorage.getItem("rilstack_bank");
      if (saved) {
        try {
          const data = JSON.parse(saved);
          setBankName(data.bankName || "");
          setAccountNumber(data.accountNumber || "");
          setAccountName(data.accountName || "");
        } catch {}
      }
    };

    loadBankSettings().finally(() => setLoadingInitial(false));
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

    if (!/^\d{10}$/.test(accountNumber.trim())) {
      setError("Account number must be exactly 10 digits.");
      return;
    }

    setLoading(true);
    try {
      const bankCodes: Record<string, string> = {
        "Access Bank": "044",
        GTBank: "058",
        "First Bank": "011",
        UBA: "033",
        "Zenith Bank": "057",
      };

      const code = bankCodes[bankName] || bankName;
      const verifyRes = await fetch("/api/flutterwave/resolve-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          account_number: accountNumber.trim(),
          account_bank: code,
        }),
      });
      const verifyData = await verifyRes.json();

      if (verifyData.status !== "success" || !verifyData.data?.account_name) {
        throw new Error(
          verifyData.message || "Could not confirm account. Check details and try again.",
        );
      }

      const resolvedAccountName = String(verifyData.data.account_name);
      setConfirmedName(resolvedAccountName);
      setAccountName(resolvedAccountName);

      const saveRes = await fetch("/api/settings/bank", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bankName: bankName.trim(),
          accountNumber: accountNumber.trim(),
          accountName: resolvedAccountName,
        }),
      });
      const savePayload = await saveRes.json();

      if (!saveRes.ok) {
        throw new Error(savePayload.error || "Failed to save bank details. Please try again.");
      }

      const nextBank: SavedBankView = {
        bankName: savePayload?.bank?.bankName || bankName.trim(),
        accountNumber: savePayload?.bank?.accountNumber || accountNumber.trim(),
        accountName: savePayload?.bank?.accountName || resolvedAccountName,
      };

      setSavedBank(nextBank);
      setBankName(nextBank.bankName);
      setAccountNumber(nextBank.accountNumber);
      setAccountName(nextBank.accountName);

      localStorage.setItem("rilstack_bank", JSON.stringify(nextBank));
      setSuccess("Bank details saved successfully.");
    } catch (err: any) {
      setError(err.message || "Network or server error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#f3f4fa] flex flex-col items-center py-8 px-4">
      <div className="w-full max-w-md mx-auto bg-white rounded-2xl shadow p-6">
        <h1 className="text-2xl font-bold text-[#2c3e5f] mb-6 text-center">
          Change Withdrawal Bank
        </h1>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Bank Name
            </label>
            <input
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 disabled:bg-slate-100"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              placeholder="e.g. Access Bank"
              list="bank-list"
              disabled={loadingInitial || loading}
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
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Account Number
            </label>
            <input
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 disabled:bg-slate-100"
              value={accountNumber}
              onChange={(e) =>
                setAccountNumber(e.target.value.replace(/[^0-9]/g, ""))
              }
              maxLength={10}
              placeholder="e.g. 0123456789"
              disabled={loadingInitial || loading}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Account Name
            </label>
            <input
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 disabled:bg-slate-100"
              value={confirmedName || accountName}
              onChange={(e) => setAccountName(e.target.value)}
              placeholder="e.g. John Doe"
              readOnly={!!confirmedName}
              disabled={loadingInitial || loading}
            />
            {confirmedName && (
              <div className="text-green-700 text-xs mt-1">
                Account name confirmed: {confirmedName}
              </div>
            )}
          </div>

          {error && <div className="text-red-600 text-xs">{error}</div>}
          {success && <div className="text-green-600 text-xs">{success}</div>}

          {savedBank && (
            <div className="rounded-xl border border-[#d8e2ef] bg-[#f8fafc] px-4 py-3 text-xs text-slate-700">
              <p className="font-semibold text-slate-900">Saved</p>
              <p className="mt-1">Bank: {savedBank.bankName || "-"}</p>
              <p>Account Number: {savedBank.accountNumber || "-"}</p>
              <p>Account Name: {savedBank.accountName || "-"}</p>
            </div>
          )}

          <button
            type="submit"
            className="rounded-xl bg-[#2c3e5f] px-5 py-3 text-sm font-semibold text-white hover:bg-[#1e2d46] w-full disabled:cursor-not-allowed disabled:opacity-70"
            disabled={loadingInitial || loading}
          >
            {loading ? "Saving..." : "Save Bank Details"}
          </button>

          <Link
            href="/settings"
            className="block text-center text-sm font-medium text-[#2c3e5f] underline"
          >
            Back to Settings
          </Link>
        </form>
      </div>
    </div>
  );
}

export default WithdrawalBankSection;
