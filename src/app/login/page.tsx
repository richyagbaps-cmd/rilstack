"use client";
import React, { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const result = await signIn("credentials", {
        email,
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
        <img src="/icons/rilstack-logo.png" alt="Rilstack Logo" className="h-16 w-16 mb-4" />
        <h1 className="text-2xl font-bold text-[#2c3e5f] mb-2">Sign in to continue</h1>
        <p className="text-[#4A5B6E] mb-6">Jump right in</p>
        <form className="w-full flex flex-col gap-4" onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email Address"
            className="w-full px-4 py-3 rounded-lg border border-[#e0e6f7] focus:outline-none focus:ring-2 focus:ring-[#00e096] text-[#2c3e5f]"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full px-4 py-3 rounded-lg border border-[#e0e6f7] focus:outline-none focus:ring-2 focus:ring-[#00e096] text-[#2c3e5f]"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <div className="flex justify-between items-center text-sm">
            <Link href="/forgot-password" className="text-[#00e096] hover:underline">Forgot password?</Link>
          </div>
          <button
            type="submit"
            className="w-full bg-[#00e096] text-white font-bold py-3 rounded-lg shadow hover:bg-[#00c080] transition text-lg mt-2 disabled:opacity-60"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
          {error && <div className="text-red-600 text-center mt-2">{error}</div>}
        </form>
        <div className="flex flex-col gap-2 w-full mt-6">
          <button
            className="w-full bg-[#23263a] text-white font-semibold py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-[#181A20] transition"
            onClick={async () => {
              await signIn("google", { callbackUrl: "/dashboard" });
            }}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M21.35 11.1h-9.18v2.92h5.27c-.23 1.23-1.41 3.6-5.27 3.6-3.18 0-5.78-2.63-5.78-5.87s2.6-5.87 5.78-5.87c1.81 0 3.03.77 3.73 1.43l2.54-2.47C16.09 3.98 14.13 3 12 3 6.48 3 2 7.48 2 12s4.48 9 10 9c5.75 0 9.54-4.03 9.54-9.7 0-.65-.07-1.14-.19-1.6z"/></svg>
            Sign in with Google
          </button>
        </div>
        <div className="w-full flex justify-between items-center mt-6 text-sm">
          <span>New user?</span>
          <button
            className="ml-2 text-[#00e096] hover:underline font-semibold"
            onClick={async () => {
              await signIn("google", { callbackUrl: "/dashboard" });
            }}
          >
            Sign up with Google
          </button>
        </div>
        <div className="w-full flex flex-col items-center mt-4 text-xs text-[#4A5B6E]">
          <div className="flex gap-2">
            <Link href="/privacy" className="hover:underline">Privacy</Link>
            <span>|</span>
            <Link href="/terms" className="hover:underline">Terms</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
