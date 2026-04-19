// GoogleSignInButton: Handles Google OAuth popup and returns profile
import { useEffect } from "react";

export default function GoogleSignInButton({
  onSuccess,
}: {
  onSuccess: (profile: any) => void;
}) {
  useEffect(() => {
    // Optionally load Google SDK here
  }, []);

  const handleGoogleSignIn = async () => {
    // TODO: Integrate real Google OAuth (e.g., next-auth or Google API)
    // Simulate Google profile for demo
    const profile = {
      fullName: "Demo User",
      email: "demo@gmail.com",
      picture: "https://randomuser.me/api/portraits/men/1.jpg",
    };
    onSuccess(profile);
  };

  return (
    <button
      className="w-full bg-red-500 text-white py-2 rounded flex items-center justify-center gap-2 font-semibold"
      onClick={handleGoogleSignIn}
    >
      <img
        src="/google-icon.svg"
        alt="Google"
        style={{ width: 22, height: 22 }}
      />
      Continue with Google
    </button>
  );
}
