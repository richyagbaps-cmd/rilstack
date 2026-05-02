"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

const NIGERIAN_STATES = [
  "Abia","Adamawa","Akwa Ibom","Anambra","Bauchi","Bayelsa","Benue","Borno",
  "Cross River","Delta","Ebonyi","Edo","Ekiti","Enugu","FCT","Gombe","Imo",
  "Jigawa","Kaduna","Kano","Katsina","Kebbi","Kogi","Kwara","Lagos","Nasarawa",
  "Niger","Ogun","Ondo","Osun","Oyo","Plateau","Rivers","Sokoto","Taraba",
  "Yobe","Zamfara",
];

export default function CompleteProfilePage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    bvn: "",
    dateOfBirth: "",
    gender: "M" as "M" | "F" | "other",
    stateOfOrigin: "",
    address: "",
    pin: "",
    confirmPin: "",
    termsAccepted: false,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pre-fill name from Google
  useEffect(() => {
    if (session?.user?.name) {
      setForm((f) => ({ ...f, name: f.name || session.user!.name! }));
    }
    // If profile already complete, send them to dashboard
    if (status === "authenticated" && (session?.user as any)?.profileComplete) {
      router.replace("/dashboard");
    }
  }, [session, status, router]);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8f9fc]">
        <p className="text-sm text-slate-500">Loading...</p>
      </div>
    );
  }

  if (status === "unauthenticated") {
    router.replace("/login");
    return null;
  }

  const set = (field: string, value: string | boolean) =>
    setForm((f) => ({ ...f, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (form.pin !== form.confirmPin) {
      setError("PINs do not match.");
      return;
    }
    if (!/^\d{4}$/.test(form.pin)) {
      setError("PIN must be exactly 4 digits.");
      return;
    }
    if (!form.termsAccepted) {
      setError("You must accept the terms and conditions.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/auth/complete-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          phone: form.phone,
          bvn: form.bvn,
          dateOfBirth: form.dateOfBirth,
          gender: form.gender,
          stateOfOrigin: form.stateOfOrigin,
          address: form.address,
          pin: form.pin,
          termsAccepted: form.termsAccepted,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to save. Please try again.");
        return;
      }
      // Refresh JWT so profileComplete flips to true
      await update();
      router.replace("/dashboard");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fc] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        {/* Header */}
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#2c3e5f] text-white text-xl font-bold">R</div>
          <h1 className="text-xl font-bold text-slate-900">Complete your profile</h1>
          <p className="mt-1 text-sm text-slate-500">
            Welcome{form.name ? `, ${form.name.split(" ")[0]}` : ""}! Fill in a few details to activate your account.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">Full Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              required
              placeholder="e.g. Adaeze Okonkwo"
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-[#2c3e5f]"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">Phone Number</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
              required
              placeholder="e.g. 08012345678"
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-[#2c3e5f]"
            />
          </div>

          {/* BVN */}
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              BVN <span className="font-normal text-slate-400">(Bank Verification Number)</span>
            </label>
            <input
              type="text"
              value={form.bvn}
              onChange={(e) => set("bvn", e.target.value.replace(/\D/g, "").slice(0, 11))}
              placeholder="11-digit BVN"
              maxLength={11}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-[#2c3e5f]"
            />
            <p className="mt-1 text-xs text-slate-400">Required to activate your virtual account. Dial *565*0# to get your BVN.</p>
          </div>

          {/* DOB + Gender */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">Date of Birth</label>
              <input
                type="date"
                value={form.dateOfBirth}
                onChange={(e) => set("dateOfBirth", e.target.value)}
                required
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-[#2c3e5f]"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">Gender</label>
              <select
                value={form.gender}
                onChange={(e) => set("gender", e.target.value)}
                required
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-[#2c3e5f]"
              >
                <option value="M">Male</option>
                <option value="F">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          {/* State */}
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">State of Origin</label>
            <select
              value={form.stateOfOrigin}
              onChange={(e) => set("stateOfOrigin", e.target.value)}
              required
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-[#2c3e5f]"
            >
              <option value="">Select state...</option>
              {NIGERIAN_STATES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Address */}
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">Residential Address</label>
            <input
              type="text"
              value={form.address}
              onChange={(e) => set("address", e.target.value)}
              required
              placeholder="e.g. 12 Broad Street, Lagos Island"
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-[#2c3e5f]"
            />
          </div>

          {/* PIN */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">Set 4-digit PIN</label>
              <input
                type="password"
                value={form.pin}
                onChange={(e) => set("pin", e.target.value.replace(/\D/g, "").slice(0, 4))}
                required
                maxLength={4}
                placeholder="••••"
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-[#2c3e5f]"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">Confirm PIN</label>
              <input
                type="password"
                value={form.confirmPin}
                onChange={(e) => set("confirmPin", e.target.value.replace(/\D/g, "").slice(0, 4))}
                required
                maxLength={4}
                placeholder="••••"
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-[#2c3e5f]"
              />
            </div>
          </div>

          {/* Terms */}
          <label className="flex items-start gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.termsAccepted}
              onChange={(e) => set("termsAccepted", e.target.checked)}
              className="mt-0.5 h-4 w-4 accent-[#2c3e5f]"
            />
            <span className="text-xs text-slate-600">
              I agree to the{" "}
              <a href="/terms" target="_blank" className="text-[#1A5F7A] underline">Terms & Conditions</a>
              {" "}and{" "}
              <a href="/privacy" target="_blank" className="text-[#1A5F7A] underline">Privacy Policy</a>
            </span>
          </label>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-xl bg-[#2c3e5f] py-3 text-sm font-semibold text-white hover:bg-[#1e2d46] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {saving ? "Saving..." : "Activate Account"}
          </button>

          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="w-full text-center text-xs text-slate-400 hover:text-slate-600"
          >
            Sign out and use a different account
          </button>
        </form>
      </div>
    </div>
  );
}
