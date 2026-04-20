"use client";

import { useEffect, useState, Suspense } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

import GoogleSignInButton from "@/components/GoogleSignInButton";
import KYCForm from "@/components/KYCForm";
import PinSetup from "@/components/PinSetup";

type SignupStep =
  | "choose"
  | "emailCredentials"
  | "kyc"
  | "pin"
  | "terms"
  | "done";

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <SignupPageInner />
    </Suspense>
  );
}

function SignupPageInner() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [step, setStep] = useState<SignupStep>("choose");
  const [signupMethod, setSignupMethod] = useState<"google" | "email" | null>(null);
  const [emailCredentials, setEmailCredentials] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [kycDraft, setKYCDraft] = useState<Record<string, any> | null>(null);
  const [kycData, setKYCData] = useState<Record<string, any> | null>(null);
  const [pin, setPin] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const storedDraft = window.sessionStorage.getItem("rilstack-signup-draft");
    if (!storedDraft) {
      return;
    }

    try {
      const parsed = JSON.parse(storedDraft) as typeof emailCredentials;
      setEmailCredentials(parsed);
      setSignupMethod("email");
      setStep("kyc");
      setKYCDraft((prev) => ({
        ...prev,
        fullName: prev?.fullName || parsed.name,
        email: prev?.email || parsed.email,
      }));
      window.sessionStorage.removeItem("rilstack-signup-draft");
    } catch {
      window.sessionStorage.removeItem("rilstack-signup-draft");
    }
  }, []);

  useEffect(() => {
    const provider = searchParams.get("provider");

    if (status !== "authenticated") {
      return;
    }

    if ((session?.user as any)?.profileComplete) {
      router.replace("/app");
      return;
    }

    if (provider === "google") {
      setSignupMethod("google");
      setKYCDraft((prev) => ({
        ...prev,
        fullName: prev?.fullName || session?.user?.name || "",
        email: prev?.email || session?.user?.email || "",
      }));
      setStep("kyc");
    }
  }, [router, searchParams, session, status]);

  const handleEmailStart = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!emailCredentials.name || !emailCredentials.email || !emailCredentials.password) {
      setError("Name, email, and password are required.");
      return;
    }

    if (emailCredentials.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (emailCredentials.password !== emailCredentials.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSignupMethod("email");
    setKYCDraft((prev) => ({
      ...prev,
      fullName: prev?.fullName || emailCredentials.name,
      email: prev?.email || emailCredentials.email,
    }));
    setStep("kyc");
  };

  const handleKYCComplete = (data: Record<string, any>) => {
    setKYCData(data);
    setStep("pin");
  };

  const handlePinComplete = (pinValue: string) => {
    setPin(pinValue);
    setStep("terms");
  };

  const handleRegister = async () => {
    setError("");
    if (!termsAccepted) {
      setError("You must accept the terms and conditions.");
      return;
    }

    if (!kycData) {
      setError("Complete your profile details first.");
      return;
    }

    const payload = {
      name: kycData.fullName || emailCredentials.name,
      email: kycData.email || emailCredentials.email || session?.user?.email,
      phone: kycData.phone,
      pin,
      termsAccepted,
      dateOfBirth: kycData.dob,
      gender: kycData.gender,
      nin: kycData.nin,
      bvn: kycData.bvn,
      address: kycData.address,
      stateOfOrigin: kycData.state,
      lga: kycData.lga,
      idType: kycData.idType,
      idNumber: kycData.idNumber,
      occupation: kycData.occupation,
      income: kycData.income,
      source: kycData.source,
      selfieName: kycData.selfie?.name,
      idPhotoName: kycData.idPhoto?.name,
    };

    try {
      if (signupMethod === "google") {
        const res = await fetch("/api/auth/complete-profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Failed to complete profile.");
        }
        await update();
      } else {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...payload,
            password: emailCredentials.password,
            kycData: {
              emailVerified: false,
              detailsComplete: true,
              lga: kycData.lga,
              idType: kycData.idType,
              idNumber: kycData.idNumber,
              occupation: kycData.occupation,
              income: kycData.income,
              source: kycData.source,
              selfieName: kycData.selfie?.name,
              idPhotoName: kycData.idPhoto?.name,
            },
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Registration failed");
        }

        const authResult = await signIn("credentials", {
          email: payload.email,
          password: emailCredentials.password,
          redirect: false,
        });
        if (!authResult || authResult.error) {
          throw new Error("Account created but automatic login failed.");
        }
      }

      setSuccess("Profile saved successfully.");
      setStep("done");
      setTimeout(() => router.push("/app"), 1200);
    } catch (e: any) {
      setError(e.message || "Registration failed");
    }
  };

  const steps = ["choose", "details", "kyc", "pin", "terms", "done"];
  const stepIndex =
    step === "choose"
      ? 0
      : step === "emailCredentials"
        ? 1
        : step === "kyc"
          ? 2
          : step === "pin"
            ? 3
            : step === "terms"
              ? 4
              : 5;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-900 to-blue-600 p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md relative">
        <div className="flex items-center justify-center gap-2 mb-6">
          {steps.slice(0, 5).map((label, idx) => (
            <div key={label} className="flex flex-col items-center">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-sm border-2 ${stepIndex === idx ? "bg-blue-600 text-white border-blue-600" : "bg-white text-blue-600 border-blue-300"}`}
                aria-current={stepIndex === idx ? "step" : undefined}
              >
                {idx + 1}
              </div>
              <span className="text-xs mt-1 text-blue-600 opacity-80">
                {["Start", "Details", "KYC", "PIN", "Terms"][idx]}
              </span>
            </div>
          ))}
        </div>

        {error && (
          <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded shadow font-semibold z-10 animate-fade-in">
            {error}
          </div>
        )}
        {success && (
          <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded shadow font-semibold z-10 animate-fade-in">
            {success}
          </div>
        )}

        {step === "choose" && (
          <>
            <h2 className="text-2xl font-bold mb-4 text-center">Sign Up</h2>
            <GoogleSignInButton />
            <button
              className="w-full border border-blue-500 text-blue-700 py-2 rounded font-semibold mt-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
              onClick={() => setStep("emailCredentials")}
              aria-label="Sign up with Email"
              type="button"
            >
              Sign up with Email
            </button>
          </>
        )}

        {step === "emailCredentials" && (
          <form className="space-y-4" onSubmit={handleEmailStart}>
            <h2 className="text-2xl font-bold mb-4 text-center">Create your account</h2>
            <input
              type="text"
              className="w-full border p-3 rounded"
              placeholder="Full name"
              value={emailCredentials.name}
              onChange={(e) =>
                setEmailCredentials((prev) => ({ ...prev, name: e.target.value }))
              }
              required
            />
            <input
              type="email"
              className="w-full border p-3 rounded"
              placeholder="Email address"
              value={emailCredentials.email}
              onChange={(e) =>
                setEmailCredentials((prev) => ({ ...prev, email: e.target.value }))
              }
              required
            />
            <input
              type="password"
              className="w-full border p-3 rounded"
              placeholder="Password"
              value={emailCredentials.password}
              onChange={(e) =>
                setEmailCredentials((prev) => ({ ...prev, password: e.target.value }))
              }
              required
            />
            <input
              type="password"
              className="w-full border p-3 rounded"
              placeholder="Confirm password"
              value={emailCredentials.confirmPassword}
              onChange={(e) =>
                setEmailCredentials((prev) => ({
                  ...prev,
                  confirmPassword: e.target.value,
                }))
              }
              required
            />
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded font-semibold"
            >
              Continue
            </button>
          </form>
        )}

        {step === "kyc" && (
          <KYCForm
            mode={signupMethod === "google" ? "google" : "email"}
            initialData={kycDraft || undefined}
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
              By signing up, you agree to our terms of service and privacy policy.
            </div>
            <label className="flex items-center gap-2 mb-4">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
              />
              <span>I accept the terms and conditions</span>
            </label>
            <button
              className="w-full bg-blue-600 text-white py-2 rounded font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
              onClick={handleRegister}
              aria-label="Finish Registration"
              type="button"
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
