import React from "react";

export default function StepIndicator({ step, total }: { step: number; total: number }) {
  return (
    <div className="flex justify-center gap-2 mb-6">
      {[...Array(total)].map((_, i) => (
        <div
          key={i}
          className={`w-3 h-3 rounded-full transition-all duration-300 ${
            i === step ? "bg-[#00e096] scale-125" : "bg-[#e6eaf0]"
          }`}
        />
      ))}
    </div>
  );
}
