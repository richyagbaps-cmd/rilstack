'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { signOut } from 'next-auth/react';

interface KycStatus {
  kycLevel: number;
  emailVerified: boolean;
  bvnVerified: boolean;
  ninVerified: boolean;
  identityVerified: boolean;
  detailsComplete: boolean;
  phone: string;
  email: string;
  name: string;
  bvn: string;
  nin: string;
}

const NIGERIAN_STATES = [
  'Abia','Adamawa','Akwa Ibom','Anambra','Bauchi','Bayelsa','Benue','Borno',
  'Cross River','Delta','Ebonyi','Edo','Ekiti','Enugu','FCT','Gombe','Imo',
  'Jigawa','Kaduna','Kano','Katsina','Kebbi','Kogi','Kwara','Lagos','Nasarawa',
  'Niger','Ogun','Ondo','Osun','Oyo','Plateau','Rivers','Sokoto','Taraba',
  'Yobe','Zamfara',
];


import { useSession } from 'next-auth/react';

export default function KYCVerification({ onComplete }: { onComplete: () => void }) {
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const { data: session } = useSession();
  const [status, setStatus] = useState<KycStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // OTP
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [resendTimer, setResendTimer] = useState(0);

  // BVN / NIN
  const [bvn, setBvn] = useState('');
  const [nin, setNin] = useState('');

  // Personal details (prefill from session if available)
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('M');
  const [stateOfOrigin, setStateOfOrigin] = useState('');
  const [address, setAddress] = useState('');
  const [prefilled, setPrefilled] = useState(false);

  // Prefill name/email/phone from session (Google)
  useEffect(() => {
    if (!prefilled && session?.user) {
      if (session?.user?.name && !status?.name) setStatus((s) => ({ ...(s || {}), name: session.user?.name } as KycStatus));
      if (session?.user?.email && !status?.email) setStatus((s) => ({ ...(s || {}), email: session.user?.email } as KycStatus));
      if ((session?.user as any)?.phone && !status?.phone) setStatus((s) => ({ ...(s || {}), phone: (session.user as any)?.phone } as KycStatus));
      setPrefilled(true);
    }
  }, [session, prefilled, status]);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/kyc/status');
      const data = await res.json();
      if (data.success) {
        setStatus(data.status);
        // If fully verified, notify parent
        if (data.status.kycLevel >= 5) {
          onComplete();
        }
      }
    } catch {
      setError('Failed to load verification status.');
    } finally {
      setLoading(false);
    }
  }, [onComplete]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  // Resend timer countdown
  useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setTimeout(() => setResendTimer((v) => v - 1), 1000);
    return () => clearTimeout(t);
  }, [resendTimer]);

  const handleVerify = async (step: string, body: Record<string, string>) => {
    if (!agreedToTerms) {
      setError('You must agree to the Terms & Conditions, Privacy Policy, and Security Policy before proceeding.');
      return;
    }
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch('/api/kyc/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ step, ...body }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Verification failed.');
      }

      setSuccess(data.message);
      await fetchStatus();
    } catch (e: any) {
      setError(e.message || 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  };

  const sendOtp = async () => {
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/kyc/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ step: 'send-otp' }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to send code.');
      }

      setOtpSent(true);
      setResendTimer(60);
      setSuccess(data.message);

      // Show fallback OTP when email service isn't configured
      if (data.fallbackOtp) {
        setOtp(data.fallbackOtp);
        setSuccess(`Your verification code is: ${data.fallbackOtp}`);
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F9FC] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-10 w-10 border-4 border-[#2c3e5f] border-t-transparent rounded-full animate-spin" />
          <p className="mt-4 text-[#4A5B6E]">Loading verification...</p>
        </div>
      </div>
    );
  }

  if (!status) {
    return (
      <div className="min-h-screen bg-[#F8F9FC] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Failed to load verification status.</p>
          <button onClick={() => window.location.reload()} className="mt-4 text-[#2c3e5f] font-semibold hover:underline">
            Retry
          </button>
        </div>
      </div>
    );
  }

  const steps = [
    { key: 'email', label: 'Verify Email', done: status.emailVerified },
    { key: 'bvn', label: 'Verify BVN', done: status.bvnVerified },
    { key: 'nin', label: 'Verify NIN', done: status.ninVerified },
    { key: 'identity', label: 'Identity Check', done: status.identityVerified },
    { key: 'details', label: 'Personal Details', done: status.detailsComplete },
  ];

  const currentStep = steps.findIndex((s) => !s.done);
  const completedCount = steps.filter((s) => s.done).length;
  const progressPct = (completedCount / steps.length) * 100;

  return (
    <div className="min-h-screen bg-[#F8F9FC]">
      {/* Header */}
      <div className="sticky top-0 z-50 border-b border-[#E9EDF2] bg-white shadow-sm">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <img src="/images/rilstack-logo.png" alt="Rilstack" className="h-60 md:h-72" />
            <span className="text-sm font-medium text-[#4A5B6E]">Hi, {status.name?.split(' ')[0]}</span>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            Sign out
          </button>
        </div>
      </div>

      <div className="container mx-auto max-w-2xl px-4 py-8">
        {/* Title */}
        <div className="mb-8 text-center">
          <div className="inline-block rounded-full bg-amber-100 px-4 py-1.5 text-sm font-semibold text-amber-800 mb-4">
            Account Verification
          </div>
          <h2 className="text-2xl font-bold text-[#1E2A3A] md:text-3xl">Complete Your KYC</h2>
          <p className="mt-2 text-[#4A5B6E]">
            Verify your identity to unlock all features. You can skip steps and complete them later.
          </p>
          <button
            onClick={onComplete}
            className="mt-4 rounded-[40px] border border-[#b9c2cc] bg-transparent px-6 py-2.5 text-sm font-medium text-[#4A5B6E] hover:border-[#2c3e5f] hover:bg-[#eef1f6] transition-all"
          >
            Skip for now — I&apos;ll verify later
          </button>
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-[#1E2A3A]">{completedCount} of {steps.length} completed</span>
            <span className="text-sm font-semibold text-[#2c3e5f]">{Math.round(progressPct)}%</span>
          </div>
          <div className="h-3 w-full rounded-full bg-[#E9EDF2]">
            <div
              className="h-3 rounded-full bg-[#2c3e5f] transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Step indicators */}
        <div className="mb-8 flex items-center justify-between gap-1">
          {steps.map((s, i) => (
            <div key={s.key} className="flex flex-1 flex-col items-center gap-1.5">
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold transition-colors ${
                  s.done
                    ? 'bg-[#2c3e5f] text-white'
                    : i === currentStep
                    ? 'border-2 border-[#2c3e5f] bg-white text-[#2c3e5f]'
                    : 'border-2 border-[#E9EDF2] bg-white text-[#b9c2cc]'
                }`}
              >
                {s.done ? '✓' : i + 1}
              </div>
              <span className={`text-[10px] font-medium text-center leading-tight ${
                s.done ? 'text-[#2c3e5f]' : i === currentStep ? 'text-[#1E2A3A]' : 'text-[#b9c2cc]'
              }`}>
                {s.label}
              </span>
            </div>
          ))}
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {success}
          </div>
        )}

        {/* Terms Agreement */}
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <input
            type="checkbox"
            id="kyc-agree-terms"
            checked={agreedToTerms}
            onChange={e => setAgreedToTerms(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-slate-300 accent-[#2c3e5f] cursor-pointer"
          />
          <label htmlFor="kyc-agree-terms" className="text-xs text-slate-600 leading-relaxed cursor-pointer">
            I agree to Rilstack&apos;s{' '}
            <a href="/terms" target="_blank" className="text-[#2c3e5f] font-semibold underline">Terms of Service</a>,{' '}
            <a href="/privacy" target="_blank" className="text-[#2c3e5f] font-semibold underline">Privacy Policy</a>, and{' '}
            <a href="/security" target="_blank" className="text-[#2c3e5f] font-semibold underline">Security &amp; Fraud</a>{' '}
            policies. I understand that my data will be processed in accordance with these policies.
          </label>
        </div>

        {/* Current Step Card */}
        <div className="rounded-[28px] border border-[#E9EDF2] bg-white p-6 shadow-sm md:p-8">
          {/* ── Step 1: Email Verification ── */}
          {currentStep === 0 && (
            <div>
              <div className="flex items-center gap-3 mb-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#eef1f6] text-lg">📧</div>
                <div>
                  <h3 className="text-lg font-bold text-[#1E2A3A]">Verify Your Email</h3>
                  <p className="text-sm text-[#4A5B6E]">{status.email}</p>
                </div>
              </div>

              {!otpSent ? (
                <div className="space-y-4">
                  <p className="text-sm text-[#4A5B6E]">
                    We&apos;ll send a 6-digit verification code to your email address.
                  </p>
                  <button
                    onClick={sendOtp}
                    disabled={submitting}
                    className="w-full rounded-xl bg-[#2c3e5f] py-3 text-sm font-semibold text-white hover:bg-[#1e2d46] disabled:opacity-70"
                  >
                    {submitting ? 'Sending...' : 'Send Verification Code'}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-[#4A5B6E]">
                    Enter the 6-digit code sent to <strong>{status.email}</strong>
                  </p>
                  <input
                    type="text"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="000000"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-center text-2xl font-bold tracking-[0.5em] outline-none focus:border-[#2c3e5f]"
                  />
                  <button
                    onClick={() => handleVerify('verify-otp', { otp })}
                    disabled={submitting || otp.length !== 6}
                    className="w-full rounded-xl bg-[#2c3e5f] py-3 text-sm font-semibold text-white hover:bg-[#1e2d46] disabled:opacity-70"
                  >
                    {submitting ? 'Verifying...' : 'Verify Code'}
                  </button>
                  <button
                    onClick={sendOtp}
                    disabled={submitting || resendTimer > 0}
                    className="w-full rounded-xl border border-slate-300 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                  >
                    {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend Code'}
                  </button>
                </div>
              )}
              <button
                onClick={() => handleVerify('skip-email', {})}
                disabled={submitting}
                className="mt-3 w-full rounded-xl py-2.5 text-sm font-medium text-[#4A5B6E] hover:text-[#2c3e5f] hover:underline"
              >
                Skip — I&apos;ll verify my email later
              </button>
            </div>
          )}

          {/* ── Step 2: BVN Verification ── */}
          {currentStep === 1 && (
            <div>
              <div className="flex items-center gap-3 mb-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#eef1f6] text-lg">🏦</div>
                <div>
                  <h3 className="text-lg font-bold text-[#1E2A3A]">Verify Your BVN</h3>
                  <p className="text-sm text-[#4A5B6E]">Bank Verification Number</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="rounded-xl border border-blue-100 bg-blue-50 p-3 text-xs text-blue-800">
                  Your BVN is an 11-digit number linked to your bank accounts. It is required by CBN for all financial services in Nigeria. We only verify it — we cannot access your bank account.
                </div>
                <input
                  type="text"
                  maxLength={11}
                  value={bvn}
                  onChange={(e) => setBvn(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter your 11-digit BVN"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm tracking-widest outline-none focus:border-[#2c3e5f]"
                />
                <button
                  onClick={() => handleVerify('verify-bvn', { bvn })}
                  disabled={submitting || bvn.length !== 11}
                  className="w-full rounded-xl bg-[#2c3e5f] py-3 text-sm font-semibold text-white hover:bg-[#1e2d46] disabled:opacity-70"
                >
                  {submitting ? 'Verifying...' : 'Verify BVN'}
                </button>
                <button
                  onClick={() => handleVerify('skip-bvn', {})}
                  disabled={submitting}
                  className="w-full rounded-xl py-2.5 text-sm font-medium text-[#4A5B6E] hover:text-[#2c3e5f] hover:underline"
                >
                  Skip — I&apos;ll verify my BVN later
                </button>
              </div>
            </div>
          )}

          {/* ── Step 3: NIN Verification ── */}
          {currentStep === 2 && (
            <div>
              <div className="flex items-center gap-3 mb-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#eef1f6] text-lg">🪪</div>
                <div>
                  <h3 className="text-lg font-bold text-[#1E2A3A]">Verify Your NIN</h3>
                  <p className="text-sm text-[#4A5B6E]">National Identification Number</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="rounded-xl border border-blue-100 bg-blue-50 p-3 text-xs text-blue-800">
                  Your NIN is an 11-digit number on your National ID card or NIN slip. It verifies your identity as a Nigerian citizen or resident.
                </div>
                <input
                  type="text"
                  maxLength={11}
                  value={nin}
                  onChange={(e) => setNin(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter your 11-digit NIN"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm tracking-widest outline-none focus:border-[#2c3e5f]"
                />
                <button
                  onClick={() => handleVerify('verify-nin', { nin })}
                  disabled={submitting || nin.length !== 11}
                  className="w-full rounded-xl bg-[#2c3e5f] py-3 text-sm font-semibold text-white hover:bg-[#1e2d46] disabled:opacity-70"
                >
                  {submitting ? 'Verifying...' : 'Verify NIN'}
                </button>
                <button
                  onClick={() => handleVerify('skip-nin', {})}
                  disabled={submitting}
                  className="w-full rounded-xl py-2.5 text-sm font-medium text-[#4A5B6E] hover:text-[#2c3e5f] hover:underline"
                >
                  Skip — I&apos;ll verify my NIN later
                </button>
              </div>
            </div>
          )}

          {/* ── Step 4: Identity Check (Selfie / Dojah) ── */}
          {currentStep === 3 && (
            <div>
              <div className="flex items-center gap-3 mb-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#eef1f6] text-lg">📸</div>
                <div>
                  <h3 className="text-lg font-bold text-[#1E2A3A]">Identity Verification</h3>
                  <p className="text-sm text-[#4A5B6E]">Confirm your identity matches your documents</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-center">
                  <div className="text-4xl mb-3">🔐</div>
                  <p className="text-sm font-semibold text-emerald-800">Selfie Verification</p>
                  <p className="text-xs text-emerald-700 mt-1">
                    We&apos;ll match your face against your BVN/NIN records to confirm your identity.
                  </p>
                </div>
                <button
                  onClick={() => handleVerify('verify-identity', {})}
                  disabled={submitting}
                  className="w-full rounded-xl bg-[#2c3e5f] py-3 text-sm font-semibold text-white hover:bg-[#1e2d46] disabled:opacity-70"
                >
                  {submitting ? 'Verifying...' : 'Complete Identity Check'}
                </button>
                <p className="text-xs text-center text-[#4A5B6E]">
                  By proceeding, you consent to biometric verification in accordance with NDPR guidelines.
                </p>
                <button
                  onClick={() => handleVerify('skip-identity', {})}
                  disabled={submitting}
                  className="w-full rounded-xl py-2.5 text-sm font-medium text-[#4A5B6E] hover:text-[#2c3e5f] hover:underline"
                >
                  Skip — I&apos;ll verify my identity later
                </button>
              </div>
            </div>
          )}

          {/* ── Step 5: Personal Details ── */}
          {currentStep === 4 && (
            <div>
              <div className="flex items-center gap-3 mb-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#eef1f6] text-lg">📝</div>
                <div>
                  <h3 className="text-lg font-bold text-[#1E2A3A]">Personal Details</h3>
                  <p className="text-sm text-[#4A5B6E]">Complete your profile information</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-slate-700">Date of Birth</label>
                    <input
                      type="date"
                      value={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-[#2c3e5f]"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-slate-700">Gender</label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-[#2c3e5f]"
                    >
                      <option value="M">Male</option>
                      <option value="F">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-slate-700">State of Origin</label>
                    <select
                      value={stateOfOrigin}
                      onChange={(e) => setStateOfOrigin(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-[#2c3e5f]"
                    >
                      <option value="">Select state</option>
                      {NIGERIAN_STATES.map((state) => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-slate-700">Residential Address</label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="e.g. 10 Broad St, Lagos"
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-[#2c3e5f]"
                    />
                  </div>
                </div>
                <button
                  onClick={() => handleVerify('complete-details', { dateOfBirth, gender, stateOfOrigin, address })}
                  disabled={submitting || !dateOfBirth || !stateOfOrigin || !address}
                  className="w-full rounded-xl bg-[#2c3e5f] py-3 text-sm font-semibold text-white hover:bg-[#1e2d46] disabled:opacity-70"
                >
                  {submitting ? 'Saving...' : 'Complete Verification'}
                </button>
              </div>
            </div>
          )}

          {/* All done */}
          {currentStep === -1 && (
            <div className="text-center py-6">
              <div className="text-5xl mb-4">🎉</div>
              <h3 className="text-xl font-bold text-[#1E2A3A]">Verification Complete!</h3>
              <p className="text-sm text-[#4A5B6E] mt-2">Your account is fully verified. Redirecting...</p>
            </div>
          )}
        </div>

        {/* Security notice */}
        <div className="mt-6 rounded-xl border border-[#E9EDF2] bg-white p-4 text-center">
          <p className="text-xs text-[#4A5B6E]">
            🔐 Your data is encrypted with 256-bit SSL and stored securely.
            We comply with CBN, NDPR, and NDPA regulations.
          </p>
        </div>
      </div>
    </div>
  );
}
