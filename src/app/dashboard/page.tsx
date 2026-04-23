"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, Suspense } from "react";
import DashboardTopBar from "@/components/DashboardTopBar";
import DashboardTabBar from "@/components/DashboardTabBar";
import DashboardFab from "@/components/DashboardFab";
import {
  AlertTriangle,
  Calculator,
  ChartLine,
  Coins,
  Feather,
  HelpCircle,
  Home,
  Lock,
  PiggyBank,
  Settings,
  Shield,
  TrendingUp,
  User,
  Wallet,
  Eye,
  EyeOff,
} from "lucide-react";

type TxType = "budget" | "savings" | "investment" | "penalty";

const BANK_CODES: Record<string, string> = {
  "Access Bank": "044",
  GTBank: "058",
  "First Bank": "011",
  UBA: "033",
  "Zenith Bank": "057",
};

type DashboardData = {
  netWorth: number;
  netWorthChangePct: number;
  budgetLeft: number;
  budgetTotal: number;
  totalSavings: number;
  interestToday: number;
  totalInvested: number;
  estReturns: number;
  budgetMode: "strict" | "relaxed";
  budgetSpentPct: number;
  budgetRange: string;
  categories: Array<{ name: string; spent: number; total: number }>;
  savingsGoal: { name: string; current: number; target: number };
  retirement: { name: string; locked: number; apy: number };
  fixedIncome: { amount: number; returnPct: number; daysLeft: number; progress: number };
  tx: Array<{ id: string; type: TxType; desc: string; amount: number; time: string }>;
};

const DEFAULT_DASHBOARD_DATA: DashboardData = {
  netWorth: 0,
  netWorthChangePct: 0,
  budgetLeft: 0,
  budgetTotal: 0,
  totalSavings: 0,
  interestToday: 0,
  totalInvested: 0,
  estReturns: 0,
  budgetMode: "strict",
  budgetSpentPct: 0,
  budgetRange: "",
  categories: [
    { name: "Food", spent: 0, total: 0 },
    { name: "Transport", spent: 0, total: 0 },
  ],
  savingsGoal: { name: "Emergency Fund", current: 0, target: 0 },
  retirement: { name: "Retirement", locked: 0, apy: 18 },
  fixedIncome: { amount: 0, returnPct: 0, daysLeft: 0, progress: 0 },
  tx: [],
};

function money(value: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(value);
}

function hiddenAmount(hidden: boolean, value: number) {
  return hidden ? "••••••" : money(value);
}

function metricIcon(key: "net" | "budget" | "savings" | "invest") {
  if (key === "net") return <Coins className="h-5 w-5 text-[#1A5F7A]" aria-hidden="true" />;
  if (key === "budget") return <Wallet className="h-5 w-5 text-[#1A5F7A]" aria-hidden="true" />;
  if (key === "savings") return <PiggyBank className="h-5 w-5 text-[#1A5F7A]" aria-hidden="true" />;
  return <ChartLine className="h-5 w-5 text-[#1A5F7A]" aria-hidden="true" />;
}

function txIcon(type: TxType) {
  if (type === "budget") return <Wallet className="h-4 w-4 text-[#1A5F7A]" aria-hidden="true" />;
  if (type === "savings") return <PiggyBank className="h-4 w-4 text-[#2E7D32]" aria-hidden="true" />;
  if (type === "investment") return <TrendingUp className="h-4 w-4 text-[#1A5F7A]" aria-hidden="true" />;
  return <AlertTriangle className="h-4 w-4 text-[#D32F2F]" aria-hidden="true" />;
}

function CompactProgress({ value }: { value: number }) {
  return (
    <div className="h-1 w-full rounded-full bg-slate-200">
      <div
        className="h-1 rounded-full bg-[#1A5F7A]"
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  );
}

function Ring({ percent }: { percent: number }) {
  const p = Math.max(0, Math.min(100, percent));
  return (
    <div
      className="relative grid h-[60px] w-[60px] place-items-center rounded-full"
      style={{
        background: `conic-gradient(#1A5F7A ${p * 3.6}deg, #dbe3ea 0deg)`,
      }}
    >
      <div className="grid h-[46px] w-[46px] place-items-center rounded-full bg-white text-[11px] font-bold text-[#212529]">
        {p}%
      </div>
    </div>
  );
}

function DashboardContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [data, setData] = useState<DashboardData>(DEFAULT_DASHBOARD_DATA);
  const [loading, setLoading] = useState(false);
  const [privacyMode, setPrivacyMode] = useState(true);
  const [revealUntil, setRevealUntil] = useState(0);
  const [walletBalance, setWalletBalance] = useState(0);
  const [walletAvailable, setWalletAvailable] = useState(0);
  const [walletLoading, setWalletLoading] = useState(false);
  const [walletActionLoading, setWalletActionLoading] = useState<"deposit" | "withdraw" | null>(null);
  const [walletError, setWalletError] = useState("");
  const [walletMessage, setWalletMessage] = useState("");

  const amountsHidden = privacyMode && Date.now() > revealUntil;

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      loadDashboardData();
      void loadWallet();
    }
  }, [status]);

  const loadWallet = async () => {
    if (!session?.user?.email) return;

    setWalletLoading(true);
    setWalletError("");

    try {
      const res = await fetch(
        `/api/payment/account?email=${encodeURIComponent(session.user.email)}`,
        { cache: "no-store" },
      );
      const payload = await res.json();

      if (!res.ok) {
        throw new Error(payload?.error || "Unable to load wallet balance.");
      }

      const checking = (payload?.accounts || []).find(
        (acc: { type?: string }) => acc.type === "checking",
      );
      const primary = checking || payload?.accounts?.[0];

      setWalletBalance(Number(primary?.balance || 0));
      setWalletAvailable(Number(primary?.availableBalance || 0));
    } catch (err: unknown) {
      setWalletBalance(0);
      setWalletAvailable(0);
      const message = err instanceof Error ? err.message : "Unable to load wallet balance.";
      setWalletError(message);
    } finally {
      setWalletLoading(false);
    }
  };

  const handleDeposit = async () => {
    if (!session?.user?.email) return;

    const input = window.prompt("Enter deposit amount in Naira", "1000");
    if (!input) return;

    const amount = Number(input.replace(/,/g, ""));
    if (!Number.isFinite(amount) || amount < 100) {
      setWalletError("Minimum deposit amount is N100.");
      return;
    }

    setWalletActionLoading("deposit");
    setWalletError("");
    setWalletMessage("");

    try {
      const res = await fetch("/api/payment/deposit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          method: "card",
          description: "Dashboard deposit",
          userEmail: session.user.email,
          callbackUrl: `${window.location.origin}/dashboard`,
        }),
      });

      const payload = await res.json();
      if (!res.ok || !payload?.success) {
        throw new Error(payload?.error || "Unable to start deposit.");
      }

      if (payload.paymentUrl) {
        window.location.href = payload.paymentUrl as string;
        return;
      }

      setWalletMessage("Deposit initialized successfully.");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unable to start deposit.";
      setWalletError(message);
    } finally {
      setWalletActionLoading(null);
    }
  };

  const handleWithdraw = async () => {
    if (!session?.user?.email) return;

    const savedBank = localStorage.getItem("rilstack_bank");
    if (!savedBank) {
      setWalletError("Set your withdrawal bank first in Settings > Bank.");
      return;
    }

    let bankName = "";
    let accountNumber = "";
    let accountName = "";

    try {
      const parsed = JSON.parse(savedBank) as {
        bankName?: string;
        accountNumber?: string;
        accountName?: string;
      };
      bankName = parsed.bankName || "";
      accountNumber = parsed.accountNumber || "";
      accountName = parsed.accountName || "";
    } catch {
      setWalletError("Saved bank details are invalid. Re-add them in Settings > Bank.");
      return;
    }

    if (!bankName || !accountNumber || !accountName) {
      setWalletError("Complete your bank details in Settings > Bank before withdrawal.");
      return;
    }

    const input = window.prompt("Enter withdrawal amount in Naira", "5000");
    if (!input) return;

    const amount = Number(input.replace(/,/g, ""));
    if (!Number.isFinite(amount) || amount < 5000) {
      setWalletError("Minimum withdrawal amount is N5,000.");
      return;
    }

    const bankCode = BANK_CODES[bankName] || bankName;

    setWalletActionLoading("withdraw");
    setWalletError("");
    setWalletMessage("");

    try {
      const res = await fetch("/api/payment/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount,
          accountNumber,
          bankCode,
          recipientName: accountName,
          narration: "Dashboard withdrawal",
          userEmail: session.user.email,
        }),
      });

      const payload = await res.json();
      if (!res.ok || !payload?.success) {
        throw new Error(payload?.error || "Unable to process withdrawal.");
      }

      setWalletMessage(payload?.message || "Withdrawal initiated successfully.");
      await loadWallet();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unable to process withdrawal.";
      setWalletError(message);
    } finally {
      setWalletActionLoading(null);
    }
  };

  const loadDashboardData = async () => {
    setLoading(true);
    setData(DEFAULT_DASHBOARD_DATA);
    setLoading(false);
  };

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F8F9FA]">
        <p className="text-slate-600">Loading...</p>
      </div>
    );
  }

  if (!session) return null;

  const firstName = session.user?.name?.split(" ")[0] || "there";
  const today = new Date();
  const dateStr = today.toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const metrics = useMemo(
    () => [
      {
        key: "net" as const,
        label: "Net Worth",
        value: hiddenAmount(amountsHidden, data.netWorth),
        sub: `+${data.netWorthChangePct}%`,
        subClass: "text-[#2E7D32]",
      },
      {
        key: "budget" as const,
        label: "Budget Left",
        value: hiddenAmount(amountsHidden, data.budgetLeft),
        sub: `of ${hiddenAmount(amountsHidden, data.budgetTotal)}`,
        subClass: "text-[#6C757D]",
      },
      {
        key: "savings" as const,
        label: "Total Savings",
        value: hiddenAmount(amountsHidden, data.totalSavings),
        sub: `+${money(data.interestToday)} interest`,
        subClass: "text-[#2E7D32]",
      },
      {
        key: "invest" as const,
        label: "Invested",
        value: hiddenAmount(amountsHidden, data.totalInvested),
        sub: `est. returns ${hiddenAmount(amountsHidden, data.estReturns)}`,
        subClass: "text-[#6C757D]",
      },
    ],
    [amountsHidden, data],
  );

  const revealForThreeSeconds = () => {
    if (!privacyMode) return;
    setRevealUntil(Date.now() + 3000);
  };

  return (
    <div className="bg-[#F8F9FA] min-h-screen pb-[76px]">
      <DashboardTopBar />

      <div className="px-4 pt-4">
        <div className="mb-3 flex items-center justify-between">
          <h1 className="text-lg font-bold text-[#000000]">Hello, {firstName}</h1>
          <div className="flex items-center gap-2 text-xs text-[#6C757D]">
            <span>{dateStr}</span>
            <button
              type="button"
              onClick={() => setPrivacyMode((v) => !v)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white"
              aria-label={privacyMode ? "Disable privacy mode" : "Enable privacy mode"}
            >
              {privacyMode ? <EyeOff className="h-4 w-4 text-[#1A5F7A]" /> : <Eye className="h-4 w-4 text-[#1A5F7A]" />}
            </button>
          </div>
        </div>

        <section className="mb-3 rounded-2xl bg-white p-3 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <div className="mb-1 flex items-center justify-between">
            <p className="text-sm font-bold text-[#000000]">Wallet</p>
            {walletLoading ? <span className="text-[11px] text-[#6C757D]">Syncing...</span> : null}
          </div>
          <p className="text-xl font-bold text-[#212529]">
            {hiddenAmount(amountsHidden, walletBalance)}
          </p>
          <p className="mt-1 text-[11px] text-[#6C757D]">
            Available: {hiddenAmount(amountsHidden, walletAvailable)}
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleDeposit}
              disabled={walletActionLoading !== null}
              className="h-9 rounded-lg bg-[#1A5F7A] text-xs font-semibold text-white disabled:opacity-60"
            >
              {walletActionLoading === "deposit" ? "Processing..." : "Deposit"}
            </button>
            <button
              type="button"
              onClick={handleWithdraw}
              disabled={walletActionLoading !== null}
              className="h-9 rounded-lg border border-[#1A5F7A] text-xs font-semibold text-[#1A5F7A] disabled:opacity-60"
            >
              {walletActionLoading === "withdraw" ? "Processing..." : "Withdraw"}
            </button>
          </div>
          {walletError ? <p className="mt-2 text-[11px] text-[#D32F2F]">{walletError}</p> : null}
          {walletMessage ? <p className="mt-2 text-[11px] text-[#2E7D32]">{walletMessage}</p> : null}
        </section>

        <div className="grid grid-cols-2 gap-2">
          {metrics.map((m) => (
            <button
              key={m.label}
              type="button"
              onClick={revealForThreeSeconds}
              className="h-20 rounded-xl bg-white p-3 text-left shadow-[0_2px_8px_rgba(0,0,0,0.04)] focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#F4A261]"
            >
              <div className="mb-1 flex items-center gap-2">
                {metricIcon(m.key)}
                <span className="text-[11px] font-semibold text-[#6C757D]">{m.label}</span>
              </div>
              <p className="text-sm font-bold text-[#212529]">{m.value}</p>
              <p className={`text-[11px] ${m.subClass}`}>{m.sub}</p>
            </button>
          ))}
        </div>

        <section className="mt-3 rounded-2xl bg-white p-3 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <Ring percent={data.budgetSpentPct} />
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-[#000000]">Active Budget</p>
                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-[#1A5F7A]">
                    {data.budgetMode === "strict" ? <Lock className="h-3 w-3" /> : <Feather className="h-3 w-3" />}
                    {data.budgetMode === "strict" ? "Strict" : "Relaxed"}
                  </span>
                </div>
                <p className="text-[11px] text-[#6C757D]">{data.budgetRange}</p>
              </div>
            </div>
            <button className="text-xs font-semibold text-[#1A5F7A]">View</button>
          </div>

          <div className="mt-3 space-y-2">
            {data.categories.map((c) => {
              const pct = (c.spent / c.total) * 100;
              return (
                <div key={c.name}>
                  <div className="mb-1 flex items-center justify-between text-[11px]">
                    <span className="font-medium text-[#212529]">{c.name}</span>
                    <span className="text-[#6C757D]">
                      {hiddenAmount(amountsHidden, c.spent)}/{hiddenAmount(amountsHidden, c.total)}
                    </span>
                  </div>
                  <CompactProgress value={pct} />
                </div>
              );
            })}
          </div>
        </section>

        <section className="mt-3 grid grid-cols-2 gap-2">
          <div className="rounded-2xl bg-white p-3 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-bold text-[#000000]">Savings</p>
              <button className="text-[11px] font-semibold text-[#1A5F7A]">See all</button>
            </div>
            <p className="text-[11px] font-semibold text-[#212529]">{data.savingsGoal.name}</p>
            <CompactProgress value={(data.savingsGoal.current / data.savingsGoal.target) * 100} />
            <p className="mt-1 text-[11px] text-[#6C757D]">
              {hiddenAmount(amountsHidden, data.savingsGoal.current)} / {hiddenAmount(amountsHidden, data.savingsGoal.target)}
            </p>
            <div className="mt-2 rounded-lg bg-[#F8F9FA] p-2">
              <div className="mb-1 flex items-center justify-between">
                <p className="text-[11px] font-semibold text-[#212529]">{data.retirement.name}</p>
                <span className="rounded-full bg-[#1A5F7A]/10 px-2 py-0.5 text-[10px] font-bold text-[#1A5F7A]">
                  {data.retirement.apy}% p.a.
                </span>
              </div>
              <p className="text-[11px] text-[#6C757D]">Locked {hiddenAmount(amountsHidden, data.retirement.locked)}</p>
              <p className="mt-1 text-[11px] font-semibold text-[#2E7D32]">+{money(data.interestToday)} today</p>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-3 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-bold text-[#000000]">Investments</p>
              <button className="text-[11px] font-semibold text-[#1A5F7A]">See all</button>
            </div>
            <p className="text-sm font-bold text-[#212529]">{hiddenAmount(amountsHidden, data.totalInvested)}</p>
            <p className="mt-2 text-[11px] font-semibold text-[#212529]">Fixed Income 90d</p>
            <p className="text-[11px] text-[#6C757D]">
              {hiddenAmount(amountsHidden, data.fixedIncome.amount)}, {data.fixedIncome.returnPct}% return
            </p>
            <p className="text-[11px] text-[#6C757D]">matures in {data.fixedIncome.daysLeft}d</p>
            <div className="mt-1">
              <CompactProgress value={data.fixedIncome.progress} />
            </div>
            <button className="mt-2 inline-flex h-7 items-center rounded-md border border-[#1A5F7A] px-2 text-[11px] font-semibold text-[#1A5F7A]">
              Explore
            </button>
          </div>
        </section>

        <section className="mt-3 rounded-2xl bg-white p-3 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-bold text-[#000000]">Recent Transactions</p>
            <button className="text-[11px] font-semibold text-[#1A5F7A]">View all</button>
          </div>
          <div className="space-y-2">
            {data.tx.slice(0, 3).map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={revealForThreeSeconds}
                className="flex h-[50px] w-full items-center justify-between rounded-lg px-2 text-left transition hover:bg-slate-50"
              >
                <div className="flex min-w-0 items-center gap-2">
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-100">{txIcon(t.type)}</span>
                  <span className="max-w-[130px] truncate text-[12px] text-[#212529]">{t.desc}</span>
                </div>
                <div className="text-right">
                  <p className={`text-[12px] font-bold ${t.amount < 0 ? "text-[#D32F2F]" : "text-[#2E7D32]"}`}>
                    {t.amount < 0 ? "-" : "+"}
                    {hiddenAmount(amountsHidden, Math.abs(t.amount)).replace("NGN", "₦")}
                  </p>
                  <p className="text-[10px] text-[#6C757D]">{t.time}</p>
                </div>
              </button>
            ))}
          </div>
        </section>

        <section className="mt-3 mb-2 rounded-2xl bg-white p-3 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <div className="grid grid-cols-3 gap-2">
            <button className="flex h-11 flex-col items-center justify-center gap-1 rounded-lg text-[#1A5F7A] focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#F4A261]">
              <Shield className="h-5 w-5" aria-hidden="true" />
              <span className="text-[11px] font-semibold">Report Fraud</span>
            </button>
            <button className="flex h-11 flex-col items-center justify-center gap-1 rounded-lg text-[#1A5F7A] focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#F4A261]">
              <HelpCircle className="h-5 w-5" aria-hidden="true" />
              <span className="text-[11px] font-semibold">Help</span>
            </button>
            <button className="flex h-11 flex-col items-center justify-center gap-1 rounded-lg text-[#1A5F7A] focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#F4A261]">
              <Settings className="h-5 w-5" aria-hidden="true" />
              <span className="text-[11px] font-semibold">Settings</span>
            </button>
          </div>
        </section>
      </div>

      <DashboardFab />
      <DashboardTabBar />

      <style jsx>{`
        .dashboard-root :global(button:focus-visible),
        button:focus-visible,
        a:focus-visible {
          outline: 2px solid #f4a261;
          outline-offset: 2px;
        }
      `}</style>
    </div>
  );
}

export default function Dashboard() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-[#F8F9FA]">
          <p className="text-slate-600">Loading...</p>
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}

