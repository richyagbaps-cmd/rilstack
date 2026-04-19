"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

function maskEmail(email: string) {
  if (!email) return "";
  const [user, domain] = email.split("@");
  return user[0] + "***" + user.slice(-1) + "@" + domain;
}
function maskPhone(phone: string) {
  if (!phone) return "";
  return phone.slice(0, 3) + "****" + phone.slice(-2);
}

export default function ForgotPasswordFlow() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [maskedContact, setMaskedContact] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [canResend, setCanResend] = useState(false);
  const [timer, setTimer] = useState(30);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [success, setSuccess] = useState("");
  // For 2FA
  const [require2FA, setRequire2FA] = useState(false);
  const [twoFA, setTwoFA] = useState("");
  const [twoFAError, setTwoFAError] = useState("");

  // Simulated backend
  const fakeAccount = {
    email: "user@rilstack.com",
    phone: "+2348012345678",
    has2FA: true,
  };

  // Step 1: Identify Account
  const handleIdentify = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (
        input === fakeAccount.email ||
        input === fakeAccount.phone
      ) {
        setMaskedContact(
          input.includes("@") ? maskEmail(input) : maskPhone(input)
        );
        setStep(2);
        setOtpSent(true);
        setTimer(30);
        setCanResend(false);
        setRequire2FA(fakeAccount.has2FA);
        // Start resend timer
        const interval = setInterval(() => {
          setTimer((t) => {
            if (t <= 1) {
              clearInterval(interval);
              setCanResend(true);
              return 0;
            }
            return t - 1;
          });
        }, 1000);
      } else {
        setError("No account found with that email/phone");
      }
    }, 1000);
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError("");
    if (otp.length !== 6) {
      setOtpError("Enter the 6-digit code");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (otp === "123456") {
        if (require2FA) {
          setStep(2.5);
        } else {
          setStep(3);
        }
      } else {
        setOtpError("Invalid code. Try again.");
      }
    }, 1000);
  };

  // Step 2.5: 2FA
  const handle2FA = (e: React.FormEvent) => {
    e.preventDefault();
    setTwoFAError("");
    if (twoFA.length !== 6) {
      setTwoFAError("Enter your 2FA code");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (twoFA === "654321") {
        setStep(3);
      } else {
        setTwoFAError("Invalid 2FA code");
      }
    }, 1000);
  };

  // Step 3: Reset Password
  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    if (
      password.length < 8 ||
      !/[A-Z]/.test(password) ||
      !/[0-9]/.test(password)
    ) {
      setPasswordError(
        "Password must be at least 8 characters, include a number and an uppercase letter."
      );
      return;
    }
    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess("Password reset successful! Please log in.");
      setTimeout(() => {
        router.push("/login?reset=1");
      }, 2000);
    }, 1200);
  };

  // Step 2: Resend OTP
  const handleResend = () => {
    setOtp("");
    setOtpSent(true);
    setTimer(30);
    setCanResend(false);
    // Start resend timer
    const interval = setInterval(() => {
      setTimer((t) => {
        if (t <= 1) {
          clearInterval(interval);
          setCanResend(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8F9FA] px-4 py-8">
      <div className="w-full max-w-md bg-white rounded-2xl shadow p-6 space-y-6">
        <h2 className="text-2xl font-bold text-[#1A5F7A] mb-2 text-center">Forgot Password</h2>
        {step === 1 && (
          <form onSubmit={handleIdentify} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Email or Phone</label>
              <input
                className="w-full rounded border px-3 py-2"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter your email or phone"
                required
              />
            </div>
            {error && <div className="text-red-600 text-xs">{error}</div>}
            <button
              type="submit"
              className="w-full rounded bg-[#1A5F7A] text-white font-semibold py-2 mt-2 hover:bg-[#174e62]"
              disabled={loading}
            >
              {loading ? "Checking..." : "Continue"}
            </button>
          </form>
        )}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="text-sm mb-2">
              We sent a code to <span className="font-bold">{maskedContact}</span>
            </div>
            <div className="flex gap-2 items-center">
              <input
                className="w-32 rounded border px-3 py-2 text-center tracking-widest text-lg"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="6-digit code"
                required
              />
              <button
                type="button"
                className="text-xs text-[#1A5F7A] underline disabled:opacity-50"
                onClick={handleResend}
                disabled={!canResend}
              >
                Resend {canResend ? "" : `in ${timer}s`}
              </button>
            </div>
            {otpError && <div className="text-red-600 text-xs">{otpError}</div>}
            <button
              type="submit"
              className="w-full rounded bg-[#1A5F7A] text-white font-semibold py-2 mt-2 hover:bg-[#174e62]"
              disabled={loading}
            >
              {loading ? "Verifying..." : "Verify Code"}
            </button>
          </form>
        )}
        {step === 2.5 && (
          <form onSubmit={handle2FA} className="space-y-4">
            <div className="text-sm mb-2">
              2FA is enabled. Enter your 2FA code.
            </div>
            <input
              className="w-32 rounded border px-3 py-2 text-center tracking-widest text-lg"
              value={twoFA}
              onChange={(e) => setTwoFA(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="2FA code"
              required
            />
            {twoFAError && <div className="text-red-600 text-xs">{twoFAError}</div>}
            <button
              type="submit"
              className="w-full rounded bg-[#1A5F7A] text-white font-semibold py-2 mt-2 hover:bg-[#174e62]"
              disabled={loading}
            >
              {loading ? "Verifying..." : "Continue"}
            </button>
          </form>
        )}
        {step === 3 && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-1">New Password</label>
              <input
                type="password"
                className="w-full rounded border px-3 py-2"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="New password"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Confirm Password</label>
              <input
                type="password"
                className="w-full rounded border px-3 py-2"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
                required
              />
            </div>
            {passwordError && <div className="text-red-600 text-xs">{passwordError}</div>}
            <button
              type="submit"
              className="w-full rounded bg-[#1A5F7A] text-white font-semibold py-2 mt-2 hover:bg-[#174e62]"
              disabled={loading}
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        )}
        {success && (
          <div className="text-green-700 text-center font-semibold py-4">{success}</div>
        )}
      </div>
    </div>
  );
}
