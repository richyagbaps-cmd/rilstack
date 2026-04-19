import React from "react";

// Animated stacking rectangles for loading spinner
export default function LoadingDots({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex gap-1 items-end ${className}`} style={{ height: 18 }}>
      <span
        style={{
          display: "inline-block",
          width: 6,
          height: 8,
          background: "#1A5F7A",
          borderRadius: 3,
          animation: "stack-bounce 1s infinite",
          animationDelay: "0ms",
        }}
      />
      <span
        style={{
          display: "inline-block",
          width: 6,
          height: 14,
          background: "#F4A261",
          borderRadius: 3,
          animation: "stack-bounce 1s infinite",
          animationDelay: "200ms",
        }}
      />
      <span
        style={{
          display: "inline-block",
          width: 6,
          height: 10,
          background: "#1A5F7A",
          borderRadius: 3,
          animation: "stack-bounce 1s infinite",
          animationDelay: "400ms",
        }}
      />
      <style>{`
        @keyframes stack-bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
      `}</style>
    </span>
  );
}
