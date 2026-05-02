"use client";
import React, { useEffect, useState } from "react";
import { signOut, useSession } from "next-auth/react";
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
        const res = await fetch("/api/settings/bank", {
          method: "GET",
          cache: "no-store",
        });
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
      setSuccess("Bank details updated successfully.");
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
  surname: string;
  firstName: string;
  middleName: string;
  fullName: string;
  phone: string;
  email: string;
  dateOfBirth: string;
  gender: "M" | "F" | "other";
  stateOfOrigin: string;
  lga: string;
  address: string;
  nin: string;
  idType: "nin" | "bvn" | "passport" | "drivers-license" | "voters-card";
  idNumber: string;
  occupation: string;
  incomeRange: string;
  sourceOfFunds: string;
}

interface SavedProfileView {
  surname: string;
  firstName: string;
  middleName: string;
  fullName: string;
  phone: string;
  email: string;
  dateOfBirth: string;
  gender: "M" | "F" | "other";
  stateOfOrigin: string;
  lga: string;
  address: string;
  nin: string;
  idType: "nin" | "bvn" | "passport" | "drivers-license" | "voters-card";
  idNumber: string;
  occupation: string;
  incomeRange: string;
  sourceOfFunds: string;
  bvn?: string;
}

export default function SettingsSection() {
  const { data: session } = useSession();
  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string | null>(null);
  const [savedProfile, setSavedProfile] = useState<SavedProfileView | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [bvn, setBvn] = useState<string>("");
  const [prefsLoading, setPrefsLoading] = useState(true);
  const [prefsSaving, setPrefsSaving] = useState<string | null>(null);
  // Security
  const [privacyMode, setPrivacyMode] = useState(false);
  const [biometric, setBiometric] = useState(false);
  const [loginAlerts, setLoginAlerts] = useState(true);
  const [twoFaEnabled, setTwoFaEnabled] = useState(false);
  // Notifications
  const [pushNotifications, setPushNotifications] = useState(true);
  const [budgetAlerts, setBudgetAlerts] = useState(true);
  const [savingsReminders, setSavingsReminders] = useState(true);
  const [investmentUpdates, setInvestmentUpdates] = useState(true);
  const [promoTips, setPromoTips] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const { register, handleSubmit, reset } = useForm<SettingsFormData>({
    defaultValues: {
      surname: "",
      firstName: "",
      middleName: "",
      fullName: session?.user?.name || "",
      phone: "",
      email: session?.user?.email || "",
      dateOfBirth: "",
      gender: "M",
      stateOfOrigin: "",
      lga: "",
      address: "",
      nin: "",
      idType: "nin",
      idNumber: "",
      occupation: "",
      incomeRange: "",
      sourceOfFunds: "",
    },
  });

  const applyProfileToForm = (profile: Partial<SavedProfileView>) => {
    const next: SavedProfileView = {
      surname: profile.surname || "",
      firstName: profile.firstName || "",
      middleName: profile.middleName || "",
      fullName: profile.fullName || session?.user?.name || "",
      phone: profile.phone || "",
      email: profile.email || session?.user?.email || "",
      dateOfBirth: profile.dateOfBirth || "",
      gender: (profile.gender || "M") as "M" | "F" | "other",
      stateOfOrigin: profile.stateOfOrigin || "",
      lga: profile.lga || "",
      address: profile.address || "",
      nin: profile.nin || "",
      idType: (profile.idType || "nin") as
        | "nin"
        | "bvn"
        | "passport"
        | "drivers-license"
        | "voters-card",
      idNumber: profile.idNumber || "",
      occupation: profile.occupation || "",
      incomeRange: profile.incomeRange || "",
      sourceOfFunds: profile.sourceOfFunds || "",
      bvn: profile.bvn || "",
    };

    if (profile.bvn) setBvn(profile.bvn);
    reset(next);
    setSavedProfile(next);
  };

  useEffect(() => {
    reset({
      surname: "",
      firstName: "",
      middleName: "",
      fullName: session?.user?.name || "",
      phone: "",
      email: session?.user?.email || "",
      dateOfBirth: "",
      gender: "M",
      stateOfOrigin: "",
      lga: "",
      address: "",
      nin: "",
      idType: "nin",
      idNumber: "",
      occupation: "",
      incomeRange: "",
      sourceOfFunds: "",
    });
  }, [reset, session?.user?.email, session?.user?.name]);

  useEffect(() => {
    const loadProfileSettings = async () => {
      if (!session?.user?.email) return;
      setIsLoadingProfile(true);
      try {
        const res = await fetch("/api/settings/profile", {
          method: "GET",
          cache: "no-store",
        });
        const payload = await res.json();
        if (!res.ok) {
          throw new Error(payload.error || "Failed to load profile settings");
        }

        if (payload?.profile) {
          applyProfileToForm(payload.profile);
        }
      } catch (error: any) {
        setSaveError(error.message || "Failed to load profile settings.");
      } finally {
        setIsLoadingProfile(false);
      }
    };

    loadProfileSettings();
  }, [reset, session?.user?.email, session?.user?.name]);

  useEffect(() => {
    const loadPreferences = async () => {
      if (!session?.user?.email) { setPrefsLoading(false); return; }
      try {
        const res = await fetch("/api/settings/preferences", {
          method: "GET",
          cache: "no-store",
        });
        const payload = await res.json();
        if (res.ok && payload?.preferences) {
          const p = payload.preferences;
          setPrivacyMode(p.privacyMode ?? false);
          setBiometric(p.biometric ?? false);
          setLoginAlerts(p.loginAlerts ?? true);
          setTwoFaEnabled(p.twoFaEnabled ?? false);
          setPushNotifications(p.pushNotifications ?? true);
          setBudgetAlerts(p.budgetAlerts ?? true);
          setSavingsReminders(p.savingsReminders ?? true);
          setInvestmentUpdates(p.investmentUpdates ?? true);
          setPromoTips(p.promoTips ?? true);
        }
      } catch {}
      setPrefsLoading(false);
    };
    loadPreferences();
  }, [session?.user?.email]);

  const savePreference = async (key: string, value: boolean) => {
    setPrefsSaving(key);
    try {
      await fetch("/api/settings/preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [key]: value }),
      });
    } catch {}
    setPrefsSaving(null);
  };

  const togglePref = (key: string, setter: (v: boolean) => void, current: boolean) => {
    const next = !current;
    setter(next);
    savePreference(key, next);
  };

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

    const resolvedFullName = [data.surname, data.firstName, data.middleName]
      .map((value) => String(value || "").trim())
      .filter(Boolean)
      .join(" ");

    if (!data.surname.trim() || !data.firstName.trim()) {
      setSaveError("Surname and first name are required.");
      return;
    }

    if (!data.dateOfBirth) {
      setSaveError("Date of birth is required.");
      return;
    }

    setIsSavingProfile(true);
    try {
      const res = await fetch("/api/settings/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          fullName: resolvedFullName,
        }),
      });
      const payload = await res.json();

      if (!res.ok) {
        throw new Error(payload.error || "Failed to save settings");
      }

      if (payload?.profile) {
        applyProfileToForm(payload.profile);
      }

      setSaveSuccess("Settings saved successfully.");
    } catch (error: any) {
      setSaveError(error.message || "Failed to save settings.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const runAction = async (key: string, fn: () => Promise<void>) => {
    setActionLoading(key);
    setSaveError(null);
    setSaveSuccess(null);
    try {
      await fn();
    } catch (error: any) {
      setSaveError(error?.message || "Action failed.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleUploadMissingDocs = () =>
    runAction("upload-docs", async () => {
      const selfieUrl = window.prompt("Enter selfie image URL (or leave blank)", "") || "";
      const idDocUrl = window.prompt("Enter ID document URL (or leave blank)", "") || "";

      const res = await fetch("/api/settings/kyc-documents", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selfieUrl, idDocUrl }),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || "Failed to upload documents.");

      setSaveSuccess(payload.message || "KYC documents updated successfully.");
    });

  const handleChangePassword = () =>
    runAction("change-password", async () => {
      const currentPassword = window.prompt("Enter current password") || "";
      const newPassword = window.prompt("Enter new password (min 8 chars)") || "";
      const confirmPassword = window.prompt("Confirm new password") || "";

      if (!currentPassword || !newPassword) {
        throw new Error("Current and new password are required.");
      }
      if (newPassword !== confirmPassword) {
        throw new Error("Passwords do not match.");
      }

      const res = await fetch("/api/settings/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || "Failed to change password.");

      setSaveSuccess(payload.message || "Password changed successfully.");
    });

  const handleChangePin = () =>
    runAction("change-pin", async () => {
      const currentPin = window.prompt("Enter current PIN") || "";
      const newPin = window.prompt("Enter new PIN (4-6 digits)") || "";
      const confirmPin = window.prompt("Confirm new PIN") || "";

      if (!currentPin || !newPin) {
        throw new Error("Current and new PIN are required.");
      }
      if (newPin !== confirmPin) {
        throw new Error("PINs do not match.");
      }

      const res = await fetch("/api/settings/pin", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPin, newPin }),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || "Failed to change PIN.");

      setSaveSuccess(payload.message || "PIN changed successfully.");
    });

  const handleDownloadData = () =>
    runAction("download-data", async () => {
      const res = await fetch("/api/settings/export-data", { method: "GET", cache: "no-store" });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || "Failed to export data.");

      const blob = new Blob([JSON.stringify(payload, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `rilstack-data-export-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);

      setSaveSuccess("Data export downloaded.");
    });

  const handleDeleteAccount = () =>
    runAction("delete-account", async () => {
      const confirmation = window.prompt('Type DELETE to confirm account deletion') || "";
      const password = window.prompt("Enter your password to confirm") || "";

      const res = await fetch("/api/settings/account", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmation, password }),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || "Failed to delete account.");

      await signOut({ callbackUrl: "/signup" });
    });

  const handleLinkedAccounts = () =>
    runAction("linked-accounts", async () => {
      const res = await fetch("/api/settings/linked-accounts", {
        method: "GET",
        cache: "no-store",
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || "Failed to fetch linked accounts.");

      const linked = payload.linkedAccounts || {};
      const status = [
        `Credentials: ${linked.credentials ? "Linked" : "Not linked"}`,
        `Google: ${linked.google ? "Linked" : "Not linked"}`,
      ].join("\n");
      window.alert(status);
      setSaveSuccess("Linked accounts loaded.");
    });

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
              <label className="mb-1 block text-xs font-semibold text-slate-700">Surname</label>
              <input type="text" {...register("surname", { required: true })} disabled={isLoadingProfile || isSavingProfile} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-500 disabled:cursor-not-allowed disabled:bg-slate-100" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">First Name</label>
              <input type="text" {...register("firstName", { required: true })} disabled={isLoadingProfile || isSavingProfile} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-500 disabled:cursor-not-allowed disabled:bg-slate-100" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">Middle Name(s)</label>
              <input type="text" {...register("middleName")} disabled={isLoadingProfile || isSavingProfile} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-500 disabled:cursor-not-allowed disabled:bg-slate-100" />
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
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">LGA</label>
              <input type="text" {...register("lga", { required: true })} disabled={isLoadingProfile || isSavingProfile} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-500 disabled:cursor-not-allowed disabled:bg-slate-100" />
            </div>
            <div className="md:col-span-2">
              <label className="mb-1 block text-xs font-semibold text-slate-700">Residential Address</label>
              <input type="text" {...register("address", { required: true })} disabled={isLoadingProfile || isSavingProfile} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-500 disabled:cursor-not-allowed disabled:bg-slate-100" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">NIN</label>
              <input type="text" {...register("nin", { required: true })} disabled={isLoadingProfile || isSavingProfile} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-500 disabled:cursor-not-allowed disabled:bg-slate-100" />
            </div>
            {bvn && (
              <div className="md:col-span-2">
                <label className="mb-1 block text-xs font-semibold text-slate-700">BVN</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={bvn.replace(/.(?=.{4})/g, "*")}
                    readOnly
                    className="w-full rounded-xl border border-slate-200 bg-slate-100 px-3 py-2 text-sm text-slate-600 cursor-not-allowed select-none"
                  />
                  <span className="shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">Verified</span>
                </div>
                <p className="mt-1 text-xs text-slate-400">Your BVN is stored securely and used to set up your virtual account. It cannot be changed here.</p>
              </div>
            )}
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
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">Occupation</label>
              <input type="text" {...register("occupation", { required: true })} disabled={isLoadingProfile || isSavingProfile} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-500 disabled:cursor-not-allowed disabled:bg-slate-100" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-700">Income Range</label>
              <input type="text" {...register("incomeRange", { required: true })} disabled={isLoadingProfile || isSavingProfile} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-500 disabled:cursor-not-allowed disabled:bg-slate-100" />
            </div>
            <div className="md:col-span-2">
              <label className="mb-1 block text-xs font-semibold text-slate-700">Source of Funds</label>
              <input type="text" {...register("sourceOfFunds", { required: true })} disabled={isLoadingProfile || isSavingProfile} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-500 disabled:cursor-not-allowed disabled:bg-slate-100" />
            </div>
            <div className="mt-1 flex items-center gap-2 md:col-span-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#2E7D32] text-white text-xs font-semibold">✔️ Verified</span>
              <button
                type="button"
                className="text-xs text-[#F4A261] underline ml-2 disabled:opacity-60"
                disabled={actionLoading === "upload-docs"}
                onClick={handleUploadMissingDocs}
              >
                {actionLoading === "upload-docs" ? "Uploading..." : "Upload missing docs"}
              </button>
            </div>
            <div className="mt-1 flex gap-2 md:col-span-2">
              <button
                type="button"
                className="text-xs text-[#1A5F7A] underline disabled:opacity-60"
                disabled={actionLoading === "change-password"}
                onClick={handleChangePassword}
              >
                {actionLoading === "change-password" ? "Changing..." : "Change Password"}
              </button>
              <button
                type="button"
                className="text-xs text-[#1A5F7A] underline disabled:opacity-60"
                disabled={actionLoading === "change-pin"}
                onClick={handleChangePin}
              >
                {actionLoading === "change-pin" ? "Changing..." : "Change PIN"}
              </button>
            </div>
            {saveError && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{saveError}</div>
            )}
            {saveSuccess && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{saveSuccess}</div>
            )}
            {savedProfile && (
              <div className="rounded-xl border border-[#d8e2ef] bg-[#f8fafc] px-4 py-3 text-xs text-slate-700">
                <p className="font-semibold text-slate-900">Saved</p>
                <p className="mt-1">Surname: {savedProfile.surname || "-"}</p>
                <p>First Name: {savedProfile.firstName || "-"}</p>
                <p>Middle Name(s): {savedProfile.middleName || "-"}</p>
                <p>Name: {savedProfile.fullName || "-"}</p>
                <p>Phone: {savedProfile.phone || "-"}</p>
                <p>DOB: {savedProfile.dateOfBirth || "-"}</p>
                <p>LGA: {savedProfile.lga || "-"}</p>
                <p>NIN: {savedProfile.nin ? savedProfile.nin.replace(/.(?=.{4})/g, "*") : "-"}</p>
                <p>ID: {savedProfile.idType?.toUpperCase() || "-"} {savedProfile.idNumber || ""}</p>
                <p>Occupation: {savedProfile.occupation || "-"}</p>
                <p>Income Range: {savedProfile.incomeRange || "-"}</p>
                <p>Source of Funds: {savedProfile.sourceOfFunds || "-"}</p>
                <p>Address: {savedProfile.address || "-"}</p>
                {savedProfile.bvn && <p>BVN: {savedProfile.bvn.replace(/.(?=.{4})/g, "*")}</p>}
              </div>
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
            <div>
              <span className="text-sm font-medium text-slate-800">Biometric Login</span>
              <p className="text-xs text-slate-500">Use fingerprint or face ID on supported devices</p>
            </div>
            <input
              type="checkbox"
              checked={biometric}
              onChange={() => togglePref("biometric", setBiometric, biometric)}
              disabled={prefsLoading || prefsSaving === "biometric"}
              className="h-4 w-4 accent-[#1A5F7A] cursor-pointer"
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium text-slate-800">Privacy Mode</span>
              <p className="text-xs text-slate-500">Hide balances and sensitive info by default</p>
            </div>
            <input
              type="checkbox"
              checked={privacyMode}
              onChange={() => togglePref("privacyMode", setPrivacyMode, privacyMode)}
              disabled={prefsLoading || prefsSaving === "privacyMode"}
              className="h-4 w-4 accent-[#1A5F7A] cursor-pointer"
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium text-slate-800">Login Alerts</span>
              <p className="text-xs text-slate-500">Get notified on new sign-ins to your account</p>
            </div>
            <input
              type="checkbox"
              checked={loginAlerts}
              onChange={() => togglePref("loginAlerts", setLoginAlerts, loginAlerts)}
              disabled={prefsLoading || prefsSaving === "loginAlerts"}
              className="h-4 w-4 accent-[#1A5F7A] cursor-pointer"
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium text-slate-800">Two-Factor Authentication (2FA)</span>
              <p className="text-xs text-slate-500">Require a code at each login for extra security</p>
            </div>
            <input
              type="checkbox"
              checked={twoFaEnabled}
              onChange={() => togglePref("twoFaEnabled", setTwoFaEnabled, twoFaEnabled)}
              disabled={prefsLoading || prefsSaving === "twoFaEnabled"}
              className="h-4 w-4 accent-[#1A5F7A] cursor-pointer"
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-800">Session Management</span>
            <a href="/security" className="text-xs text-[#1A5F7A] underline">View Devices</a>
          </div>
        </div>
        {prefsSaving && (
          <p className="mt-2 text-xs text-slate-500">Saving...</p>
        )}
      </section>

      {/* 4.1.3 Notifications */}
      <section className="rounded-[20px] border border-slate-200 bg-white p-4 shadow-sm md:p-5">
        <h3 className="mb-2 text-base font-bold text-slate-900 md:text-lg">Notifications</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium text-slate-800">Push Notifications</span>
              <p className="text-xs text-slate-500">Master switch for all notifications</p>
            </div>
            <input
              type="checkbox"
              checked={pushNotifications}
              onChange={() => togglePref("pushNotifications", setPushNotifications, pushNotifications)}
              disabled={prefsLoading || prefsSaving === "pushNotifications"}
              className="h-4 w-4 accent-[#1A5F7A] cursor-pointer"
            />
          </div>
          <div className="pl-4 space-y-2 border-l-2 border-slate-100">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-700">Budget Alerts</span>
              <input
                type="checkbox"
                checked={budgetAlerts}
                onChange={() => togglePref("budgetAlerts", setBudgetAlerts, budgetAlerts)}
                disabled={prefsLoading || !pushNotifications || prefsSaving === "budgetAlerts"}
                className="h-4 w-4 accent-[#1A5F7A] cursor-pointer"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-700">Savings Reminders</span>
              <input
                type="checkbox"
                checked={savingsReminders}
                onChange={() => togglePref("savingsReminders", setSavingsReminders, savingsReminders)}
                disabled={prefsLoading || !pushNotifications || prefsSaving === "savingsReminders"}
                className="h-4 w-4 accent-[#1A5F7A] cursor-pointer"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-700">Investment Updates</span>
              <input
                type="checkbox"
                checked={investmentUpdates}
                onChange={() => togglePref("investmentUpdates", setInvestmentUpdates, investmentUpdates)}
                disabled={prefsLoading || !pushNotifications || prefsSaving === "investmentUpdates"}
                className="h-4 w-4 accent-[#1A5F7A] cursor-pointer"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-700">Promotions & Tips</span>
              <input
                type="checkbox"
                checked={promoTips}
                onChange={() => togglePref("promoTips", setPromoTips, promoTips)}
                disabled={prefsLoading || !pushNotifications || prefsSaving === "promoTips"}
                className="h-4 w-4 accent-[#1A5F7A] cursor-pointer"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#D32F2F]">Fraud Alerts</span>
              <input type="checkbox" checked readOnly className="h-4 w-4 accent-[#D32F2F]" title="Always on — cannot be disabled" />
            </div>
          </div>
        </div>
        {prefsSaving && (
          <p className="mt-2 text-xs text-slate-500">Saving...</p>
        )}
      </section>

      {/* 4.1.5 Data & Privacy */}
      <section className="rounded-[20px] border border-slate-200 bg-white p-4 shadow-sm md:p-5">
        <h3 className="mb-2 text-base font-bold text-slate-900 md:text-lg">Data & Privacy</h3>
        <div className="space-y-3">
          <button type="button" className="text-xs text-[#1A5F7A] underline disabled:opacity-60" disabled={actionLoading === "download-data"} onClick={handleDownloadData}>
            {actionLoading === "download-data" ? "Preparing export..." : "Download My Data"}
          </button>
          <button type="button" className="text-xs text-[#D32F2F] underline disabled:opacity-60" disabled={actionLoading === "delete-account"} onClick={handleDeleteAccount}>
            {actionLoading === "delete-account" ? "Deleting account..." : "Delete Account"}
          </button>
          <button type="button" className="text-xs text-[#1A5F7A] underline disabled:opacity-60" disabled={actionLoading === "linked-accounts"} onClick={handleLinkedAccounts}>
            {actionLoading === "linked-accounts" ? "Loading linked accounts..." : "Manage Linked Accounts"}
          </button>
        </div>
      </section>

      {/* 4.1.6 Support & About */}
      <section className="rounded-[20px] border border-slate-200 bg-white p-4 shadow-sm md:p-5">
        <h3 className="mb-2 text-base font-bold text-slate-900 md:text-lg">Support & About</h3>
        <div className="space-y-3">
          <a className="text-xs text-[#1A5F7A] underline" href="/about">Help Center</a>
          <a className="text-xs text-[#1A5F7A] underline" href="/contact-support">Contact Support</a>
          <a className="text-xs text-[#1A5F7A] underline" href="/report-fraud">Report a Problem</a>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs font-medium text-slate-700">rilstack v1.0.0</span>
            <a className="text-xs text-[#1A5F7A] underline" href="/terms">Open Source Licenses</a>
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
