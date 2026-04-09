"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import AuthModal from "@/components/AuthModal";
import KYCVerification from "@/components/KYCVerification";
import TopBarNavigation from "@/components/TopBarNavigation";
import RecentActivity from "@/components/RecentActivity";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import SavingsInvestmentsCarousel from '@/components/SavingsInvestmentsCarousel';
import MetricCardsCarousel from '@/components/MetricCardsCarousel';


const summaryCards = [
  { label: "Income", value: "₦150,000", color: "bg-[#f3f4fa]", detail: "Total income this month", tone: "border-[#E9EDF2] bg-white" },
  { label: "Expense", value: "₦94,000", color: "bg-[#f3f4fa]", detail: "Total expenses this month", tone: "border-[#E9EDF2] bg-white" },
  { label: "Balance", value: "₦56,000", color: "bg-[#f3f4fa]", detail: "Current account balance", tone: "border-[#E9EDF2] bg-white" },
  { label: "Savings", value: "₦12,000", color: "bg-[#f3f4fa]", detail: "Total savings this month", tone: "border-[#E9EDF2] bg-white" },
];
const barData = [
  { name: "Jan", income: 20000, expense: 12000 },
  { name: "Feb", income: 25000, expense: 15000 },
  { name: "Mar", income: 18000, expense: 9000 },
  { name: "Apr", income: 30000, expense: 20000 },
  { name: "May", income: 22000, expense: 11000 },
  { name: "Jun", income: 35000, expense: 17000 },
];

const pieData = [
  { name: "Essentials", value: 50, color: "#7C3AED" },
  { name: "Flexible", value: 30, color: "#6366F1" },
  { name: "Goals", value: 20, color: "#A5B4FC" },
];

export default function Home() {
  const { data: session, status } = useSession();
  const [showAuth, setShowAuth] = useState(false);
  const [showKYC, setShowKYC] = useState(false);
  const [kycChecked, setKycChecked] = useState(false);
  const [kycGender, setKycGender] = useState<string | undefined>(undefined);
  const [showFrontAuth, setShowFrontAuth] = useState(false);

  useEffect(() => {
    if (status === "loading") return;
    const checkKyc = async () => {
      if (!session) return;
      try {
        const res = await fetch("/api/kyc/status");
        const data = await res.json();
        if (!data.success || (data.status && data.status.kycLevel < 5)) {
          setShowKYC(true);
        } else {
          setShowKYC(false);
        }
        if (data.status && data.status.gender) {
          setKycGender(data.status.gender);
        }
      } catch {
        setShowKYC(true);
      } finally {
        setKycChecked(true);
      }
    };
    checkKyc();
  }, [session, status]);

  if (!session || showAuth || showFrontAuth) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-[#1a2253] via-[#1a1e3a] to-[#181A20] flex flex-col min-h-screen">
        {/* Header */}
        <header className="w-full flex items-center justify-end px-6 py-6 gap-4">
          <div className="flex-1 flex items-center">
            <span className="text-2xl font-extrabold text-white tracking-wide ml-auto">Rilstack</span>
          </div>
          <button
            className="text-white font-semibold px-4 py-2 rounded-lg hover:bg-[#2c3e5f]/30 transition"
            onClick={() => setShowFrontAuth(true)}
          >Login</button>
          <button
            className="bg-[#00e096] text-white font-bold px-5 py-2 rounded-lg shadow hover:bg-[#00c080] transition"
            onClick={() => setShowFrontAuth(true)}
          >Get Started</button>
        </header>
        {/* Hero Section */}
        <main className="flex-1 flex flex-col md:flex-row items-center justify-center px-6 md:px-16 gap-12">
          <div className="flex-1 flex flex-col items-start justify-center max-w-xl">
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 leading-tight">
              Welcome to <span className="text-[#00e096]">Rilstack</span>
            </h1>
            <p className="text-lg text-[#e0e6f7] mb-8">Your all-in-one platform for budgeting, saving, investing, and financial growth. Take control of your money with smart tools and real insights.</p>
            <a href="#" className="inline-block mt-2">
              <img src="/google-play-badge.png" alt="Get it on Google Play" className="h-12" />
            </a>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center">
            {/* Feature widgets */}
            <div className="flex flex-row gap-4">
              <div className="rounded-2xl bg-white/90 shadow-xl p-4 w-48 h-72 flex flex-col items-center justify-center">
                <div className="w-32 h-48 bg-[#eaf2fa] rounded-xl mb-2 flex items-center justify-center text-[#2c3e5f] font-bold text-lg">Budgeting</div>
                <span className="text-[#2c3e5f] font-bold text-center">Plan & track your spending</span>
              </div>
              <div className="rounded-2xl bg-white/80 shadow-lg p-4 w-48 h-72 flex flex-col items-center justify-center scale-90">
                <div className="w-32 h-48 bg-[#e0f0e8] rounded-xl mb-2 flex items-center justify-center text-[#4A5B6E] font-bold text-lg">Savings</div>
                <span className="text-[#4A5B6E] font-bold text-center">Set & reach savings goals</span>
              </div>
              <div className="rounded-2xl bg-white/80 shadow-lg p-4 w-48 h-72 flex flex-col items-center justify-center scale-90">
                <div className="w-32 h-48 bg-[#fffbe6] rounded-xl mb-2 flex items-center justify-center text-[#FFD700] font-bold text-lg">Investments</div>
                <span className="text-[#FFD700] font-bold text-center">Grow your wealth smartly</span>
              </div>
              <div className="rounded-2xl bg-white/80 shadow-lg p-4 w-48 h-72 flex flex-col items-center justify-center scale-90">
                <div className="w-32 h-48 bg-[#ede9fe] rounded-xl mb-2 flex items-center justify-center text-[#8B5CF6] font-bold text-lg">Security</div>
                <span className="text-[#8B5CF6] font-bold text-center">Your data is always safe</span>
              </div>
            </div>
          </div>
        </main>
        {showFrontAuth && <AuthModal mode="login" onClose={() => setShowFrontAuth(false)} />}
      </div>
    );
  }

  if (showKYC && kycChecked) {
    return <KYCVerification onComplete={() => setShowKYC(false)} />;
  }

  // ...existing code for logged-in users...
  return (
    <div className="min-h-screen w-full bg-[#181A20] flex flex-col items-center justify-start">
      <div className="w-full max-w-[1400px] mx-auto flex flex-col min-h-screen">
        <TopBarNavigation />
        <main className="flex-1 flex flex-col items-center justify-start w-full px-2 py-4 sm:px-4 sm:py-8">
          <div className="w-full bg-white rounded-3xl shadow-2xl p-4 sm:p-8 mt-4 sm:mt-8">
            <h1 className="text-2xl font-bold text-[#2c3e5f] mb-2">
              {(() => {
                const name = session?.user?.name?.split(' ')[0];
                const sessionUser = session?.user as typeof session.user & { gender?: string };
                const gender = (kycGender || sessionUser?.gender)?.toLowerCase?.();
                let title = 'champ';
                if (gender === 'male' || gender === 'm') title = 'brother';
                else if (gender === 'female' || gender === 'f') title = 'sister';
                return `Welcome back, ${name || title || 'champ'}!`;
              })()}
            </h1>
            <p className="text-[#4A5B6E] mb-6 sm:mb-8">Here’s your financial overview for this month.</p>
            {/* Carousel for Budgets & Savings and Investments */}
            <div className="mb-8">
              <SavingsInvestmentsCarousel />
            </div>
            {/* Metric cards carousel for mobile */}
            <div className="mb-8 block sm:hidden">
              <MetricCardsCarousel cards={summaryCards} />
            </div>
            {/* Desktop summary cards grid */}
            <div className="hidden sm:grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8">
              {summaryCards.map((card, i) => (
                <div key={i} className={`rounded-2xl p-6 shadow border border-[#E9EDF2] ${card.color}`}>
                  <div className="text-xs text-[#7a869a] mb-1">{card.label}</div>
                  <div className="text-2xl font-bold text-[#2c3e5f]">{card.value}</div>
                </div>
              ))}
            </div>
            {/* Charts section */}
            <div className="flex flex-col md:flex-row gap-8 mb-8">
              {/* Bar Chart */}
              <div className="flex-1 bg-[#f8f9fc] rounded-2xl p-6 shadow">
                <h2 className="text-lg font-semibold text-[#2c3e5f] mb-4">Income & Expenses</h2>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={barData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#7C3AED" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366F1" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" stroke="#7a869a"/>
                    <YAxis stroke="#7a869a"/>
                    <CartesianGrid strokeDasharray="3 3" />
                    <Tooltip />
                    <Area type="monotone" dataKey="income" stroke="#7C3AED" fillOpacity={1} fill="url(#colorIncome)" />
                    <Area type="monotone" dataKey="expense" stroke="#6366F1" fillOpacity={1} fill="url(#colorExpense)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              {/* Pie Chart */}
              <div className="w-full md:w-80 bg-[#f8f9fc] rounded-2xl p-6 shadow flex flex-col items-center">
                <h2 className="text-lg font-semibold text-[#2c3e5f] mb-4">Spending Breakdown</h2>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label>
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <ul className="mt-4 space-y-1 text-xs text-[#4A5B6E]">
                  {pieData.map((item, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="inline-block w-3 h-3 rounded-full" style={{ background: item.color }}></span>
                      {item.name}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            {/* Recent Activity */}
            <RecentActivity />
          </div>
        </main>
      </div>
    </div>
  );
}
