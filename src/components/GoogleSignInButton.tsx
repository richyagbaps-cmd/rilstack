"use client";

import { signIn } from "next-auth/react";

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
      <img
        src="/google-icon.svg"
        alt="Google"
        style={{ width: 22, height: 22 }}
      />
      {label}
    </button>
  );
}
