"use client";
import React from "react";
import Link from "next/link";
import SettingsSection from "@/components/SettingsSection";

export default function SettingsPage() {
  return (
    <div className="min-h-screen w-full bg-[#f3f4fa] flex flex-col items-center py-8">
      <div className="w-full max-w-2xl mx-auto">
        <div className="mb-6 flex items-center justify-between gap-4 px-2">
          <div>
            <h1 className="text-3xl font-bold text-[#2c3e5f]">
              Profile & Settings
            </h1>
            <p className="mt-1 text-sm text-[#4A5B6E]">
              Manage your account details and app preferences in one place.
            </p>
          </div>
          <Link
            href="/dashboard"
            className="inline-flex items-center rounded-xl bg-[#1A5F7A] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#174e62]"
          >
            Back to Dashboard
          </Link>
        </div>
        <SettingsSection />
      </div>
    </div>
  );
}
