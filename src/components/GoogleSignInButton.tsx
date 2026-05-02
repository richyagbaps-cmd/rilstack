"use client";

import { signIn } from "next-auth/react";

function GoogleLogo() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
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

export default function GoogleSignInButton({
  callbackUrl = "/signup?provider=google",
  label = "Continue with Google",
}: {
  callbackUrl?: string;
  label?: string;
}) {
  const handleGoogleSignIn = async () => {
    await signIn("google", { callbackUrl });
  };

  return (
    <button
      type="button"
      className="w-full bg-red-500 text-white py-2 rounded flex items-center justify-center gap-2 font-semibold"
      onClick={handleGoogleSignIn}
    >
      <GoogleLogo />
      {label}
    </button>
  );
}
