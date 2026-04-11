import React from "react";

export default function SkeletonCard({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-[#f3f4fa] rounded-2xl p-6 shadow flex flex-col gap-4 ${className}`}>
      <div className="h-6 w-1/3 bg-[#e6eaf0] rounded" />
      <div className="h-4 w-2/3 bg-[#e6eaf0] rounded" />
      <div className="h-3 w-full bg-[#e6eaf0] rounded" />
      <div className="h-3 w-5/6 bg-[#e6eaf0] rounded" />
      <div className="h-3 w-1/2 bg-[#e6eaf0] rounded" />
    </div>
  );
}
