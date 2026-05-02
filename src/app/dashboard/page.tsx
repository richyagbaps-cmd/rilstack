"use client";

import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState, Suspense, useCallback } from "react";
import Link from "next/link";
import {
  Bell,
  Eye,
  EyeOff,
  ArrowDownCircle,
  ArrowUpCircle,
  PiggyBank,
  Lock,
  TrendingUp,
  Wallet,
  Calculator,
  ChevronRight,
  Copy,
  Check,
  RefreshCw,
  ShieldCheck,
  HelpCircle,
  Settings,
  User,
  Home,
} from "lucide-react";
import DashboardFab from "@/components/DashboardFab";
import PinModal from "@/components/PinModal";

// Helpers
function fmt(v: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(v);
}
function mask(hidden: boolean, v: number) {
  return hidden ? "₦ ••••••" : fmt(v);
}
function greet(name: string) {
  const h = new Date().getHours();
  const part = h < 12 ? "Morning" : h < 17 ? "Afternoon" : "Evening";
  return `Good ${part}, ${name}`;
}

// Types
type DepositMethod = "card" | "transfer" | "ussd";
type PinGate = null | { action: "deposit_method" } | { action: "withdraw" };
type SheetState =
  | { type: "none" }
  | { type: "deposit_method" }
  | { type: "deposit_dva"; accountNumber: string; accountName: string; bankName: string; amount: number }
  | { type: "withdraw" };
type Tx = { id: string; label: string; amount: number; time: string; sign: "+" | "-" };

const BANKS = [
  { name: "Access Bank", code: "044" },
  { name: "First Bank", code: "011" },
  { name: "GTBank", code: "058" },
  { name: "Keystone Bank", code: "082" },
  { name: "Kuda Bank", code: "090267" },
  { name: "OPay", code: "100004" },
  { name: "Palmpay", code: "100033" },
  { name: "Polaris Bank", code: "076" },
  { name: "Stanbic IBTC", code: "221" },
  { name: "Sterling Bank", code: "232" },
  { name: "UBA", code: "033" },
  { name: "Union Bank", code: "032" },
  { name: "Unity Bank", code: "215" },
  { name: "VFD Microfinance Bank", code: "090110" },
  { name: "Wema Bank", code: "035" },
  { name: "Zenith Bank", code: "057" },
];

function DashboardContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [walletBalance, setWalletBalance] = useState(0);
  const [walletAvailable, setWalletAvailable] = useState(0);
  const [walletLoading, setWalletLoading] = useState(false);
  const [walletActionLoading, setWalletActionLoading] = useState<"deposit" | "withdraw" | null>(null);
  const [walletDva, setWalletDva] = useState<{ accountNumber: string; accountName: string; bankName: string } | null>(null);
  const [hidden, setHidden] = useState(true);
  const [sheet, setSheet] = useState<SheetState>({ type: "none" });
  const [toast, setToast] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [copied, setCopied] = useState(false);
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawBank, setWithdrawBank] = useState("");
  const [withdrawBankCode, setWithdrawBankCode] = useState("");
  const [withdrawAccNum, setWithdrawAccNum] = useState("");
  const [withdrawAccName, setWithdrawAccName] = useState("");
  const [pinGate, setPinGate] = useState<PinGate>(null);
  const [txns] = useState<Tx[]>([]);

  // Auth guard
  useEffect(() => {
    if (status === "unauthenticated") { router.replace("/"); return; }
    if (status === "authenticated") {
      const u = session?.user as Record<string, unknown>;
      const pc = u?.profileComplete;
      const dg = u?.dashboardAccessGranted;
      // Only redirect if profile is explicitly incomplete AND access was not granted
      if (pc === false && dg !== true) router.replace("/profile/complete");
    }
  }, [status, router, session]);

  // Load wallet
  const loadWallet = useCallback(async () => {
    if (!session?.user?.email) return;
    setWalletLoading(true);
    try {
      const res = await fetch(
        `/api/payment/account?email=${encodeURIComponent(session.user.email)}`,
        { cache: "no-store" },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to load wallet");
      const acc = (data?.accounts || []).find((a: { type?: string }) => a.type === "checking") || data?.accounts?.[0];
      setWalletBalance(Number(acc?.balance || 0));
      setWalletAvailable(Number(acc?.availableBalance || 0));
      if (acc?.accountNumber) {
        setWalletDva({
          accountNumber: String(acc.accountNumber),
          accountName: String(acc.accountName || ""),
          bankName: String(acc.bankName || ""),
        });
      }
    } catch {
      setWalletBalance(0); setWalletAvailable(0);
    } finally {
      setWalletLoading(false);
    }
  }, [session?.user?.email]);

  useEffect(() => {
    if (status === "authenticated") {
      void loadWallet();
      // Silently provision DVA in background so every user has one ready
      fetch("/api/wallet/setup", { method: "POST", headers: { "Content-Type": "application/json" } })
        .then((r) => r.json())
        .then((d) => {
          if (d?.wallet?.accountNumber && !walletDva?.accountNumber) {
            setWalletDva({
              accountNumber: String(d.wallet.accountNumber),
              accountName: String(d.wallet.accountName || ""),
              bankName: String(d.wallet.bankName || ""),
            });
          }
        })
        .catch(() => { /* non-fatal */ });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, loadWallet]);

  // Verify deposit redirect
  useEffect(() => {
    if (status !== "authenticated") return;
    const ref = searchParams.get("reference") || searchParams.get("trxref") || searchParams.get("trxRef");
    if (!ref) return;
    const key = `rilstack_verified_${ref}`;
    if (sessionStorage.getItem(key)) return;
    (async () => {
      try {
        const res = await fetch("/api/payment/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reference: ref }),
        });
        const data = await res.json();
        if (!res.ok || !data?.success) return;
        sessionStorage.setItem(key, "1");
        const amt = Number(data?.amount || 0);
        if (amt > 0) {
          setWalletBalance((b) => b + amt);
          setWalletAvailable((b) => b + amt);
        }
        showToast(`Deposit of ${fmt(amt)} confirmed!`);
        await loadWallet();
        router.replace("/dashboard");
      } catch { /* silent */ }
    })();
  }, [status, searchParams, loadWallet, router]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 4000);
  };

  // Deposit flow
  const handleDepositBtn = () => {
    setErrorMsg(""); setDepositAmount("");
    setPinGate({ action: "deposit_method" });
  };

  const submitDeposit = async (method: DepositMethod) => {
    if (!session?.user?.email) return;
    const amount = Number(depositAmount.replace(/,/g, ""));
    if (!Number.isFinite(amount) || amount < 100) { setErrorMsg("Minimum deposit is ₦100."); return; }

    // For Transfer: show DVA directly from state (no API call needed)
    if (method === "transfer") {
      if (walletDva?.accountNumber) {
        setSheet({ type: "deposit_dva", accountNumber: walletDva.accountNumber, accountName: walletDva.accountName, bankName: walletDva.bankName, amount });
        return;
      }
      // DVA not yet provisioned — provision now
      setWalletActionLoading("deposit"); setErrorMsg("");
      try {
        const res = await fetch("/api/wallet/setup", { method: "POST", headers: { "Content-Type": "application/json" } });
        const data = await res.json();
        if (!res.ok || !data?.wallet?.accountNumber) throw new Error(data?.error || "Could not set up your virtual account. Please try again.");
        setWalletDva({ accountNumber: String(data.wallet.accountNumber), accountName: String(data.wallet.accountName || ""), bankName: String(data.wallet.bankName || "") });
        setSheet({ type: "deposit_dva", accountNumber: String(data.wallet.accountNumber), accountName: String(data.wallet.accountName || ""), bankName: String(data.wallet.bankName || ""), amount });
      } catch (err) {
        setErrorMsg(err instanceof Error ? err.message : "Deposit failed");
      } finally { setWalletActionLoading(null); }
      return;
    }

    setWalletActionLoading("deposit"); setErrorMsg("");
    try {
      const res = await fetch("/api/payment/deposit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount, method, description: "Wallet top-up",
          userEmail: session.user.email,
          callbackUrl: `${window.location.origin}/dashboard`,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data?.success) throw new Error(data?.error || "Deposit failed");
      if (data.paymentUrl) {
        setSheet({ type: "none" });
        window.location.href = data.paymentUrl as string;
        return;
      }
      showToast("Deposit initialized.");
      setSheet({ type: "none" });
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Deposit failed");
    } finally { setWalletActionLoading(null); }
  };

  // Withdraw flow
  const handleWithdrawBtn = () => {
    setErrorMsg("");
    try {
      const saved = localStorage.getItem("rilstack_bank");
      if (saved) {
        const p = JSON.parse(saved) as { bankName?: string; bankCode?: string; accountNumber?: string; accountName?: string };
        setWithdrawBank(p.bankName || ""); setWithdrawBankCode(p.bankCode || "");
        setWithdrawAccNum(p.accountNumber || ""); setWithdrawAccName(p.accountName || "");
      } else {
        setWithdrawBank(""); setWithdrawBankCode(""); setWithdrawAccNum(""); setWithdrawAccName("");
      }
    } catch { setWithdrawBank(""); setWithdrawBankCode(""); setWithdrawAccNum(""); setWithdrawAccName(""); }
    setPinGate({ action: "withdraw" });
  };

  const submitWithdraw = async () => {
    if (!session?.user?.email) return;
    const amount = Number(withdrawAmount.replace(/,/g, ""));
    if (!withdrawBankCode || !withdrawAccNum || !withdrawAccName) { setErrorMsg("Fill all bank details."); return; }
    if (!Number.isFinite(amount) || amount < 100) { setErrorMsg("Minimum is ₦100."); return; }
    if (amount > walletAvailable) { setErrorMsg("Insufficient balance."); return; }
    localStorage.setItem("rilstack_bank", JSON.stringify({
      bankName: withdrawBank, bankCode: withdrawBankCode,
      accountNumber: withdrawAccNum, accountName: withdrawAccName,
    }));
    setSheet({ type: "none" }); setWalletActionLoading("withdraw"); setErrorMsg("");
    try {
      const res = await fetch("/api/payment/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount, accountNumber: withdrawAccNum, bankCode: withdrawBankCode,
          recipientName: withdrawAccName, narration: "Wallet withdrawal",
          userEmail: session.user.email,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data?.success) throw new Error(data?.error || "Withdrawal failed");
      showToast(data?.message || "Withdrawal initiated!");
      await loadWallet(); router.replace("/dashboard");
    } catch (err) {
      const m = err instanceof Error ? err.message : "Withdrawal failed";
      setErrorMsg(/insufficient|balance/i.test(m) ? "Insufficient balance." : m);
    } finally { setWalletActionLoading(null); }
  };

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F4F6F8]">
        <RefreshCw className="h-6 w-6 animate-spin text-[#0AB68B]" />
      </div>
    );
  }
  if (!session) return null;

  const firstName = session.user?.name?.split(" ")[0] || "there";
  const initials = session.user?.name?.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase() || "U";

  return (
    <div className="min-h-screen bg-[#F4F6F8] pb-24" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* Top bar */}
      <header className="flex items-center justify-between px-5 pb-3 pt-5">
        <Link href="/profile" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0AB68B] text-[13px] font-bold text-white shadow-md">
            {initials}
          </div>
          <div>
            <p className="text-[11px] text-slate-400">Welcome back</p>
            <p className="text-[14px] font-semibold text-[#0F2C3D]">{greet(firstName)}</p>
          </div>
        </Link>
        <Link href="/notifications" className="relative flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-sm">
          <Bell className="h-5 w-5 text-[#0F2C3D]" strokeWidth={2} />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
        </Link>
      </header>

      {/* Hero card */}
      <div className="mx-4 mb-5 overflow-hidden rounded-3xl shadow-xl"
        style={{ background: "linear-gradient(135deg, #0F2C3D 0%, #0A5C45 60%, #0AB68B 100%)" }}>
        <div className="px-5 pb-6 pt-5">
          <div className="mb-1 flex items-center justify-between">
            <span className="text-[12px] font-medium text-white/70">Wallet Balance</span>
            <button type="button" onClick={() => setHidden((v) => !v)}
              className="flex items-center gap-1 text-white/60 transition hover:text-white" aria-label="Toggle balance">
              {hidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              <span className="text-[11px]">{hidden ? "Show" : "Hide"}</span>
            </button>
          </div>
          <p className="mt-1 text-[32px] font-bold tracking-tight text-white">
            {walletLoading ? <RefreshCw className="inline h-5 w-5 animate-spin opacity-60" /> : mask(hidden, walletBalance)}
          </p>
          <p className="mt-0.5 text-[12px] text-white/60">Available: {mask(hidden, walletAvailable)}</p>
          <div className="mt-5 flex gap-3">
            <button type="button" onClick={handleDepositBtn} disabled={walletActionLoading !== null}
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-white/20 py-3 text-[13px] font-semibold text-white backdrop-blur-sm transition active:scale-95 disabled:opacity-60">
              <ArrowDownCircle className="h-4 w-4" />
              {walletActionLoading === "deposit" ? "Processing…" : "Fund Wallet"}
            </button>
            <button type="button" onClick={handleWithdrawBtn} disabled={walletActionLoading !== null}
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-white/30 py-3 text-[13px] font-semibold text-white transition active:scale-95 disabled:opacity-60">
              <ArrowUpCircle className="h-4 w-4" />
              {walletActionLoading === "withdraw" ? "Processing…" : "Withdraw"}
            </button>
          </div>
        </div>
      </div>

      {/* Product cards */}
      <div className="px-4">
        <p className="mb-3 text-[13px] font-bold text-[#0F2C3D]">Your Products</p>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Savings", sub: "Up to 18% p.a.", icon: PiggyBank, color: "#0AB68B", bg: "#E6F7F3", bar: "#0AB68B", href: "/savings" },
            { label: "SafeLock", sub: "Lock & earn more", icon: Lock, color: "#2D65E0", bg: "#EBF0FB", bar: "#2D65E0", href: "/savings/safe-lock" },
            { label: "Investments", sub: "T-Bills, Bonds, Funds", icon: TrendingUp, color: "#7C3AED", bg: "#F3EFFE", bar: "#7C3AED", href: "/investments" },
            { label: "Budget", sub: "Track your spending", icon: Calculator, color: "#F4A261", bg: "#FEF3EB", bar: "#F4A261", href: "/budgets" },
          ].map((p) => (
            <Link key={p.label} href={p.href}
              className="block overflow-hidden rounded-2xl bg-white shadow-sm transition hover:shadow-md active:scale-[0.98]">
              <div className="h-1.5" style={{ background: p.bar }} />
              <div className="p-4">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full" style={{ background: p.bg }}>
                  <p.icon className="h-5 w-5" style={{ color: p.color }} />
                </div>
                <p className="text-[13px] font-bold text-[#0F2C3D]">{p.label}</p>
                <p className="mt-0.5 text-[11px] text-slate-500">{p.sub}</p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-[11px] font-semibold" style={{ color: p.color }}>Explore</span>
                  <ChevronRight className="h-3.5 w-3.5" style={{ color: p.color }} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Quick links */}
      <div className="mt-5 px-4">
        <p className="mb-3 text-[13px] font-bold text-[#0F2C3D]">Quick Actions</p>
        <div className="flex gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {[
            { label: "Report Fraud", icon: ShieldCheck, href: "/report-fraud", cls: "text-red-500 bg-red-50" },
            { label: "Help Center", icon: HelpCircle, href: "/contact-support", cls: "text-blue-500 bg-blue-50" },
            { label: "Settings", icon: Settings, href: "/settings", cls: "text-slate-600 bg-slate-100" },
            { label: "Profile", icon: User, href: "/profile", cls: "text-[#0AB68B] bg-[#E6F7F3]" },
          ].map((item) => (
            <Link key={item.label} href={item.href}
              className="flex min-w-[80px] flex-col items-center gap-2 rounded-2xl bg-white px-3 py-3.5 shadow-sm transition active:scale-95">
              <div className={`flex h-10 w-10 items-center justify-center rounded-full ${item.cls}`}>
                <item.icon className="h-4 w-4" strokeWidth={2} />
              </div>
              <span className="text-center text-[11px] font-medium text-slate-600">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent transactions */}
      <div className="mt-5 px-4">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-[13px] font-bold text-[#0F2C3D]">Recent Activity</p>
          <Link href="/history" className="text-[12px] font-semibold text-[#0AB68B]">See all</Link>
        </div>
        <div className="rounded-2xl bg-white shadow-sm">
          {txns.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <Wallet className="mb-3 h-10 w-10 text-slate-200" />
              <p className="text-[13px] font-medium text-slate-500">No transactions yet</p>
              <p className="mt-1 text-[11px] text-slate-400">Fund your wallet to get started</p>
            </div>
          ) : (
            <ul className="divide-y divide-slate-50">
              {txns.slice(0, 5).map((t) => (
                <li key={t.id} className="flex items-center justify-between px-4 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-full ${t.sign === "+" ? "bg-[#E6F7F3]" : "bg-red-50"}`}>
                      {t.sign === "+" ? <ArrowDownCircle className="h-4 w-4 text-[#0AB68B]" /> : <ArrowUpCircle className="h-4 w-4 text-red-400" />}
                    </div>
                    <div>
                      <p className="text-[13px] font-medium text-[#0F2C3D]">{t.label}</p>
                      <p className="text-[11px] text-slate-400">{t.time}</p>
                    </div>
                  </div>
                  <p className={`text-[13px] font-bold ${t.sign === "+" ? "text-[#0AB68B]" : "text-red-500"}`}>
                    {t.sign}{fmt(Math.abs(t.amount))}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-stretch border-t border-slate-100 bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
        {([
          { href: "/dashboard", label: "Home", icon: Home },
          { href: "/savings", label: "Savings", icon: PiggyBank },
          { href: "/investments", label: "Invest", icon: TrendingUp },
          { href: "/budgets", label: "Budget", icon: Calculator },
          { href: "/profile", label: "Account", icon: User },
        ] as { href: string; label: string; icon: React.ComponentType<{ className?: string; strokeWidth?: number }> }[]).map(({ href, label, icon: Icon }) => {
          const active = typeof window !== "undefined" && window.location.pathname === href;
          return (
            <Link key={href} href={href}
              className={`flex flex-1 flex-col items-center justify-center gap-0.5 transition-colors ${active ? "text-[#0AB68B]" : "text-slate-400 hover:text-slate-600"}`}>
              <Icon className="h-5 w-5" strokeWidth={active ? 2.5 : 2} />
              <span className={`text-[10px] ${active ? "font-bold" : "font-medium"}`}>{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* PIN Modal */}
      <PinModal
        open={pinGate !== null}
        title={pinGate?.action === "deposit_method" ? "Confirm Fund Wallet" : pinGate?.action === "withdraw" ? "Confirm Withdrawal" : "Confirm Action"}
        subtitle="Enter your 4-digit PIN to proceed"
        onSuccess={() => {
          if (pinGate?.action === "deposit_method") { setPinGate(null); setSheet({ type: "deposit_method" }); }
          else if (pinGate?.action === "withdraw") { setPinGate(null); setSheet({ type: "withdraw" }); }
          else setPinGate(null);
        }}
        onCancel={() => setPinGate(null)}
      />

      {/* Deposit sheet */}
      {sheet.type === "deposit_method" && (
        <BottomSheet title="Fund Wallet" onClose={() => setSheet({ type: "none" })}>
          <div className="space-y-3">
            <label className="block text-[12px] font-semibold text-slate-600">Amount (₦)</label>
            <input type="number" inputMode="numeric" autoFocus
              placeholder="Enter amount (min ₦100)"
              value={depositAmount} onChange={(e) => setDepositAmount(e.target.value)}
              className="h-12 w-full rounded-xl border border-slate-200 px-4 text-[15px] text-[#0F2C3D] focus:border-[#0AB68B] focus:outline-none" />
            {errorMsg && <p className="text-[12px] text-red-500">{errorMsg}</p>}
            <p className="text-[12px] font-semibold text-slate-600">Choose payment method</p>
            <div className="grid grid-cols-3 gap-2">
              {(["card", "transfer", "ussd"] as DepositMethod[]).map((m) => (
                <button key={m} type="button" onClick={() => submitDeposit(m)}
                  disabled={walletActionLoading === "deposit"}
                  className="rounded-xl border-2 border-[#0AB68B] py-3 text-[13px] font-semibold text-[#0AB68B] transition active:bg-[#E6F7F3] disabled:opacity-60 disabled:cursor-not-allowed">
                  {walletActionLoading === "deposit" ? "…" : m === "ussd" ? "USSD" : m[0].toUpperCase() + m.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </BottomSheet>
      )}

      {/* DVA sheet */}
      {sheet.type === "deposit_dva" && (
        <BottomSheet title="Transfer to Your Wallet" onClose={() => { setSheet({ type: "none" }); void loadWallet(); }}>
          <p className="mb-4 text-[13px] text-slate-500">
            Send exactly <span className="font-bold text-[#0AB68B]">{fmt(sheet.amount)}</span> to this account.
          </p>
          <div className="space-y-3 rounded-2xl bg-[#F4F6F8] p-4">
            <InfoRow label="Bank" value={sheet.bankName} />
            <InfoRow label="Account Number" value={sheet.accountNumber}
              action={
                <button type="button" onClick={() => { navigator.clipboard.writeText(sheet.accountNumber); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                  className="flex items-center gap-1 text-[12px] font-semibold text-[#0AB68B]">
                  {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? "Copied!" : "Copy"}
                </button>
              } />
            <InfoRow label="Account Name" value={sheet.accountName} />
          </div>
          <p className="mt-3 text-[11px] text-slate-400">This is your permanent Rilstack virtual account number.</p>
          <button type="button" onClick={() => { setSheet({ type: "none" }); void loadWallet(); }}
            className="mt-5 h-12 w-full rounded-2xl bg-[#0AB68B] text-[14px] font-bold text-white shadow-md transition active:scale-[0.98]">Done</button>
        </BottomSheet>
      )}

      {/* Withdraw sheet */}
      {sheet.type === "withdraw" && (
        <BottomSheet title="Withdraw Funds" onClose={() => setSheet({ type: "none" })}>
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-[12px] font-semibold text-slate-600">Bank</label>
              <select className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-[14px] text-[#0F2C3D] focus:border-[#0AB68B] focus:outline-none"
                value={withdrawBank} onChange={(e) => { const b = BANKS.find((b) => b.name === e.target.value); setWithdrawBank(e.target.value); setWithdrawBankCode(b?.code || ""); }}>
                <option value="">Select bank…</option>
                {BANKS.map((b) => <option key={b.code} value={b.name}>{b.name}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-[12px] font-semibold text-slate-600">Account Number</label>
              <input type="text" inputMode="numeric" maxLength={10} placeholder="10-digit number"
                value={withdrawAccNum} onChange={(e) => setWithdrawAccNum(e.target.value.replace(/\D/g, ""))}
                className="h-12 w-full rounded-xl border border-slate-200 px-4 text-[14px] text-[#0F2C3D] focus:border-[#0AB68B] focus:outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-[12px] font-semibold text-slate-600">Account Name</label>
              <input type="text" placeholder="Account holder name"
                value={withdrawAccName} onChange={(e) => setWithdrawAccName(e.target.value)}
                className="h-12 w-full rounded-xl border border-slate-200 px-4 text-[14px] text-[#0F2C3D] focus:border-[#0AB68B] focus:outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-[12px] font-semibold text-slate-600">Amount (₦)</label>
              <input type="number" inputMode="numeric" placeholder="Min ₦100"
                value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)}
                className="h-12 w-full rounded-xl border border-slate-200 px-4 text-[14px] text-[#0F2C3D] focus:border-[#0AB68B] focus:outline-none" />
              <p className="mt-1 text-[11px] text-slate-400">Available: {mask(false, walletAvailable)}</p>
            </div>
            {errorMsg && <p className="text-[12px] text-red-500">{errorMsg}</p>}
            <button type="button" onClick={submitWithdraw} disabled={walletActionLoading !== null}
              className="mt-2 h-12 w-full rounded-2xl bg-[#0AB68B] text-[14px] font-bold text-white shadow-md transition active:scale-[0.98] disabled:opacity-60">
              {walletActionLoading === "withdraw" ? "Processing…" : "Confirm Withdrawal"}
            </button>
          </div>
        </BottomSheet>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-20 left-1/2 z-[200] -translate-x-1/2 animate-slide-up">
          <div className="rounded-2xl bg-[#0F2C3D] px-5 py-3 text-[13px] font-medium text-white shadow-lg">{toast}</div>
        </div>
      )}

      <DashboardFab />
    </div>
  );
}

function BottomSheet({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[90] flex flex-col items-center justify-end bg-black/50 backdrop-blur-[2px] animate-fade-in" onClick={onClose}>
      <div className="w-full max-w-md animate-slide-up overflow-y-auto rounded-t-[28px] bg-white px-5 pb-10 pt-5 shadow-2xl"
        style={{ maxHeight: "90dvh" }} onClick={(e) => e.stopPropagation()}>
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-slate-200" />
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-[16px] font-bold text-[#0F2C3D]">{title}</h3>
          <button type="button" onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200">✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function InfoRow({ label, value, action }: { label: string; value: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[12px] text-slate-500">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-[13px] font-semibold text-[#0F2C3D]">{value}</span>
        {action}
      </div>
    </div>
  );
}

export default function Dashboard() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-[#F4F6F8]">
        <RefreshCw className="h-6 w-6 animate-spin text-[#0AB68B]" />
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
