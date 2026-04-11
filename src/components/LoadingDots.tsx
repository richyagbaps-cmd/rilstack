import React from "react";

export default function LoadingDots({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex gap-1 items-center ${className}`}>
      <span className="w-2 h-2 bg-[#00e096] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
      <span className="w-2 h-2 bg-[#00e096] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
      <span className="w-2 h-2 bg-[#00e096] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
    </span>
  );
}
