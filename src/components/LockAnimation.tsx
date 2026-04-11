import React from "react";

export default function LockAnimation({ show }: { show: boolean }) {
  return show ? (
    <div className="flex flex-col items-center justify-center py-8">
      <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
        <rect x="10" y="28" width="40" height="22" rx="8" fill="#FFD700" />
        <rect x="22" y="18" width="16" height="14" rx="8" fill="#FFF7CC" />
        <ellipse cx="30" cy="38" rx="4" ry="4" fill="#2c3e5f" />
        <rect x="28" y="38" width="4" height="8" rx="2" fill="#2c3e5f" />
      </svg>
      <div className="mt-4 text-[#FFD700] font-bold text-lg animate-bounce">Locked!</div>
    </div>
  ) : null;
}
