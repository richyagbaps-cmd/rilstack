"use client";
import React from "react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

import { useSession } from "next-auth/react";
import { FaBell, FaSearch, FaMoon, FaSun, FaChevronDown } from "react-icons/fa";

export default function TopBarNavigation() {
  const router = useRouter();
  const { data: session } = useSession();
  const [theme, setTheme] = React.useState<"light" | "dark">("light");
  const [profileOpen, setProfileOpen] = React.useState(false);
  const user = session?.user;

  return (
    <header className="fixed top-0 left-0 w-full z-40 bg-white flex items-center justify-between px-4 py-2 border-b border-[#E9EDF2] shadow-sm">
      {/* Left: Avatar and Hi User */}
      <div className="flex items-center gap-3">
        <img
          src={user?.image || undefined}
          alt="Avatar"
          className="h-9 w-9 rounded-full border border-[#2c3e5f] bg-white object-cover"
        />
        <span className="text-[#2c3e5f] text-base font-bold">
          {user?.name ? `Hi, ${user.name.split(" ")[0]}` : "Hi, User"}
        </span>
      </div>
      {/* Right: Notification and Profile */}
      <div className="flex items-center gap-3">
        <button
          className="text-[#4A5B6E] hover:text-[#2c3e5f] relative"
          aria-label="Notifications"
        >
          <FaBell size={20} />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#00e096] rounded-full border-2 border-white"></span>
        </button>
        <div className="relative">
          <button
            className="flex items-center gap-2 text-[#2c3e5f] font-medium px-2 py-1 rounded-lg border border-[#E9EDF2] bg-white"
            onClick={() => setProfileOpen((v) => !v)}
            aria-label="Profile menu"
          >
            <FaChevronDown size={14} />
          </button>
          {profileOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-lg border border-[#E9EDF2] z-50">
              <button
                className="w-full text-left px-4 py-3 hover:bg-[#f3f4fa] text-[#2c3e5f]"
                onClick={() => {
                  setProfileOpen(false);
                  router.push("/settings");
                }}
              >
                Settings
              </button>
              <button
                className="w-full text-left px-4 py-3 hover:bg-[#f3f4fa] text-[#2c3e5f]"
                onClick={() => {
                  setProfileOpen(false);
                  signOut({ callbackUrl: "/" });
                }}
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
