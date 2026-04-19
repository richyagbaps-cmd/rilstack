import React, { useState } from "react";
import UltraComprehensiveKYCForm from "./UltraComprehensiveKYCForm";

export default function KYCCompactTab({
  session,
  onComplete,
}: {
  session: any;
  onComplete: () => void;
}) {
  const [open, setOpen] = useState(true);
  const [showForm, setShowForm] = useState(false);

  if (!open) return null;

  return (
    <div className="fixed bottom-6 right-4 z-50 max-w-xs w-full">
      {!showForm ? (
        <div className="bg-white rounded-2xl shadow-xl p-4 flex items-center gap-4 border border-[#E9EDF2]">
          <div className="flex-1">
            <div className="text-sm font-bold text-[#2c3e5f] mb-1">
              Complete your KYC
            </div>
            <div className="text-xs text-[#4A5B6E] mb-2">
              Verify your identity to unlock all features.
            </div>
            <button
              className="bg-[#00e096] text-white font-bold px-4 py-2 rounded-lg text-xs hover:bg-[#00c080] transition"
              onClick={() => setShowForm(true)}
            >
              Start KYC
            </button>
            <button
              className="ml-2 text-[#4A5B6E] underline text-xs"
              onClick={() => setOpen(false)}
            >
              Dismiss
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-2xl p-4 border border-[#E9EDF2]">
          <UltraComprehensiveKYCForm
            prefill={session?.user || {}}
            onSubmit={async (data) => {
              await fetch("/api/kyc/submit", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
              });
              setShowForm(false);
              setOpen(false);
              onComplete();
            }}
          />
          <button
            className="mt-4 text-[#4A5B6E] underline text-xs"
            onClick={() => setShowForm(false)}
          >
            Back
          </button>
        </div>
      )}
    </div>
  );
}
