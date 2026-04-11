import React from "react";

export default function EmptyStatePiggy({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
        <ellipse cx="40" cy="50" rx="30" ry="18" fill="#FFD700" />
        <ellipse cx="40" cy="50" rx="24" ry="14" fill="#FFF7CC" />
        <ellipse cx="40" cy="50" rx="18" ry="10" fill="#FFD700" />
        <circle cx="28" cy="46" r="2" fill="#2c3e5f" />
        <circle cx="52" cy="46" r="2" fill="#2c3e5f" />
        <ellipse cx="40" cy="60" rx="6" ry="2" fill="#2c3e5f" />
        <rect x="36" y="38" width="8" height="4" rx="2" fill="#2c3e5f" />
      </svg>
      <div className="mt-6 text-[#4A5B6E] text-lg font-semibold text-center">{message}</div>
    </div>
  );
}
