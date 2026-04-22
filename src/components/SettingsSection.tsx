"use client";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import Image from "next/image";
import ReviewsWidget from "./ReviewsWidget";

// Withdrawal Bank Section
function WithdrawalBankSection() {
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadBankSettings = async () => {
      try {
        const res = await fetch("/api/settings/bank", { method: "GET" });
        const payload = await res.json();

        if (res.ok && payload?.bank) {
          setBankName(payload.bank.bankName || "");
          setAccountNumber(payload.bank.accountNumber || "");
          setAccountName(payload.bank.accountName || "");
          return;
        }
      } catch {}

      const saved = localStorage.getItem("rilstack_bank");
      if (saved) {
        try {
          const data = JSON.parse(saved);
          setBankName(data.bankName || "");
          setAccountNumber(data.accountNumber || "");
          setAccountName(data.accountName || "");
        } catch {}
      }
    };

    loadBankSettings().finally(() => setIsLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess("");
    setError("");

    if (!bankName.trim() || !accountNumber.trim() || !accountName.trim()) {
      setError("All fields are required.");
      return;
    }

    if (!/^\d{10}$/.test(accountNumber.trim())) {
      setError("Account number must be exactly 10 digits.");
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch("/api/settings/bank", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bankName: bankName.trim(),
          accountNumber: accountNumber.trim(),
          accountName: accountName.trim(),
        }),
      });
      const payload = await res.json();
      if (!res.ok) {
        throw new Error(payload.error || "Failed to update bank details.");
      }

      localStorage.setItem(
        "rilstack_bank",
        JSON.stringify({ bankName, accountNumber, accountName }),
      );
      setSuccess("Bank details updated and saved to SeaTable.");
      setTimeout(() => setSuccess(""), 2000);
    } catch (err: any) {
      setError(err.message || "Failed to update bank details.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-3">
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1">
          Bank Name
        </label>
        <input
          className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 disabled:bg-slate-100"
          value={bankName}
          onChange={(e) => setBankName(e.target.value)}
          placeholder="e.g. Access Bank"
          disabled={isLoading || isSaving}
        />
      </div>
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1">
          Account Number
        </label>
        <input
          className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 disabled:bg-slate-100"
          value={accountNumber}
          onChange={(e) =>
            setAccountNumber(e.target.value.replace(/[^0-9]/g, ""))
          }
          maxLength={10}
          placeholder="e.g. 0123456789"
          disabled={isLoading || isSaving}
        />
      </div>
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1">
          Account Name
        </label>
        <input
          className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 disabled:bg-slate-100"
          value={accountName}
          onChange={(e) => setAccountName(e.target.value)}
          placeholder="e.g. John Doe"
          disabled={isLoading || isSaving}
        />
      </div>
      {error && <div className="text-red-600 text-xs">{error}</div>}
      {success && <div className="text-green-600 text-xs">{success}</div>}
      <button
        type="submit"
        disabled={isLoading || isSaving}
        className="rounded-xl bg-[#2c3e5f] px-5 py-3 text-sm font-semibold text-white hover:bg-[#1e2d46] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSaving ? "Saving..." : "Save Bank Details"}
      </button>
    </form>
  );
}

interface SettingsFormData {
  fullName: string;
  phone: string;
  email: string;
  dateOfBirth: string;
  gender: "M" | "F" | "other";
  stateOfOrigin: string;
  address: string;
  idType: "nin" | "bvn" | "passport" | "drivers-license" | "voters-card";
  idNumber: string;
}

export default function SettingsSection() {
  const { data: session } = useSession();
  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  // New toggles for upgrade
  const [privacyMode, setPrivacyMode] = useState(false);
  const [biometric, setBiometric] = useState(false);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [loginAlerts, setLoginAlerts] = useState(true);
  const [budgetAlerts, setBudgetAlerts] = useState(true);
  const [savingsReminders, setSavingsReminders] = useState(true);
  const [investmentUpdates, setInvestmentUpdates] = useState(true);
  const [promoTips, setPromoTips] = useState(true);
  // ...other toggles as needed

  const { register, handleSubmit, reset } = useForm<SettingsFormData>({
    defaultValues: {
      fullName: session?.user?.name || "",
      phone: "",
      email: session?.user?.email || "",
      dateOfBirth: "",
      gender: "M",
      stateOfOrigin: "",
      address: "",
      idType: "nin",
      idNumber: "",
    },
  });

  useEffect(() => {
    reset({
      fullName: session?.user?.name || "",
      phone: "",
      email: session?.user?.email || "",
      dateOfBirth: "",
      gender: "M",
      stateOfOrigin: "",
      address: "",
      idType: "nin",
      idNumber: "",
    });
  }, [reset, session?.user?.email, session?.user?.name]);

  useEffect(() => {
    const loadProfileSettings = async () => {
      if (!session?.user?.email) return;
      setIsLoadingProfile(true);
      try {
        const res = await fetch("/api/settings/profile", { method: "GET" });
        const payload = await res.json();
        if (!res.ok) {
          throw new Error(payload.error || "Failed to load profile settings");
        }

        if (payload?.profile) {
          reset({
            fullName: payload.profile.fullName || session?.user?.name || "",
            phone: payload.profile.phone || "",
            email: payload.profile.email || session?.user?.email || "",
            dateOfBirth: payload.profile.dateOfBirth || "",
            gender: payload.profile.gender || "M",
            stateOfOrigin: payload.profile.stateOfOrigin || "",
            address: payload.profile.address || "",
            idType: payload.profile.idType || "nin",
            idNumber: payload.profile.idNumber || "",
          });
        }
      } catch (error: any) {
        setSaveError(error.message || "Failed to load profile settings.");
      } finally {
        setIsLoadingProfile(false);
      }
    };

    loadProfileSettings();
  }, [reset, session?.user?.email, session?.user?.name]);

  const onProfilePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (profilePhotoUrl) {
      URL.revokeObjectURL(profilePhotoUrl);
    }
    setProfilePhotoUrl(URL.createObjectURL(file));
    setSaveSuccess("Profile photo updated. Remember to save your settings.");
  };

  const onSubmit = async (data: SettingsFormData) => {
    setSaveError(null);
    setSaveSuccess(null);
    if (!data.dateOfBirth) {
      setSaveError("Date of birth is required.");
      return;
    }

    setIsSavingProfile(true);
    try {
      const res = await fetch("/api/settings/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const payload = await res.json();

      if (!res.ok) {
        throw new Error(payload.error || "Failed to save settings");
      }

      setSaveSuccess("Settings saved successfully to SeaTable.");
    } catch (error: any) {
      setSaveError(error.message || "Failed to save settings.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  return (
    <div className="space-y-5 text-slate-800">

      {/* 4.1.1 Profile & Personal Info */}
      <section className="rounded-[20px] border border-slate-200 bg-white p-4 shadow-sm md:p-5">
        <h3 className="mb-2 text-base font-bold text-slate-900 md:text-lg">Profile & Personal Info</h3>
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <div className="flex flex-col items-center gap-2">
            <div className="h-20 w-20 rounded-full border-2 border-[#1A5F7A] bg-slate-100 flex items-center justify-center overflow-hidden">
              {profilePhotoUrl ? (
                <Image src={profilePhotoUrl} alt="Profile preview" width={80} height={80} unoptimized className="h-full w-full object-cover" />
              ) : (
                <span className="text-xs font-semibold text-slate-500">No Photo</span>
              )}
            </div>
            <label className="cursor-pointer rounded bg-[#1A5F7A] px-3 py-1 text-xs font-semibold text-white hover:bg-[#174e62]">
              {profilePhotoUrl ? "Change Photo" : "Add Photo"}
              <input type="file" accept="image/*" onChange={onProfilePhotoChange} className="hidden" />
            </label>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="grid flex-1 gap-3 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">Full Name</label>
              <input type="text" {...register("fullName", { required: true })} disabled={isLoadingProfile || isSavingProfile} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-500 disabled:cursor-not-allowed disabled:bg-slate-100" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">Email</label>
              <input type="email" {...register("email", { required: true })} disabled className="w-full rounded-xl border border-slate-300 bg-slate-100 px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">Phone Number</label>
              <input type="tel" {...register("phone", { required: true })} disabled={isLoadingProfile || isSavingProfile} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-500 disabled:cursor-not-allowed disabled:bg-slate-100" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">Date of Birth</label>
              <input type="date" {...register("dateOfBirth", { required: true })} disabled={isLoadingProfile || isSavingProfile} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 disabled:cursor-not-allowed disabled:bg-slate-100" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">Gender</label>
              <select {...register("gender", { required: true })} disabled={isLoadingProfile || isSavingProfile} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 disabled:cursor-not-allowed disabled:bg-slate-100">
                <option value="M">Male</option>
                <option value="F">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">State of Origin</label>
              <input type="text" {...register("stateOfOrigin", { required: true })} disabled={isLoadingProfile || isSavingProfile} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-500 disabled:cursor-not-allowed disabled:bg-slate-100" />
            </div>
            <div className="md:col-span-2">
              <label className="mb-1 block text-xs font-semibold text-slate-700">Residential Address</label>
              <input type="text" {...register("address", { required: true })} disabled={isLoadingProfile || isSavingProfile} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-500 disabled:cursor-not-allowed disabled:bg-slate-100" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">KYC ID Type</label>
              <select {...register("idType", { required: true })} disabled={isLoadingProfile || isSavingProfile} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 disabled:cursor-not-allowed disabled:bg-slate-100">
                <option value="nin">NIN</option>
                <option value="bvn">BVN</option>
                <option value="passport">International Passport</option>
                <option value="drivers-license">Driver&apos;s License</option>
                <option value="voters-card">Voter&apos;s Card</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">ID Number</label>
              <input type="text" {...register("idNumber", { required: true })} disabled={isLoadingProfile || isSavingProfile} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-500 disabled:cursor-not-allowed disabled:bg-slate-100" />
            </div>
            <div className="mt-1 flex items-center gap-2 md:col-span-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#2E7D32] text-white text-xs font-semibold">✔️ Verified</span>
              <button className="text-xs text-[#F4A261] underline ml-2" disabled>Upload missing docs</button>
            </div>
            <div className="mt-1 flex gap-2 md:col-span-2">
              <button className="text-xs text-[#1A5F7A] underline" disabled>Change Password</button>
              <button className="text-xs text-[#1A5F7A] underline" disabled>Change PIN</button>
            </div>
            {saveError && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{saveError}</div>
            )}
            {saveSuccess && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{saveSuccess}</div>
            )}
            <button type="submit" disabled={isLoadingProfile || isSavingProfile} className="rounded-xl bg-[#2c3e5f] px-5 py-3 text-sm font-semibold text-white hover:bg-[#1e2d46] disabled:cursor-not-allowed disabled:opacity-70">{isSavingProfile ? "Saving..." : "Save Settings"}</button>
          </form>
        </div>
      </section>

      {/* 4.1.2 Security */}
      <section className="rounded-[20px] border border-slate-200 bg-white p-4 shadow-sm md:p-5">
        <h3 className="mb-2 text-base font-bold text-slate-900 md:text-lg">Security</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-800">Biometric Login</span>
            <input type="checkbox" checked={biometric} onChange={() => setBiometric(v => !v)} className="accent-[#1A5F7A]" disabled />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-800">Privacy Mode</span>
            <input type="checkbox" checked={privacyMode} onChange={() => setPrivacyMode(v => !v)} className="accent-[#1A5F7A]" disabled />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-800">Session Management</span>
            <button className="text-xs text-[#1A5F7A] underline" disabled>View Devices</button>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-800">Two-Factor Authentication (2FA)</span>
            <button className="text-xs text-[#1A5F7A] underline" disabled>Setup</button>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-800">Login Alerts</span>
            <input type="checkbox" checked={loginAlerts} onChange={() => setLoginAlerts(v => !v)} className="accent-[#1A5F7A]" disabled />
          </div>
        </div>
      </section>

      {/* 4.1.3 Notifications */}
      <section className="rounded-[20px] border border-slate-200 bg-white p-4 shadow-sm md:p-5">
        <h3 className="mb-2 text-base font-bold text-slate-900 md:text-lg">Notifications</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-800">Push Notifications</span>
            <input type="checkbox" checked={pushNotifications} onChange={() => setPushNotifications(v => !v)} className="accent-[#1A5F7A]" disabled />
          </div>
          <div className="pl-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-700">Budget Alerts</span>
              <input type="checkbox" checked={budgetAlerts} onChange={() => setBudgetAlerts(v => !v)} className="accent-[#1A5F7A]" disabled />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-700">Savings Reminders</span>
              <input type="checkbox" checked={savingsReminders} onChange={() => setSavingsReminders(v => !v)} className="accent-[#1A5F7A]" disabled />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-700">Investment Updates</span>
              <input type="checkbox" checked={investmentUpdates} onChange={() => setInvestmentUpdates(v => !v)} className="accent-[#1A5F7A]" disabled />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-700">Promotions & Tips</span>
              <input type="checkbox" checked={promoTips} onChange={() => setPromoTips(v => !v)} className="accent-[#1A5F7A]" disabled />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#D32F2F]">Fraud Alerts</span>
              <input type="checkbox" checked disabled />
            </div>
          </div>
        </div>
      </section>

      {/* 4.1.4 Preferences */}
      <section className="rounded-[20px] border border-slate-200 bg-white p-4 shadow-sm md:p-5">
        <h3 className="mb-2 text-base font-bold text-slate-900 md:text-lg">Preferences</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-800">Default Currency</span>
            <span className="text-xs font-medium text-slate-700">NGN</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-800">Start of Week</span>
            <span className="text-xs font-medium text-slate-700">Monday</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-800">Date Format</span>
            <span className="text-xs font-medium text-slate-700">DD/MM/YYYY</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-800">Theme</span>
            <span className="text-xs font-medium text-slate-700">System</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-800">Language</span>
            <span className="text-xs font-medium text-slate-700">English</span>
          </div>
        </div>
      </section>

      {/* 4.1.5 Data & Privacy */}
      <section className="rounded-[20px] border border-slate-200 bg-white p-4 shadow-sm md:p-5">
        <h3 className="mb-2 text-base font-bold text-slate-900 md:text-lg">Data & Privacy</h3>
        <div className="space-y-3">
          <button className="text-xs text-[#1A5F7A] underline" disabled>Download My Data</button>
          <button className="text-xs text-[#D32F2F] underline" disabled>Delete Account</button>
          <button className="text-xs text-[#1A5F7A] underline" disabled>Manage Linked Accounts</button>
        </div>
      </section>

      {/* 4.1.6 Support & About */}
      <section className="rounded-[20px] border border-slate-200 bg-white p-4 shadow-sm md:p-5">
        <h3 className="mb-2 text-base font-bold text-slate-900 md:text-lg">Support & About</h3>
        <div className="space-y-3">
          <button className="text-xs text-[#1A5F7A] underline" disabled>Help Center</button>
          <button className="text-xs text-[#1A5F7A] underline" disabled>Contact Support</button>
          <button className="text-xs text-[#1A5F7A] underline" disabled>Report a Problem</button>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs font-medium text-slate-700">rilstack v1.0.0</span>
            <button className="text-xs text-[#1A5F7A] underline" disabled>Open Source Licenses</button>
          </div>
        </div>
      </section>

      <section className="rounded-[20px] border border-slate-200 bg-white p-4 shadow-sm md:p-5">
        <h3 className="mb-2 text-base font-bold text-slate-900 md:text-lg">
          Withdrawal Bank
        </h3>
        <a
          href="/settings/bank"
          className="block w-full rounded-xl bg-[#2c3e5f] px-5 py-3 text-sm font-semibold text-white text-center hover:bg-[#1e2d46] transition"
        >
          Change Withdrawal Bank
        </a>
      </section>

      <section className="rounded-[20px] border border-slate-200 bg-white p-4 shadow-sm md:p-5">
        <h3 className="text-base font-bold text-slate-900 md:text-lg">
          Write a Review
        </h3>
        <p className="mt-1 text-sm text-slate-700">
          Share your experience with Rilstack. Your feedback helps us improve!
        </p>
        <div className="mt-4">
          {/* ReviewsWidget allows users to write and view reviews */}
          <ReviewsWidget />
        </div>
      </section>

      <section className="rounded-[20px] border border-slate-200 bg-white p-4 shadow-sm md:p-5">
        <h3 className="text-base font-bold text-slate-900 md:text-lg">Support</h3>
        <p className="mt-1 text-sm text-slate-700">
          Need help with your account or KYC setup? Reach us directly.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <a
            href="tel:08116883025"
            className="rounded-xl bg-[#2c3e5f] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1e2d46]"
          >
            Contact Us
          </a>
          <span className="text-sm font-medium text-slate-700">
            08116883025
          </span>
        </div>
      </section>
    </div>
  );
}
