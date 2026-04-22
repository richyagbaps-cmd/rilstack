"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { Bell } from "lucide-react";

interface DashboardTopBarProps {
  onMenuClick?: () => void;
}

export default function DashboardTopBar({ onMenuClick }: DashboardTopBarProps) {
  const { data: session } = useSession();
  
  const initials = session?.user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase() || "U";

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
      <div className="flex items-center justify-between px-4 h-14">
        {/* Hamburger Menu */}
        <button
          onClick={onMenuClick}
          className="flex flex-col gap-1.5 justify-center w-6 h-6 cursor-pointer"
          aria-label="Menu"
        >
          <div className="w-6 h-0.5 bg-[#1A5F7A] rounded-full" />
          <div className="w-4 h-0.5 bg-[#1A5F7A] rounded-full" />
          <div className="w-6 h-0.5 bg-[#1A5F7A] rounded-full" />
        </button>

        {/* Logo / Branding */}
        <div className="flex items-center gap-1">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-[#1A5F7A] text-[10px] font-bold uppercase text-white">r</span>
          <span className="text-sm font-bold text-[#1A5F7A]">rilstack</span>
        </div>

        {/* Bell + Avatar */}
        <div className="flex items-center gap-3">
          <button
            className="relative p-1 text-[#1A5F7A] hover:bg-slate-100 rounded-full transition"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" aria-hidden="true" strokeWidth={2} />
            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          <Link
            href="/profile"
            className="flex items-center justify-center w-8 h-8 rounded-full bg-[#1A5F7A] text-white text-xs font-bold"
          >
            {initials}
          </Link>
        </div>
      </div>
    </header>
  );
}
