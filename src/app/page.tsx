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
import UltraComprehensiveKYCForm from '@/components/UltraComprehensiveKYCForm';
import KYCFloatingTab from '@/components/KYCFloatingTab';
import NetWorthHero from './NetWorthHero';
import DashboardTabContent from './DashboardTabContent';
import TabNavigation from './TabNavigation';


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
  const [showFrontAuth, setShowFrontAuth] = useState(false);

  // Unauthenticated state
  if (!session || showAuth || showFrontAuth) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-[#1a2253] via-[#1a1e3a] to-[#181A20] flex flex-col">
        {/* Header */}
        <header className="w-full flex items-center justify-center px-8 py-8 gap-4 bg-[#181A20]">
          <span className="text-5xl md:text-6xl font-extrabold text-white tracking-wide">Rilstack</span>
        </header>
        <main className="flex-1 flex flex-col items-center justify-center px-0 bg-gradient-to-b from-[#f5f5f7] to-[#e5e7eb]">
          <h1 className="text-4xl font-bold text-[#181A20] mb-6">Welcome to Rilstack</h1>
          <div className="w-full flex justify-center mb-8">
            <div className="max-w-xl w-full rounded-3xl overflow-hidden shadow-xl border border-[#e5e7eb] bg-white/80">
              {/* Spline 3D scene removed */}
            </div>
          </div>
          <button className="bg-[#00e096] text-white font-bold px-10 py-4 rounded-xl shadow-lg text-xl hover:bg-[#00c080] transition" onClick={() => setShowFrontAuth(true)}>Get Started</button>
        </main>
        {showFrontAuth && <AuthModal mode="login" onClose={() => setShowFrontAuth(false)} />}
      </div>
    );
  }

  // Authenticated state (minimal dashboard placeholder)
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#f5f5f7] to-[#e5e7eb] flex flex-col">
      <TopBarNavigation />
      <main className="flex-1 flex flex-col items-center justify-center px-4">
        <h1 className="text-3xl font-bold text-[#181A20] mb-6">Welcome back, {session?.user?.name || 'User'}!</h1>
        <div className="w-full flex justify-center mb-8">
          <div className="max-w-xl w-full rounded-3xl overflow-hidden shadow-xl border border-[#e5e7eb] bg-white/80">
            {/* Spline 3D scene removed */}
          </div>
        </div>
        <MovingWidget type="metrics" />
        <MovingWidget type="savings-investments" />
        <RecentActivity />
      </main>
    </div>
  );
}
