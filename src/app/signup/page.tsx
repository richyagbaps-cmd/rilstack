"use client";
import { useState } from "react";

import GoogleSignInButton from "@/components/GoogleSignInButton";
import KYCForm from "@/components/KYCForm";
import PinSetup from "@/components/PinSetup";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const [step, setStep] = useState<
    "choose" | "google" | "email" | "kyc" | "pin" | "terms" | "done"
  >("choose");
  const [googleProfile, setGoogleProfile] = useState<any>(null);
  const [kycDraft, setKYCDraft] = useState<any>(null);
  const [kycData, setKYCData] = useState<any>(null);
  const [pin, setPin] = useState<string>("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [error, setError] = useState<string>("");
  const router = useRouter();

  // After KYC, go to PIN setup
  const handleKYCComplete = (data?: any) => {
    setKYCData(data || kycDraft || googleProfile);
    setStep("pin");
  };

  // After PIN, show T&C
  const handlePinComplete = (pinValue: string) => {
    setPin(pinValue);
    setStep("terms");
  };

  // Final registration
  const handleRegister = async () => {
    setError("");
    if (!termsAccepted) {
      setError("You must accept the terms and conditions.");
      return;
    }
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kyc: kycData, pin, termsAccepted }),
      });
      if (!res.ok)
        throw new Error((await res.json()).error || "Registration failed");
      setStep("done");
      setTimeout(() => router.push("/app"), 1200);
    } catch (e: any) {
      setError(e.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-900 to-blue-600 p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
        {step === "choose" && (
          <>
            <h2 className="text-2xl font-bold mb-4 text-center">Sign Up</h2>
            <button
              className="w-full bg-red-500 text-white py-2 rounded mb-4 flex items-center justify-center gap-2 font-semibold"
              onClick={() => setStep("google")}
            >
              Continue with Google
            </button>
            <button
              className="w-full border border-blue-500 text-blue-700 py-2 rounded font-semibold"
              onClick={() => setStep("email")}
            >
              Sign up with Email
            </button>
          </>
        )}
        {step === "google" && (
          <GoogleSignInButton
            onSuccess={(profile) => {
              setGoogleProfile(profile);
              setStep("kyc");
            }}
          />
        )}
        {step === "email" && (
          <KYCForm
            mode="email"
            initialData={kycDraft}
            onSaveDraft={setKYCDraft}
            onComplete={handleKYCComplete}
          />
        )}
        {step === "kyc" && (
          <KYCForm
            mode={googleProfile ? "google" : "email"}
            initialData={googleProfile}
            onSaveDraft={setKYCDraft}
            onComplete={handleKYCComplete}
          />
        )}
        {step === "pin" && <PinSetup onComplete={handlePinComplete} />}
        {step === "terms" && (
          <div>
            <h3 className="font-bold mb-2">Terms & Conditions</h3>
            <div
              className="mb-2 text-sm text-gray-700"
              style={{ maxHeight: 120, overflow: "auto" }}
            >
              {/* Terms text can be loaded here */}
              By signing up, you agree to our terms of service and privacy
              policy.
            </div>
            <label className="flex items-center gap-2 mb-4">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
              />
              <span>I accept the terms and conditions</span>
            </label>
            {error && <div className="text-red-500 mb-2">{error}</div>}
            <button
              className="w-full bg-blue-600 text-white py-2 rounded font-semibold"
              onClick={handleRegister}
            >
              Finish Registration
            </button>
          </div>
        )}
        {step === "done" && (
          <div className="text-center text-green-600 font-bold">
            Registration successful! Redirecting...
          </div>
        )}
      </div>
    </div>
  );
}
