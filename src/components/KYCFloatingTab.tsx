import React, { useState } from "react";
import UltraComprehensiveKYCForm from "@/components/UltraComprehensiveKYCForm";

export default function KYCFloatingTab({
  prefill,
  onComplete,
}: {
  prefill: any;
  onComplete: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="fixed z-50 bottom-6 right-4 md:right-10 max-w-xs w-full">
      {!open ? (
        <div className="bg-white rounded-2xl shadow-xl p-4 flex items-center gap-3 border border-[#E9EDF2]">
          <span className="text-2xl">🛡️</span>
          <div className="flex-1">
            <div className="font-bold text-[#2c3e5f] text-base">
              Complete your KYC
            </div>
            <div className="text-xs text-[#334155]">
              Verify your identity to unlock all features.
            </div>
          </div>
          <button
            className="ml-2 px-3 py-1 bg-[#00e096] text-white rounded-lg font-semibold text-xs hover:bg-[#00c080] transition"
            onClick={() => setOpen(true)}
          >
            Start
          </button>
          <button
            className="ml-1 text-[#7a869a] hover:text-[#ef4444] text-lg"
            aria-label="Dismiss"
            onClick={() => setDismissed(true)}
          >
            &times;
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-2xl p-4 border border-[#E9EDF2]">
          <UltraComprehensiveKYCForm
            prefill={prefill}
            onSubmit={async (data: any) => {
              await fetch("/api/kyc/submit", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
              });
              setOpen(false);
              setDismissed(true);
              onComplete();
            }}
          />
          <button
            className="mt-4 w-full bg-gray-200 text-[#2c3e5f] font-bold py-2 rounded-lg shadow hover:bg-gray-300 transition text-sm"
            onClick={() => setOpen(false)}
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
