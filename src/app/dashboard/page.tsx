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

const SAMPLE_DATA: DashboardData = {
  netWorth: 2500000,
  netWorthChangePct: 12.4,
  budgetLeft: 450000,
  budgetTotal: 1000000,
  totalSavings: 750000,
  interestToday: 68,
  totalInvested: 1200000,
  estReturns: 180000,
  budgetMode: "strict",
  budgetSpentPct: 70,
  budgetRange: "Apr 1 - Apr 30",
  categories: [
    { name: "Food", spent: 12000, total: 20000 },
    { name: "Transport", spent: 8000, total: 10000 },
  ],
  savingsGoal: { name: "Emergency Fund", current: 50000, target: 100000 },
  retirement: { name: "Retirement", locked: 200000, apy: 18 },
  fixedIncome: { amount: 500000, returnPct: 8, daysLeft: 45, progress: 50 },
  tx: [
    { id: "1", type: "budget", desc: "Food budget spend", amount: -12000, time: "2h ago" },
    { id: "2", type: "savings", desc: "Savings deposit", amount: 50000, time: "5h ago" },
    { id: "3", type: "investment", desc: "Fixed Income funding", amount: -150000, time: "1d ago" },
  ],
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
  const [data, setData] = useState<DashboardData>(SAMPLE_DATA);
  const [loading, setLoading] = useState(false);
  const [privacyMode, setPrivacyMode] = useState(true);
  const [revealUntil, setRevealUntil] = useState(0);

  const amountsHidden = privacyMode && Date.now() > revealUntil;

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      loadDashboardData();
    }
  }, [status]);

  const loadDashboardData = async () => {
    setLoading(true);
    setData(SAMPLE_DATA);
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

