"use client";

import Image from "next/image";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Bell } from "lucide-react";

interface DashboardTopBarProps {
  onMenuClick?: () => void;
}

export default function DashboardTopBar({ onMenuClick }: DashboardTopBarProps) {
  const { data: session } = useSession();

  const initials =
    session?.user?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "U";

  const firstName = session?.user?.name?.split(" ")[0] || "there";
  const h = new Date().getHours();
  const greeting = h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";

  return (
    <header className="flex items-center justify-between bg-white px-5 pb-3 pt-4 shadow-sm">
      {/* Avatar + greeting */}
      <Link href="/profile" className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0AB68B] text-[12px] font-bold text-white shadow-sm">
          {initials}
        </div>
        <div>
          <p className="text-[11px] text-slate-400">{greeting},</p>
          <p className="text-[14px] font-semibold text-[#0F2C3D]">{firstName} 👋</p>
        </div>
      </Link>

      {/* Logo */}
      <div className="flex items-center gap-1.5">
        <Image
          src="/icons/rilstack-logo.png"
          alt="rilstack"
          width={28}
          height={28}
          className="h-7 w-7 object-contain"
          priority
        />
        <span className="text-[13px] font-bold text-[#0AB68B]">rilstack</span>
      </div>

      {/* Notifications */}
      <Link
        href="/notifications"
        className="relative flex h-9 w-9 items-center justify-center rounded-full bg-[#F4F6F8] transition hover:bg-slate-100"
        aria-label="Notifications"
      >
        <Bell className="h-4.5 w-4.5 text-[#0F2C3D]" strokeWidth={2} />
        <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
      </Link>
    </header>
  );
}

