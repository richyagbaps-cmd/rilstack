"use client";

import Image from "next/image";
import React, { useState } from "react";
import { useSession } from "next-auth/react";
import ThreeDHome from "./ThreeDHome";
import ReviewsWidget from "./ReviewsWidget";
import MetricCardsCarousel from "./MetricCardsCarousel";
import DashboardTabContent from "../app/DashboardTabContent";
import UserProfile from "./UserProfile";

const monthlyData = [
  { month: "Jan", income: 0, expenses: 0, invest: 0 },
  { month: "Feb", income: 0, expenses: 0, invest: 0 },
  { month: "Mar", income: 0, expenses: 0, invest: 0 },
  { month: "Apr", income: 0, expenses: 0, invest: 0 },
  { month: "May", income: 0, expenses: 0, invest: 0 },
  { month: "Jun", income: 0, expenses: 0, invest: 0 },
];

const spendMix = [
  { name: "Essentials", value: 0, color: "#2c3e5f" },
  { name: "Flexible", value: 0, color: "#4A8B6E" },
  { name: "Goals", value: 0, color: "#6BAF8D" },
];

const metricCards = [
  {
    label: "Budgets and Savings",
    value: "N0",
    detail: "Track and grow your savings goals.",
    tone: "border-[#E9EDF2] bg-white",
  },
  {
    label: "Investments",
    value: "N0",
    detail: "Monitor your investment portfolio.",
    tone: "border-[#E9EDF2] bg-white",
  },
  {
    label: "Account",
    value: "N0",
    detail: "Manage your account and transactions.",
    tone: "border-[#E9EDF2] bg-white",
  },
];

export default function Dashboard() {
  const { data: session, status } = useSession();
  const [showProfile, setShowProfile] = useState(false);

  if (status === "loading") {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
        <h2 className="text-2xl font-bold mb-4">Please log in to access your dashboard</h2>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-[#050b17]">
      {/* 3D Interactive Background */}
      <div className="absolute inset-0 -z-10">
        <ThreeDHome />
      </div>

      {/* Top Bar with Profile (mobile-friendly) */}
      <div className="flex items-center justify-between px-4 pt-4 md:px-8 md:pt-8 z-20 relative">
        <div className="flex items-center gap-3">
          <span className="text-lg md:text-2xl font-bold text-white drop-shadow">Welcome back,</span>
          <span className="text-lg md:text-2xl font-bold text-cyan-300 drop-shadow">{session.user?.name || "User"}</span>
        </div>
        <button
          className="rounded-full border-2 border-cyan-400 p-1 md:p-2 bg-white/80 hover:scale-105 transition shadow"
          style={{ width: 44, height: 44, overflow: "hidden" }}
          onClick={() => setShowProfile(true)}
        >
          {session.user?.image ? (
            <Image
              src={session.user.image}
              alt="Profile"
              width={40}
              height={40}
              className="rounded-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-cyan-200 rounded-full text-cyan-900 font-bold">
              {session.user?.name?.[0] || "U"}
            </div>
          )}
        </button>
      </div>

      {/* Profile Modal */}
      {showProfile && <UserProfile onClose={() => setShowProfile(false)} />}

      {/* Dashboard Content */}
      <div className="relative z-10 w-full max-w-4xl mx-auto mt-8 md:mt-12 px-2 md:px-0">
        <ReviewsWidget />
        <MetricCardsCarousel cards={metricCards} />
        {/* Unified Budgets & Savings Tab */}
        <div className="mt-8 rounded-3xl bg-white/90 shadow-xl p-4 md:p-8 animate-fade-in-up backdrop-blur-xl">
          <DashboardTabContent />
        </div>
      </div>
    </div>
  );
}
