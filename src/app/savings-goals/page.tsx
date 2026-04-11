"use client";

import React from "react";
import SavingsGoals from "@/components/SavingsGoals";

export default function SavingsGoalsPage() {
  return (
    <div className="min-h-screen w-full bg-[#f8f9fc] flex flex-col items-center justify-start">
      <div className="w-full max-w-2xl mx-auto flex flex-col min-h-screen p-4 sm:p-8">
        <h1 className="text-3xl font-bold text-[#2c3e5f] mb-6">Savings Goals</h1>
        <SavingsGoals />
      </div>
    </div>
  );
}
