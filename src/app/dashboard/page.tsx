"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import DashboardTopBar from "@/components/DashboardTopBar";
import DashboardTabBar from "@/components/DashboardTabBar";
import MetricsCards, { MetricsData } from "@/components/MetricsCards";
import ActiveBudgetSnapshot, {
  type ActiveBudgetData,
} from "@/components/ActiveBudgetSnapshot";
import InvestmentsSnapshot, {
  type InvestmentsSnapshotData,
} from "@/components/InvestmentsSnapshot";
import DashboardFab from "@/components/DashboardFab";
import DashboardQuickActions from "@/components/DashboardQuickActions";
import RecentTransactionsCard, {
  type RecentTransactionItem,
} from "@/components/RecentTransactionsCard";
import SavingsGoalsSnapshot, {
  type SavingsSnapshotData,
} from "@/components/SavingsGoalsSnapshot";

function DashboardContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [metricsData, setMetricsData] = useState<MetricsData | null>(null);
  const [activeBudget, setActiveBudget] = useState<ActiveBudgetData | null>(null);
  const [savingsSnapshot, setSavingsSnapshot] = useState<SavingsSnapshotData>({
    topGoal: null,
    retirement: null,
    safeLockCount: 0,
    dailyInterestEarned: 0,
  });
  const [investmentsSnapshot, setInvestmentsSnapshot] = useState<InvestmentsSnapshotData>({
    totalInvested: 0,
    totalExpectedReturns: 0,
    items: [],
  });
  const [recentTransactions, setRecentTransactions] = useState<RecentTransactionItem[]>([]);
  const [loading, setLoading] = useState(true);

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
    try {
      setLoading(true);
      // Placeholder: fetch real data from API
      // For now, use mock data
      setMetricsData({
        netWorth: 2500000,
        netWorthChange: 12.5,
        budgetLeft: 450000,
        budgetTotal: 1000000,
        totalSavings: 750000,
        interestEarned: 25000,
        totalInvested: 1200000,
        expectedReturns: 180000,
      });

      setActiveBudget({
        dateRange: "Apr 1 - Apr 30",
        spentPercent: 70,
        style: "strict",
        categories: [
          { name: "Food", spent: 12000, allocated: 20000, icon: "food" },
          {
            name: "Transport",
            spent: 8000,
            allocated: 10000,
            icon: "transport",
          },
          {
            name: "Entertainment",
            spent: 5000,
            allocated: 6000,
            icon: "entertainment",
          },
        ],
      });

      setSavingsSnapshot({
        topGoal: {
          id: "goal_1",
          name: "Emergency Fund",
          currentAmount: 350000,
          targetAmount: 500000,
          daysLeft: 120,
        },
        retirement: {
          name: "Retirement Plan",
          annualRate: 18,
          lockedAmount: 240000,
          unlockDate: "May 12, 2032",
        },
        safeLockCount: 2,
        dailyInterestEarned: 1500,
      });

      setInvestmentsSnapshot({
        totalInvested: 1200000,
        totalExpectedReturns: 180000,
        items: [
          {
            id: "inv_1",
            name: "Treasury Note Plan",
            amountInvested: 650000,
            maturityDate: "Aug 30, 2026",
            expectedReturnPercent: 15,
            progressPercent: 62,
          },
          {
            id: "inv_2",
            name: "Growth Bond Basket",
            amountInvested: 550000,
            maturityDate: "Nov 18, 2026",
            expectedReturnPercent: 18,
            progressPercent: 41,
          },
        ],
      });

      setRecentTransactions([
        {
          id: "tx_1",
          type: "budget",
          description: "Withdrawal: Food",
          amount: -12000,
          timestamp: "2h ago",
        },
        {
          id: "tx_2",
          type: "savings",
          description: "Deposit: Emergency Fund",
          amount: 50000,
          timestamp: "5h ago",
        },
        {
          id: "tx_3",
          type: "investment",
          description: "Investment: Treasury Note Plan",
          amount: -150000,
          timestamp: "1d ago",
        },
        {
          id: "tx_4",
          type: "penalty",
          description: "Safe Lock early withdrawal fee",
          amount: -2500,
          fee: 2500,
          timestamp: "2d ago",
        },
        {
          id: "tx_5",
          type: "savings",
          description: "Interest payout: Retirement Plan",
          amount: 4500,
          timestamp: "Today",
        },
      ]);
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setLoading(false);
    }
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
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="bg-[#F8F9FA] min-h-screen pb-24">
      <DashboardTopBar />

      {/* Welcome Area */}
      <div className="px-4 pt-6 pb-4">
        <h1 className="text-2xl font-bold text-slate-900">
          Hello, {firstName}!
        </h1>
        <p className="text-sm text-slate-500 mt-1">{dateStr}</p>
      </div>

      {/* Metrics Cards */}
      <MetricsCards data={metricsData!} loading={loading} />

      {/* Main Content Areas (Coming next) */}
      <div className="px-4 space-y-4 pb-8">
        <ActiveBudgetSnapshot budget={activeBudget} />
        <SavingsGoalsSnapshot data={savingsSnapshot} />
        <InvestmentsSnapshot data={investmentsSnapshot} />
        <RecentTransactionsCard items={recentTransactions} />
        <DashboardQuickActions />
      </div>

      <DashboardFab />
      <DashboardTabBar />
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

