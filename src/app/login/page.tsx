"use client";
import React, { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [identifier, setIdentifier] = useState(""); // email or phone
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const result = await signIn("credentials", {
        identifier,
        password,
        redirect: false,
      });
      if (result?.error) {
        setError("Invalid credentials. Please try again.");
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      setError("Unable to login. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-[#181A20] to-[#23263a] px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 flex flex-col items-center">
        <img
          src="/icons/rilstack-logo.png"
          alt="Rilstack Logo"
          className="h-16 w-16 mb-4"
        />
        <h1 className="text-2xl font-bold text-[#2c3e5f] mb-2">
          Sign in to continue
        </h1>
        <p className="text-[#4A5B6E] mb-6">Jump right in</p>
        <form className="w-full flex flex-col gap-4" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Email or Phone"
            className="w-full px-4 py-3 rounded-lg border border-[#e0e6f7] focus:outline-none focus:ring-2 focus:ring-[#00e096] text-[#2c3e5f]"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            required
          />
          <div className="relative w-full">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              aria-label="Password"
              className="w-full px-4 py-3 rounded-lg border border-[#e0e6f7] focus:outline-none focus:ring-2 focus:ring-[#00e096] text-[#2c3e5f] pr-12"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4A5B6E] hover:text-[#2c3e5f] focus:outline-none"
              tabIndex={0}
              onClick={() => setShowPassword((v) => !v)}
            >
              {showPassword ? (
                <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><path d="M12 5c-7 0-9 7-9 7s2 7 9 7 9-7 9-7-2-7-9-7z" stroke="#2c3e5f" strokeWidth="2"/><circle cx="12" cy="12" r="3" stroke="#2c3e5f" strokeWidth="2"/></svg>
              ) : (
                <svg width="22" height="22" fill="none" viewBox="0 0 24 24"><path d="M17.94 17.94A10.97 10.97 0 0112 19c-7 0-9-7-9-7a17.92 17.92 0 014.06-5.94M9.53 9.53A3.5 3.5 0 0112 8.5c1.93 0 3.5 1.57 3.5 3.5 0 .47-.09.92-.26 1.33" stroke="#2c3e5f" strokeWidth="2"/><path d="M1 1l22 22" stroke="#2c3e5f" strokeWidth="2"/></svg>
              )}
            </button>
          </div>
          <div className="flex justify-between items-center text-sm">
            <Link
              href="/forgot-password"
              className="text-[#00e096] hover:underline"
            >
              Forgot password?
            </Link>
            <Link href="/signup" className="text-[#00e096] hover:underline">
              Sign up
            </Link>
          </div>
          <button
            type="submit"
            className="w-full bg-[#00e096] text-white font-bold py-3 rounded-lg shadow hover:bg-[#00c080] transition text-lg mt-2 disabled:opacity-60 flex items-center justify-center gap-2"
            disabled={loading}
            aria-busy={loading}
          >
            {loading && (
              <svg className="animate-spin mr-2" width="20" height="20" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="#fff" strokeWidth="4"/><path className="opacity-75" fill="#fff" d="M4 12a8 8 0 018-8v8z"/></svg>
            )}
            {loading ? "Signing in..." : "Sign in"}
          </button>
          {error && (
            <div className="text-red-600 text-center mt-2">{error}</div>
          )}
        </form>
        <div className="flex flex-col gap-2 w-full mt-6">
          <button
            className="w-full border border-[#e0e6f7] bg-white text-[#23263a] font-semibold py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-[#f5f5f5] transition shadow-sm focus:outline-none"
            aria-label="Sign in with Google"
            onClick={async () => {
              await signIn("google", { callbackUrl: "/signup?provider=google" });
            }}
          >
            <img src="/icons/google.svg" alt="Google" className="w-5 h-5" />
            <span>Sign in with Google</span>
          </button>
        </div>
        {/* ...existing code... (Google sign in remains) */}
        <div className="w-full flex flex-col items-center mt-4 text-xs text-[#4A5B6E]">
          <div className="flex gap-2">
            <Link href="/privacy" className="hover:underline">
              Privacy
            </Link>
            <span>|</span>
            <Link href="/terms" className="hover:underline">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
