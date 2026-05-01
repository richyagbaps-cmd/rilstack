"use client";
import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

function GoogleLogo() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M21.805 12.041c0-.818-.067-1.414-.212-2.032H12.2v3.74h5.514c-.111.929-.711 2.328-2.044 3.268l-.019.125 2.99 2.269.207.02c1.9-1.714 2.957-4.242 2.957-7.39z"
        fill="#4285F4"
      />
      <path
        d="M12.2 21.75c2.7 0 4.967-.873 6.623-2.319l-3.159-2.414c-.845.576-1.978.979-3.464.979-2.644 0-4.889-1.714-5.69-4.084l-.121.01-3.109 2.356-.042.113C4.883 19.537 8.273 21.75 12.2 21.75z"
        fill="#34A853"
      />
      <path
        d="M6.51 13.912A5.818 5.818 0 016.177 12c0-.665.122-1.309.322-1.912l-.006-.128-3.149-2.393-.103.048A9.607 9.607 0 002.355 12c0 1.546.378 3.006 1.044 4.365l3.111-2.453z"
        fill="#FBBC05"
      />
      <path
        d="M12.2 6.004c1.878 0 3.145.796 3.867 1.46l2.823-2.69C17.156 3.228 14.9 2.25 12.2 2.25 8.273 2.25 4.883 4.463 3.238 7.635L6.493 10.04c.812-2.37 3.057-4.036 5.707-4.036z"
        fill="#EB4335"
      />
    </svg>
  );
}

function LoginContent() {
  const { status } = useSession();
  const searchParams = useSearchParams();
  const [identifier, setIdentifier] = useState(""); // email or phone
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/dashboard");
    }
  }, [status, router]);

  useEffect(() => {
    const oauthError = searchParams.get("error");
    if (!oauthError) {
      return;
    }

    const oauthErrorMap: Record<string, string> = {
      OAuthAccountNotLinked: "This email is already linked to another login method.",
      OAuthCallback: "Google sign-in callback failed. Please try again.",
      OAuthSignin: "Unable to start Google sign-in. Please try again.",
      AccessDenied:
        "Google blocked access for this account. Ensure your OAuth app is published or this email is added as a test user.",
    };

    setError(oauthErrorMap[oauthError] || "Google sign-in failed. Please try again.");
  }, [searchParams]);

  if (status === "loading" || status === "authenticated") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#181A20] to-[#23263a]">
        <p className="text-white text-sm">Loading...</p>
      </div>
    );
  }

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
        <Image
          src="/icons/rilstack-logo.png"
          alt="rilstack logo"
          width={88}
          height={88}
          className="mb-4 h-[88px] w-[88px] object-contain"
          priority
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
            onClick={() => {
              window.location.href = `/api/auth/signin/google?callbackUrl=${encodeURIComponent("/dashboard")}`;
            }}
          >
            <GoogleLogo />
            <span>Sign in with Google</span>
          </button>
        </div>
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

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#181A20] to-[#23263a]">
        <p className="text-white text-sm">Loading...</p>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
