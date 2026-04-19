import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import Image from 'next/image';
import ReviewsWidget from './ReviewsWidget';

// Withdrawal Bank Section
function WithdrawalBankSection() {
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("rilstack_bank");
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setBankName(data.bankName || "");
        setAccountNumber(data.accountNumber || "");
        setAccountName(data.accountName || "");
      } catch {}
    }
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bankName.trim() || !accountNumber.trim() || !accountName.trim()) {
      setError("All fields are required.");
      return;
    }
    localStorage.setItem("rilstack_bank", JSON.stringify({ bankName, accountNumber, accountName }));
    setSuccess("Bank details updated.");
    setError("");
    setTimeout(() => setSuccess(""), 2000);
  };

  return (
    <form onSubmit={handleSave} className="space-y-3">
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1">Bank Name</label>
        <input
          className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500"
          value={bankName}
          onChange={e => setBankName(e.target.value)}
          placeholder="e.g. Access Bank"
        />
      </div>
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1">Account Number</label>
        <input
          className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500"
          value={accountNumber}
          onChange={e => setAccountNumber(e.target.value.replace(/[^0-9]/g, ""))}
          maxLength={10}
          placeholder="e.g. 0123456789"
        />
      </div>
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1">Account Name</label>
        <input
          className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500"
          value={accountName}
          onChange={e => setAccountName(e.target.value)}
          placeholder="e.g. John Doe"
        />
      </div>
      {error && <div className="text-red-600 text-xs">{error}</div>}
      {success && <div className="text-green-600 text-xs">{success}</div>}
      <button
        type="submit"
        className="rounded-xl bg-[#2c3e5f] px-5 py-3 text-sm font-semibold text-white hover:bg-[#1e2d46]"
      >Save Bank Details</button>
    </form>
  );
}

interface SettingsFormData {
  fullName: string;
  phone: string;
  email: string;
  dateOfBirth: string;
  gender: 'M' | 'F' | 'other';
  stateOfOrigin: string;
  address: string;
  idType: 'nin' | 'bvn' | 'passport' | 'drivers-license' | 'voters-card';
  idNumber: string;
}

export default function SettingsSection() {
  const { data: session } = useSession();
  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const { register, handleSubmit, reset } = useForm<SettingsFormData>({
    defaultValues: {
      fullName: session?.user?.name || '',
      phone: '',
      email: session?.user?.email || '',
      dateOfBirth: '',
      gender: 'M',
      stateOfOrigin: '',
      address: '',
      idType: 'nin',
      idNumber: '',
    },
  });

  useEffect(() => {
    reset({
      fullName: session?.user?.name || '',
      phone: '',
      email: session?.user?.email || '',
      dateOfBirth: '',
      gender: 'M',
      stateOfOrigin: '',
      address: '',
      idType: 'nin',
      idNumber: '',
    });
  }, [reset, session?.user?.email, session?.user?.name]);

  const onProfilePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (profilePhotoUrl) {
      URL.revokeObjectURL(profilePhotoUrl);
    }
    import PrivacyToggle from './PrivacyToggle';
    setProfilePhotoUrl(URL.createObjectURL(file));
    setSaveSuccess('Profile photo updated. Remember to save your settings.');
  };

  const onSubmit = (data: SettingsFormData) => {
    setSaveError(null);
    if (!data.dateOfBirth) {
      setSaveError('Date of birth is required.');
      return;
    }
    setSaveSuccess('Settings saved successfully.');
  };

  return (
    <div className="space-y-6">
      <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
        <h3 className="text-lg font-bold text-slate-900 md:text-xl">Profile Photo</h3>
        <div className="mt-4 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-100">
            {profilePhotoUrl ? (
              <Image
                src={profilePhotoUrl}
                alt="Profile preview"
                width={96}
                height={96}
                unoptimized
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-xs font-semibold text-slate-500">No Photo</span>
            )}
          </div>
          <label className="cursor-pointer rounded-xl bg-[#2c3e5f] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1e2d46]">
            {profilePhotoUrl ? 'Change Photo' : 'Add Photo'}
            <input type="file" accept="image/*" onChange={onProfilePhotoChange} className="hidden" />
          </label>
        </div>
      </section>

      <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
        <h3 className="text-lg font-bold text-slate-900 md:text-xl">Profile and KYC</h3>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Full Name</label>
              <input
                type="text"
                {...register('fullName', { required: true })}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Email</label>
              <input
                type="email"
                {...register('email', { required: true })}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Phone Number</label>
              <input
                type="tel"
                {...register('phone', { required: true })}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Date of Birth</label>
              <input
                type="date"
                {...register('dateOfBirth', { required: true })}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Gender</label>
              <select
                {...register('gender', { required: true })}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500"
              >
                <option value="M">Male</option>
                <option value="F">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">State of Origin</label>
              <input
                type="text"
                {...register('stateOfOrigin', { required: true })}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-slate-700">Residential Address</label>
              <input
                type="text"
                {...register('address', { required: true })}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">KYC ID Type</label>
              <select
                {...register('idType', { required: true })}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500"
              >
                <option value="nin">NIN</option>
                <option value="bvn">BVN</option>
                <option value="passport">International Passport</option>
                <option value="drivers-license">Driver&apos;s License</option>
                <option value="voters-card">Voter&apos;s Card</option>
              </select>
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">ID Number</label>
              <input
                type="text"
                {...register('idNumber', { required: true })}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {saveError && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{saveError}</div>}
          {saveSuccess && <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{saveSuccess}</div>}

          <button
            type="submit"
            className="rounded-xl bg-[#2c3e5f] px-5 py-3 text-sm font-semibold text-white hover:bg-[#1e2d46]"
          >
            Save Settings
          </button>
        </form>
      </section>




      <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
        <h3 className="text-lg font-bold text-slate-900 md:text-xl mb-2">Withdrawal Bank</h3>
        <a
          href="/settings/bank"
          className="block w-full rounded-xl bg-[#2c3e5f] px-5 py-3 text-sm font-semibold text-white text-center hover:bg-[#1e2d46] transition"
        >
          Change Withdrawal Bank
        </a>
      </section>



      <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
        <h3 className="text-lg font-bold text-slate-900 md:text-xl">Write a Review</h3>
        <p className="mt-2 text-sm text-slate-600">Share your experience with Rilstack. Your feedback helps us improve!</p>
        <div className="mt-4">
          {/* ReviewsWidget allows users to write and view reviews */}
          <ReviewsWidget />
        </div>
      </section>



      <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
        <h3 className="text-lg font-bold text-slate-900 md:text-xl">Support</h3>
        <p className="mt-2 text-sm text-slate-600">Need help with your account or KYC setup? Reach us directly.</p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <a
            href="tel:08116883025"
            className="rounded-xl bg-[#2c3e5f] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1e2d46]"
          >
            Contact Us
          </a>
          <span className="text-sm font-medium text-slate-700">08116883025</span>
        </div>
      </section>
    </div>
  );
}
