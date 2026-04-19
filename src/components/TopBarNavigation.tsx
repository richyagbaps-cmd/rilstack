"use client";
import React from "react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

import { useSession } from "next-auth/react";
import { FaBell, FaBars, FaChevronDown, FaUserCircle } from "react-icons/fa";

export default function TopBarNavigation() {
  const router = useRouter();
  const { data: session } = useSession();
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [profileOpen, setProfileOpen] = React.useState(false);
  const user = session?.user;

  return (
    <>
      {/* Status Bar & Top Bar */}
      <header
        className="fixed top-0 left-0 w-full z-40 bg-white flex items-center justify-between px-2 md:px-6"
        style={{ height: 56, borderBottom: "1.5px solid #E9EDF2", boxShadow: "0 2px 8px #E9EDF2" }}
        role="banner"
        aria-label="Dashboard top bar"
      >
        {/* Left: Hamburger */}
        <button
          className="flex items-center justify-center h-10 w-10 rounded-full transition hover:bg-[#F8F9FA] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1A5F7A]"
          aria-label="Open menu"
          tabIndex={0}
          onClick={() => setDrawerOpen(true)}
        >
          <FaBars size={22} color="#1A5F7A" />
        </button>

        {/* Center: Logo (click to refresh) */}
        <div className="flex-1 flex justify-center">
          <button
            onClick={() => router.refresh()}
            style={{ display: "flex", alignItems: "center", gap: 10, background: "none", border: "none", cursor: "pointer", padding: 0 }}
            aria-label="Refresh dashboard"
            tabIndex={0}
            className="focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1A5F7A]"
          >
            <img
              src="/images/rilstack-logo.png"
              alt="Rilstack Logo"
              style={{ height: 32, width: 32, borderRadius: 8, background: "#fff", boxShadow: "0 2px 8px #1A5F7A22" }}
              draggable={false}
            />
            <span style={{
              fontSize: "1.5rem",
              fontWeight: 800,
              fontFamily: "'Inter', sans-serif",
              color: "#1A5F7A",
              letterSpacing: 1,
              userSelect: "none",
            }}>
              rilstack
            </span>
          </button>
        </div>

        {/* Right: Bell and Avatar */}
        <div className="flex items-center gap-2 md:gap-3 pr-1">
          <button
            className="flex items-center justify-center h-10 w-10 rounded-full transition hover:bg-[#F8F9FA] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1A5F7A]"
            aria-label="Notifications"
            tabIndex={0}
            onClick={() => alert('Notifications coming soon!')}
          >
            <FaBell size={20} color="#1A5F7A" />
          </button>
          <div className="relative">
            <button
              className="flex items-center justify-center h-10 w-10 rounded-full border border-[#E9EDF2] bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1A5F7A]"
              aria-label="Profile menu"
              tabIndex={0}
              onClick={() => setProfileOpen((v) => !v)}
            >
              {user?.image ? (
                <img
                  src={user.image}
                  alt="Avatar"
                  className="h-8 w-8 rounded-full object-cover"
                  draggable={false}
                />
              ) : (
                <FaUserCircle size={28} color="#1A5F7A" />
              )}
            </button>
            {profileOpen && (
              <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-lg border border-[#E9EDF2] z-50 animate-fadeIn">
                <button
                  className="w-full text-left px-4 py-3 hover:bg-[#f3f4fa] text-[#1A5F7A] focus:outline-none"
                  tabIndex={0}
                  onClick={() => {
                    setProfileOpen(false);
                    router.push("/profile");
                  }}
                >
                  Profile
                </button>
                <button
                  className="w-full text-left px-4 py-3 hover:bg-[#f3f4fa] text-[#1A5F7A] focus:outline-none"
                  tabIndex={0}
                  onClick={() => {
                    setProfileOpen(false);
                    router.push("/settings");
                  }}
                >
                  Settings
                </button>
                <button
                  className="w-full text-left px-4 py-3 hover:bg-[#f3f4fa] text-[#D32F2F] focus:outline-none"
                  tabIndex={0}
                  onClick={() => {
                    setProfileOpen(false);
                    signOut({ callbackUrl: "/" });
                  }}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Drawer (Hamburger menu) */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex" role="dialog" aria-modal="true">
          <div className="w-72 bg-white h-full shadow-2xl flex flex-col p-0 gap-0 border-r border-[#E9EDF2] animate-slideInLeft">
            {/* Drawer Header */}
            <div className="flex flex-col items-center justify-center pt-8 pb-6 px-6 border-b border-[#E9EDF2] bg-[#F8F9FA] relative">
              <button onClick={() => setDrawerOpen(false)} aria-label="Close menu" className="absolute top-3 right-3 text-2xl font-bold text-[#1A5F7A] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1A5F7A]">×</button>
              <div className="mb-3">
                {user?.image ? (
                  <img src={user.image} alt="Avatar" className="h-20 w-20 rounded-full object-cover border-4 border-[#1A5F7A] shadow" />
                ) : (
                  <FaUserCircle size={80} color="#1A5F7A" className="rounded-full border-4 border-[#1A5F7A] bg-white" />
                )}
              </div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg font-bold text-[#1A5F7A]">{user?.name || "RILSTACK User"}</span>
                {/* KYC badge (example: show if user.kycVerified) */}
                {user?.kycVerified && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#2E7D32] text-white text-xs font-semibold ml-1" title="Account Verified">✔️ KYC</span>
                )}
              </div>
              <span className="text-sm text-[#4A5B6E] mb-3 break-all">{user?.email || "user@rilstack.com"}</span>
              <button
                className="mt-1 px-4 py-2 rounded-lg bg-[#1A5F7A] text-white font-semibold hover:bg-[#174e62] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1A5F7A]"
                onClick={() => { setDrawerOpen(false); router.push('/profile'); }}
                tabIndex={0}
              >
                View Profile
              </button>
            </div>
            {/* Drawer Menu: Section A - Account & Security */}
            <div className="p-6 pb-0">
              <div className="mb-3">
                <span className="uppercase text-xs font-bold text-[#4A5B6E] tracking-wider">Account & Security</span>
              </div>
              <div className="flex flex-col gap-1 mb-6">
                <button className="flex items-center gap-3 text-left py-2 px-2 rounded hover:bg-[#F8F9FA] text-[#1A5F7A] font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1A5F7A]" tabIndex={0} onClick={() => { setDrawerOpen(false); router.push('/profile'); }}>
                  <span role="img" aria-label="Profile" className="text-xl">👤</span> Profile
                </button>
                <button className="flex items-center gap-3 text-left py-2 px-2 rounded hover:bg-[#F8F9FA] text-[#1A5F7A] font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1A5F7A]" tabIndex={0} onClick={() => { setDrawerOpen(false); router.push('/settings/security'); }}>
                  <span role="img" aria-label="Security" className="text-xl">🔒</span> Security Settings
                </button>
                <button className="flex items-center gap-3 text-left py-2 px-2 rounded hover:bg-[#F8F9FA] text-[#1A5F7A] font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1A5F7A]" tabIndex={0} onClick={() => { setDrawerOpen(false); alert('Change PIN flow coming soon!'); }}>
                  <span role="img" aria-label="Change PIN" className="text-xl">🔢</span> Change PIN
                </button>
                <button className="flex items-center gap-3 text-left py-2 px-2 rounded hover:bg-[#F8F9FA] text-[#F4A261] font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F4A261]" tabIndex={0} onClick={() => { setDrawerOpen(false); alert('Forgot Password flow coming soon!'); }}>
                  <span role="img" aria-label="Forgot Password" className="text-xl">❓</span> Forgot Password?
                </button>
                <button className="flex items-center gap-3 text-left py-2 px-2 rounded hover:bg-[#F8F9FA] text-[#D32F2F] font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D32F2F]" tabIndex={0} onClick={() => { setDrawerOpen(false); alert('Fraud reporting coming soon!'); }}>
                  <span role="img" aria-label="Report Fraud" className="text-xl">🛡️</span> Report Fraud
                </button>
              </div>
              {/* Drawer Menu: Section B - Support & Legal */}
              <div className="mb-3">
                <span className="uppercase text-xs font-bold text-[#4A5B6E] tracking-wider">Support & Legal</span>
              </div>
              <div className="flex flex-col gap-1 mb-6">
                <button className="flex items-center gap-3 text-left py-2 px-2 rounded hover:bg-[#F8F9FA] text-[#1A5F7A] font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1A5F7A]" tabIndex={0} onClick={() => { setDrawerOpen(false); alert('Help Center coming soon!'); }}>
                  <span role="img" aria-label="Help Center" className="text-xl">📖</span> Help Center
                </button>
                <button className="flex items-center gap-3 text-left py-2 px-2 rounded hover:bg-[#F8F9FA] text-[#1A5F7A] font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1A5F7A]" tabIndex={0} onClick={() => { setDrawerOpen(false); alert('Contact Support coming soon!'); }}>
                  <span role="img" aria-label="Contact Support" className="text-xl">💬</span> Contact Support
                </button>
                <button className="flex items-center gap-3 text-left py-2 px-2 rounded hover:bg-[#F8F9FA] text-[#4A5B6E] font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4A5B6E]" tabIndex={0} onClick={() => { setDrawerOpen(false); router.push('/terms'); }}>
                  <span role="img" aria-label="Terms & Conditions" className="text-xl">📄</span> Terms & Conditions
                </button>
                <button className="flex items-center gap-3 text-left py-2 px-2 rounded hover:bg-[#F8F9FA] text-[#4A5B6E] font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4A5B6E]" tabIndex={0} onClick={() => { setDrawerOpen(false); router.push('/privacy'); }}>
                  <span role="img" aria-label="Privacy Policy" className="text-xl">🔏</span> Privacy Policy
                </button>
                <button className="flex items-center gap-3 text-left py-2 px-2 rounded hover:bg-[#F8F9FA] text-[#D32F2F] font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D32F2F]" tabIndex={0} onClick={() => { setDrawerOpen(false); alert('Delete Account flow coming soon!'); }}>
                  <span role="img" aria-label="Delete Account" className="text-xl">🗑️</span> Delete Account
                </button>
              </div>

              {/* Drawer Menu: Section C - Preferences */}
              <div className="mb-3">
                <span className="uppercase text-xs font-bold text-[#4A5B6E] tracking-wider">Preferences</span>
              </div>
              <div className="flex flex-col gap-1 mb-6">
                <button className="flex items-center gap-3 text-left py-2 px-2 rounded hover:bg-[#F8F9FA] text-[#1A5F7A] font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1A5F7A]" tabIndex={0} onClick={() => { setDrawerOpen(false); alert('Notification settings coming soon!'); }}>
                  <span role="img" aria-label="Notifications" className="text-xl">🔔</span> Notification Settings
                </button>
                <button className="flex items-center gap-3 text-left py-2 px-2 rounded hover:bg-[#F8F9FA] text-[#1A5F7A] font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1A5F7A]" tabIndex={0} onClick={() => { setDrawerOpen(false); alert('Privacy mode toggle coming soon!'); }}>
                  <span role="img" aria-label="Privacy Mode" className="text-xl">🕶️</span> Privacy Mode
                </button>
                <button className="flex items-center gap-3 text-left py-2 px-2 rounded hover:bg-[#F8F9FA] text-[#1A5F7A] font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1A5F7A]" tabIndex={0} onClick={() => { setDrawerOpen(false); alert('Currency & Region settings coming soon!'); }}>
                  <span role="img" aria-label="Currency" className="text-xl">💱</span> Currency & Region (NGN)
                </button>
                <button className="flex items-center gap-3 text-left py-2 px-2 rounded hover:bg-[#F8F9FA] text-[#1A5F7A] font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1A5F7A]" tabIndex={0} onClick={() => { setDrawerOpen(false); alert('Theme selection coming soon!'); }}>
                  <span role="img" aria-label="Theme" className="text-xl">🌓</span> Theme
                </button>
              </div>

              {/* Drawer Menu: Section D - App Info */}
              <div className="mb-3">
                <span className="uppercase text-xs font-bold text-[#4A5B6E] tracking-wider">App Info</span>
              </div>
              <div className="flex flex-col gap-1 mb-6">
                <div className="flex items-center gap-3 py-2 px-2 text-[#4A5B6E] font-semibold select-none">
                  <span role="img" aria-label="Version" className="text-xl">ℹ️</span> rilstack v1.0.0
                </div>
                <button className="flex items-center gap-3 text-left py-2 px-2 rounded hover:bg-[#F8F9FA] text-[#F4A261] font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F4A261]" tabIndex={0} onClick={() => { setDrawerOpen(false); alert('Rate the app coming soon!'); }}>
                  <span role="img" aria-label="Rate the App" className="text-xl">⭐</span> Rate the App
                </button>
                <button className="flex items-center gap-3 text-left py-2 px-2 rounded hover:bg-[#F8F9FA] text-[#1A5F7A] font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1A5F7A]" tabIndex={0} onClick={() => { setDrawerOpen(false); alert('Share rilstack coming soon!'); }}>
                  <span role="img" aria-label="Share rilstack" className="text-xl">📤</span> Share rilstack
                </button>
              </div>

              {/* Drawer Footer: Logout */}
              <div className="mt-2 pt-2 border-t border-[#E9EDF2]">
                <button className="w-full flex items-center gap-3 justify-center text-left py-3 px-2 rounded text-[#D32F2F] font-bold hover:bg-[#F8F9FA] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D32F2F]" tabIndex={0} onClick={() => { setDrawerOpen(false); signOut({ callbackUrl: "/" }); }}>
                  <span role="img" aria-label="Logout" className="text-xl">🚪</span> Logout
                </button>
              </div>
          </div>
          <div className="flex-1 bg-black/30" onClick={() => setDrawerOpen(false)} tabIndex={0} aria-label="Close menu overlay" />
        </div>
      )}
    </>
  );
}
