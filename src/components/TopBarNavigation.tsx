"use client";
import React from "react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function TopBarNavigation() {
  const router = useRouter();
  return (
    <header className="w-full bg-gradient-to-r from-[#2c3e5f] to-[#4A8B6E] shadow-md py-4 px-6 flex items-center justify-between">
      {/* Left: Logo and greeting */}
      <div className="flex items-center gap-4">
        <img src="/images/rilstack-logo.png" alt="Rilstack" className="h-16 w-auto" />
        <span className="text-white text-lg font-bold tracking-wide">Hi, CHISO</span>
      </div>
      {/* Right: Settings and Sign out */}
      <div className="flex items-center gap-6 ml-auto">
        <button
          className="text-white font-medium hover:underline flex items-center gap-1"
          onClick={() => router.push('/settings')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" fill="none" />
          </svg>
          Settings
        </button>
        <button
          className="text-white font-medium hover:underline px-4 py-2 rounded-xl border border-white/30"
          onClick={() => signOut({ callbackUrl: '/' })}
        >
          Sign out
        </button>
      </div>
    </header>
  );
}
