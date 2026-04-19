"use client";
import React from "react";
import SettingsSection from "@/components/SettingsSection";

export default function SettingsPage() {
  return (
    <div className="min-h-screen w-full bg-[#f3f4fa] flex flex-col items-center py-8">
      <div className="w-full max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-[#2c3e5f] mb-8 text-center">
          Settings
        </h1>
        <SettingsSection />
      </div>
    </div>
  );
}
