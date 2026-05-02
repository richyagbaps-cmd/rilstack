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
    surname: "",
    firstName: "",
    middleName: "",
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
  const [skipLoading, setSkipLoading] = useState(false);

  const composeFullName = (parts: {
    surname?: string;
    firstName?: string;
    middleName?: string;
  }) =>
    [parts.surname, parts.firstName, parts.middleName]
      .map((v) => String(v || "").trim())
      .filter(Boolean)
      .join(" ");

  useEffect(() => {
    const storedDraft = window.sessionStorage.getItem("rilstack-signup-draft");
    if (!storedDraft) {
      return;
    }

    try {
      const parsed = JSON.parse(storedDraft) as Partial<typeof emailCredentials> & {
        name?: string;
      };
      const restored = {
        surname: parsed.surname || "",
        firstName: parsed.firstName || "",
        middleName: parsed.middleName || "",
        email: parsed.email || "",
        password: parsed.password || "",
        confirmPassword: parsed.confirmPassword || "",
      };

      // Backward compatibility for old drafts that stored a single `name`.
      if ((!restored.surname || !restored.firstName) && parsed.name) {
        const parts = parsed.name.trim().split(/\s+/);
        restored.surname = restored.surname || parts[0] || "";
        restored.firstName = restored.firstName || parts[1] || "";
        restored.middleName = restored.middleName || parts.slice(2).join(" ");
      }

      setEmailCredentials(restored);
      setSignupMethod("email");
      setStep("kyc");
      setKYCDraft((prev) => ({
        ...prev,
        surname: prev?.surname || restored.surname,
        firstName: prev?.firstName || restored.firstName,
        middleName: prev?.middleName || restored.middleName,
        fullName: prev?.fullName || composeFullName(restored),
        email: prev?.email || restored.email,
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

    if (session) {
      router.replace("/dashboard");
      return;
    }
  }, [router, searchParams, session, status]);

  const handleEmailStart = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!emailCredentials.surname || !emailCredentials.firstName || !emailCredentials.email || !emailCredentials.password) {
      setError("Surname, first name, email, and password are required.");
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

    // Check for existing account before proceeding to KYC
    try {
      const checkRes = await fetch("/api/auth/check-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailCredentials.email }),
      });
      const checkData = await checkRes.json();
      if (checkData.exists) {
        router.push(`/login?notice=exists&email=${encodeURIComponent(emailCredentials.email)}`);
        return;
      }
    } catch {
      // Fail open — proceed to KYC if check fails
    }

    setSignupMethod("email");
    setKYCDraft((prev) => ({
      ...prev,
      surname: prev?.surname || emailCredentials.surname,
      firstName: prev?.firstName || emailCredentials.firstName,
      middleName: prev?.middleName || emailCredentials.middleName,
      fullName: prev?.fullName || composeFullName(emailCredentials),
      email: prev?.email || emailCredentials.email,
    }));
    setStep("kyc");
  };

  const handleKYCComplete = async (data: Record<string, any>) => {
    setError("");

    // Check if phone already has an account
    if (data.phone) {
      try {
        const phoneRes = await fetch("/api/auth/check-phone", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone: data.phone }),
        });
        const phoneData = await phoneRes.json();
        if (phoneData.exists) {
          setError(
            `An account with this phone number already exists. Please sign in instead.`,
          );
          // Small delay so the user sees the error before redirect
          setTimeout(() => {
            router.push(`/login?notice=exists`);
          }, 2500);
          return;
        }
      } catch {
        // Fail open — proceed if check errors
      }
    }

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
      surname: kycData.surname || emailCredentials.surname,
      firstName: kycData.firstName || emailCredentials.firstName,
      middleName: kycData.middleName || emailCredentials.middleName,
      name: kycData.fullName || composeFullName(emailCredentials),
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
      incomeRange: kycData.income,
      sourceOfFunds: kycData.source,
      selfieName: kycData.selfie?.name,
      idPhotoName: kycData.idPhoto?.name,
    };

    payload.name = payload.name || composeFullName(payload);

    const autoLoginWithRetry = async (identifier: string, password: string) => {
      const maxAttempts = 8;
      for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
        if (attempt === 1) {
          // Give the backend a short window to finish write + read propagation.
          await new Promise((resolve) => setTimeout(resolve, 250));
        }
        const authResult = await signIn("credentials", {
          identifier,
          email: identifier,
          password,
          redirect: false,
        });

        if (authResult && !authResult.error) {
          return true;
        }

        if (attempt < maxAttempts) {
          await new Promise((resolve) => setTimeout(resolve, attempt * 350));
        }
      }
      return false;
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
          if (res.status === 409 || (data.error || "").toLowerCase().includes("already exists")) {
            router.push(`/login?notice=exists&email=${encodeURIComponent(payload.email || "")}`);
            return;
          }
          throw new Error(data.error || "Registration failed");
        }

        const loginOk = await autoLoginWithRetry(
          String(payload.email || "").trim(),
          emailCredentials.password,
        );
        if (!loginOk) {
          // Final fallback: let NextAuth handle a full redirecting sign-in flow.
          await signIn("credentials", {
            identifier: String(payload.email || "").trim(),
            email: String(payload.email || "").trim(),
            password: emailCredentials.password,
            callbackUrl: "/dashboard",
            redirect: true,
          });

          // If redirect did not happen, show a clear path to continue.
          router.push(`/login?notice=created&email=${encodeURIComponent(String(payload.email || "").trim())}`);
          return;
        }
      }

      setSuccess("Profile saved successfully.");
      setStep("done");
      setTimeout(() => router.push("/dashboard"), 1200);
    } catch (e: any) {
      setError(e.message || "Registration failed");
    }
  };

  const handleSkipGoogleKyc = async () => {
    setError("");
    setSkipLoading(true);

    try {
      const res = await fetch("/api/auth/skip-profile", {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Unable to skip KYC right now.");
      }

      await update();
      router.replace("/dashboard");
    } catch (e: any) {
      setError(e.message || "Unable to skip KYC right now.");
    } finally {
      setSkipLoading(false);
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

  const inputCls =
    "w-full px-4 py-3 rounded-lg border border-[#1e2d50] bg-[#0a1020] text-white placeholder-[#4a6080] focus:outline-none focus:ring-2 focus:ring-[#00e096]";
  const btnPrimary =
    "w-full bg-[#00e096] text-[#060B1E] font-bold py-3 rounded-lg shadow hover:bg-[#00c080] transition text-base disabled:opacity-60";
  const btnSecondary =
    "w-full border border-[#1e2d50] bg-[#0a1020] text-white font-semibold py-2 rounded-lg hover:bg-[#111a30] transition";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#060B1E] px-4 py-8">
      <div className="w-full max-w-md bg-[#0D1530] border border-[#1e2d50] rounded-2xl shadow-2xl p-8">
        {/* Step indicator */}
        <div className="flex items-center justify-center gap-3 mb-6">
          {steps.slice(0, 5).map((label, idx) => (
            <div key={label} className="flex flex-col items-center">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-sm border-2 transition ${
                  stepIndex === idx
                    ? "bg-[#00e096] text-[#060B1E] border-[#00e096]"
                    : stepIndex > idx
                    ? "bg-[#00e096]/20 text-[#00e096] border-[#00e096]/40"
                    : "bg-[#0a1020] text-[#4a6080] border-[#1e2d50]"
                }`}
                aria-current={stepIndex === idx ? "step" : undefined}
              >
                {idx + 1}
              </div>
              <span className={`text-xs mt-1 ${stepIndex === idx ? "text-[#00e096]" : "text-[#4a6080]"}`}>
                {["Start", "Details", "KYC", "PIN", "Terms"][idx]}
              </span>
            </div>
          ))}
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-400 text-center">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 rounded-lg border border-[#00e096]/40 bg-[#00e096]/10 px-4 py-3 text-sm text-[#00e096] text-center">
            {success}
          </div>
        )}

        {step === "choose" && (
          <>
            <h2 className="text-2xl font-bold mb-1 text-center text-white">Sign Up</h2>
            <p className="text-[#8fafd4] text-center text-sm mb-6">Create your Rilstack account</p>
            <GoogleSignInButton />
            <button
              className={`${btnSecondary} mt-3`}
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
            <h2 className="text-2xl font-bold mb-1 text-center text-white">Create your account</h2>
            <p className="text-[#8fafd4] text-center text-sm mb-4">Fill in your basic details</p>
            <input
              type="text"
              className={inputCls}
              placeholder="Surname"
              value={emailCredentials.surname}
              onChange={(e) =>
                setEmailCredentials((prev) => ({ ...prev, surname: e.target.value }))
              }
              required
            />
            <input
              type="text"
              className={inputCls}
              placeholder="First name"
              value={emailCredentials.firstName}
              onChange={(e) =>
                setEmailCredentials((prev) => ({ ...prev, firstName: e.target.value }))
              }
              required
            />
            <input
              type="text"
              className={inputCls}
              placeholder="Middle name (optional)"
              value={emailCredentials.middleName}
              onChange={(e) =>
                setEmailCredentials((prev) => ({ ...prev, middleName: e.target.value }))
              }
            />
            <input
              type="email"
              className={inputCls}
              placeholder="Email address"
              value={emailCredentials.email}
              onChange={(e) =>
                setEmailCredentials((prev) => ({ ...prev, email: e.target.value }))
              }
              required
            />
            <input
              type="password"
              className={inputCls}
              placeholder="Password (min 8 characters)"
              value={emailCredentials.password}
              onChange={(e) =>
                setEmailCredentials((prev) => ({ ...prev, password: e.target.value }))
              }
              required
            />
            <input
              type="password"
              className={inputCls}
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
            <button type="submit" className={btnPrimary}>
              Continue
            </button>
          </form>
        )}

        {step === "kyc" && (
          <>
            <KYCForm
              mode={signupMethod === "google" ? "google" : "email"}
              initialData={kycDraft || undefined}
              onSaveDraft={setKYCDraft}
              onComplete={handleKYCComplete}
            />
            {signupMethod === "google" && (
              <button
                className={`${btnSecondary} mt-3`}
                onClick={handleSkipGoogleKyc}
                disabled={skipLoading}
                type="button"
              >
                {skipLoading ? "Skipping..." : "Skip for now and continue without DVA"}
              </button>
            )}
          </>
        )}

        {step === "pin" && (
          <>
            <PinSetup onComplete={handlePinComplete} />
            {signupMethod === "google" && (
              <button
                className={`${btnSecondary} mt-3`}
                onClick={handleSkipGoogleKyc}
                disabled={skipLoading}
                type="button"
              >
                {skipLoading ? "Skipping..." : "Skip for now and continue without DVA"}
              </button>
            )}
          </>
        )}

        {step === "terms" && (
          <div>
            <h3 className="text-lg font-bold mb-2 text-white">Terms &amp; Conditions</h3>
            <div
              className="mb-4 text-sm text-[#8fafd4] rounded-lg border border-[#1e2d50] bg-[#0a1020] p-3"
              style={{ maxHeight: 120, overflow: "auto" }}
            >
              By signing up, you agree to our terms of service and privacy policy.
            </div>
            <label className="flex items-center gap-2 mb-4 cursor-pointer">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="accent-[#00e096] w-4 h-4"
              />
              <span className="text-[#8fafd4] text-sm">I accept the terms and conditions</span>
            </label>
            <button
              className={btnPrimary}
              onClick={handleRegister}
              aria-label="Finish Registration"
              type="button"
            >
              Finish Registration
            </button>
            {signupMethod === "google" && (
              <button
                className={`${btnSecondary} mt-3`}
                onClick={handleSkipGoogleKyc}
                disabled={skipLoading}
                type="button"
              >
                {skipLoading ? "Skipping..." : "Skip for now and continue without DVA"}
              </button>
            )}
          </div>
        )}

        {step === "done" && (
          <div className="text-center text-[#00e096] font-bold py-4">
            Registration successful! Redirecting…
          </div>
        )}
      </div>
    </div>
  );
}
