"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function BiometricSetup() {
  const router = useRouter();
  const [enabled, setEnabled] = useState(false);
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  // Simulate biometric prompt
  const handleEnable = async () => {
    setLoading(true);
    setError("");
    setTimeout(() => {
      setLoading(false);
      setEnabled(true);
      setStep(2);
      setSuccess("Biometric login enabled! You can now use Face ID or Fingerprint for secure access.");
    }, 1200);
  };

  const handleDisable = async () => {
    setLoading(true);
    setError("");
    setTimeout(() => {
      setLoading(false);
      setEnabled(false);
      setStep(1);
      setSuccess("Biometric login disabled.");
    }, 1000);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8F9FA] px-4 py-8">
      <div className="w-full max-w-md bg-white rounded-2xl shadow p-6 space-y-6">
        <h2 className="text-2xl font-bold text-[#1A5F7A] mb-2 text-center">Biometric Login</h2>
        {step === 1 && (
          <>
            <div className="text-center text-[#4A5B6E] mb-4">
              Enable Face ID or Fingerprint for faster, more secure login and sensitive actions.
            </div>
            <button
              className="w-full rounded bg-[#1A5F7A] text-white font-semibold py-2 mt-2 hover:bg-[#174e62]"
              onClick={handleEnable}
              disabled={loading}
              aria-label="Enable Biometric Login"
            >
              {loading ? "Enabling..." : "Enable Biometric Login"}
            </button>
          </>
        )}
        {step === 2 && (
          <>
            <div className="text-center text-[#2E7D32] font-semibold mb-4">
              Biometric login is enabled!
            </div>
            <button
              className="w-full rounded bg-[#D32F2F] text-white font-semibold py-2 mt-2 hover:bg-[#b71c1c]"
              onClick={handleDisable}
              disabled={loading}
              aria-label="Disable Biometric Login"
            >
              {loading ? "Disabling..." : "Disable Biometric Login"}
            </button>
          </>
        )}
        {success && <div className="text-green-700 text-center font-semibold py-2">{success}</div>}
        {error && <div className="text-red-600 text-center font-semibold py-2">{error}</div>}
      </div>
    </div>
  );
}
