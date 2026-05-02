"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { savePinStored } from "@/components/PinModal";

const NIGERIAN_STATES = [
  "Abia","Adamawa","Akwa Ibom","Anambra","Bauchi","Bayelsa","Benue","Borno",
  "Cross River","Delta","Ebonyi","Edo","Ekiti","Enugu","FCT","Gombe","Imo",
  "Jigawa","Kaduna","Kano","Katsina","Kebbi","Kogi","Kwara","Lagos","Nasarawa",
  "Niger","Ogun","Ondo","Osun","Oyo","Plateau","Rivers","Sokoto","Taraba",
  "Yobe","Zamfara",
];

const ID_TYPES = ["National ID (NIN)", "International Passport", "Driver's Licence", "Voter's Card"];

const INCOME_RANGES = [
  "Below ₦50,000",
  "₦50,000 – ₦150,000",
  "₦150,000 – ₦500,000",
  "₦500,000 – ₦1,000,000",
  "Above ₦1,000,000",
];

const SOURCE_OPTIONS = [
  "Employment / Salary",
  "Business / Self-employment",
  "Investments",
  "Remittances",
  "Savings",
  "Other",
];

export default function CompleteProfilePage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();

  const [form, setForm] = useState({
    surname: "",
    firstName: "",
    middleName: "",
    phone: "",
    bvn: "",
    nin: "",
    dateOfBirth: "",
    gender: "M" as "M" | "F" | "other",
    stateOfOrigin: "",
    lga: "",
    address: "",
    idType: "",
    idNumber: "",
    occupation: "",
    incomeRange: "",
    sourceOfFunds: "",
    pin: "",
    confirmPin: "",
    termsAccepted: false,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const composeFullName = (parts: {
    surname?: string;
    firstName?: string;
    middleName?: string;
  }) =>
    [parts.surname, parts.firstName, parts.middleName]
      .map((value) => String(value || "").trim())
      .filter(Boolean)
      .join(" ");

  useEffect(() => {
    if (session?.user?.name) {
      setForm((f) => {
        if (f.surname || f.firstName || f.middleName) return f;
        const parts = String(session.user!.name || "").trim().split(/\s+/);
        return {
          ...f,
          surname: parts[0] || "",
          firstName: parts[1] || "",
          middleName: parts.slice(2).join(" "),
        };
      });
    }
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

    const fullName = composeFullName(form);

    if (!form.surname || !form.firstName) {
      setError("Surname and first name are required.");
      return;
    }

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
          surname: form.surname,
          firstName: form.firstName,
          middleName: form.middleName,
          name: fullName,
          phone: form.phone,
          bvn: form.bvn,
          nin: form.nin,
          dateOfBirth: form.dateOfBirth,
          gender: form.gender,
          stateOfOrigin: form.stateOfOrigin,
          lga: form.lga,
          address: form.address,
          idType: form.idType,
          idNumber: form.idNumber,
          occupation: form.occupation,
          incomeRange: form.incomeRange,
          sourceOfFunds: form.sourceOfFunds,
          pin: form.pin,
          termsAccepted: form.termsAccepted,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to save. Please try again.");
        return;
      }
      await update({
        profileComplete: true,
        kycLevel: Number(data?.user?.kycLevel ?? 1),
        expressAccessToken: String(data?.token || "").trim(),
        googleTempToken: null,
        dashboardAccessGranted: true,
      });
      // Sync PIN to localStorage so PinModal works immediately after profile completion
      savePinStored(form.pin);
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
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#2c3e5f] text-white text-xl font-bold">R</div>
          <h1 className="text-xl font-bold text-slate-900">Complete your profile</h1>
          <p className="mt-1 text-sm text-slate-500">
            Welcome{form.firstName ? `, ${form.firstName}` : ""}! Fill in your details to activate your account.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Personal details section */}
          <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Personal Details</p>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">Surname</label>
              <input type="text" value={form.surname} onChange={(e) => set("surname", e.target.value)} required
                placeholder="e.g. Okonkwo"
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-[#2c3e5f]" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">First Name</label>
              <input type="text" value={form.firstName} onChange={(e) => set("firstName", e.target.value)} required
                placeholder="e.g. Adaeze"
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-[#2c3e5f]" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">Middle Name</label>
              <input type="text" value={form.middleName} onChange={(e) => set("middleName", e.target.value)}
                placeholder="Optional"
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-[#2c3e5f]" />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">Phone Number</label>
            <input type="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} required
              placeholder="e.g. 08012345678"
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-[#2c3e5f]" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">Date of Birth</label>
              <input type="date" value={form.dateOfBirth} onChange={(e) => set("dateOfBirth", e.target.value)} required
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-[#2c3e5f]" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">Gender</label>
              <select value={form.gender} onChange={(e) => set("gender", e.target.value)} required
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-[#2c3e5f]">
                <option value="M">Male</option>
                <option value="F">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">State of Origin</label>
              <select value={form.stateOfOrigin} onChange={(e) => set("stateOfOrigin", e.target.value)} required
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-[#2c3e5f]">
                <option value="">Select state...</option>
                {NIGERIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">LGA</label>
              <input type="text" value={form.lga} onChange={(e) => set("lga", e.target.value)}
                placeholder="Local Govt Area"
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-[#2c3e5f]" />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">Residential Address</label>
            <input type="text" value={form.address} onChange={(e) => set("address", e.target.value)} required
              placeholder="e.g. 12 Broad Street, Lagos Island"
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-[#2c3e5f]" />
          </div>

          {/* Identity section */}
          <p className="pt-2 text-xs font-bold uppercase tracking-wide text-slate-400">Identity Verification</p>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              BVN <span className="font-normal text-slate-400">(Bank Verification Number)</span>
            </label>
            <input type="text" value={form.bvn}
              onChange={(e) => set("bvn", e.target.value.replace(/\D/g, "").slice(0, 11))}
              placeholder="11-digit BVN" maxLength={11}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-[#2c3e5f]" />
            <p className="mt-1 text-xs text-slate-400">Required for virtual account. Dial *565*0# to retrieve your BVN.</p>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              NIN <span className="font-normal text-slate-400">(National Identification Number)</span>
            </label>
            <input type="text" value={form.nin}
              onChange={(e) => set("nin", e.target.value.replace(/\D/g, "").slice(0, 11))}
              placeholder="11-digit NIN" maxLength={11}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-[#2c3e5f]" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">ID Type</label>
              <select value={form.idType} onChange={(e) => set("idType", e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-[#2c3e5f]">
                <option value="">Select type...</option>
                {ID_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">ID Number</label>
              <input type="text" value={form.idNumber} onChange={(e) => set("idNumber", e.target.value)}
                placeholder="ID document number"
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-[#2c3e5f]" />
            </div>
          </div>

          {/* Financial profile section */}
          <p className="pt-2 text-xs font-bold uppercase tracking-wide text-slate-400">Financial Profile</p>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">Occupation</label>
            <input type="text" value={form.occupation} onChange={(e) => set("occupation", e.target.value)}
              placeholder="e.g. Software Engineer, Trader, Civil Servant"
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-[#2c3e5f]" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">Monthly Income Range</label>
              <select value={form.incomeRange} onChange={(e) => set("incomeRange", e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-[#2c3e5f]">
                <option value="">Select range...</option>
                {INCOME_RANGES.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">Source of Funds</label>
              <select value={form.sourceOfFunds} onChange={(e) => set("sourceOfFunds", e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-[#2c3e5f]">
                <option value="">Select source...</option>
                {SOURCE_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* Security section */}
          <p className="pt-2 text-xs font-bold uppercase tracking-wide text-slate-400">Security</p>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">Set 4-digit PIN</label>
              <input type="password" value={form.pin}
                onChange={(e) => set("pin", e.target.value.replace(/\D/g, "").slice(0, 4))}
                required maxLength={4} placeholder="••••"
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-[#2c3e5f]" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">Confirm PIN</label>
              <input type="password" value={form.confirmPin}
                onChange={(e) => set("confirmPin", e.target.value.replace(/\D/g, "").slice(0, 4))}
                required maxLength={4} placeholder="••••"
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-[#2c3e5f]" />
            </div>
          </div>

          <label className="flex items-start gap-2 cursor-pointer">
            <input type="checkbox" checked={form.termsAccepted}
              onChange={(e) => set("termsAccepted", e.target.checked)}
              className="mt-0.5 h-4 w-4 accent-[#2c3e5f]" />
            <span className="text-xs text-slate-600">
              I agree to the{" "}
              <a href="/terms" target="_blank" className="text-[#1A5F7A] underline">Terms &amp; Conditions</a>
              {" "}and{" "}
              <a href="/privacy" target="_blank" className="text-[#1A5F7A] underline">Privacy Policy</a>
            </span>
          </label>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
          )}

          <button type="submit" disabled={saving}
            className="w-full rounded-xl bg-[#2c3e5f] py-3 text-sm font-semibold text-white hover:bg-[#1e2d46] disabled:cursor-not-allowed disabled:opacity-70">
            {saving ? "Saving..." : "Activate Account"}
          </button>

          <button type="button" onClick={() => signOut({ callbackUrl: "/login" })}
            className="w-full text-center text-xs text-slate-400 hover:text-slate-600">
            Sign out and use a different account
          </button>
        </form>
      </div>
    </div>
  );
}


