'use client';

import React, { useMemo, useState } from 'react';
import { signIn } from 'next-auth/react';
import { useForm } from 'react-hook-form';

interface AuthModalProps {
  mode: 'login' | 'signup';
  onClose: () => void;
}

interface LoginFormData {
  email: string;
  password: string;
}

interface SignupFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  dateOfBirth: string;
  nin: string;
  bvn?: string;
  stateOfOrigin?: string;
  address?: string;
  gender?: 'M' | 'F' | 'other';
}

export default function AuthModal({ mode, onClose }: AuthModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const isSignup = mode === 'signup';
  const title = useMemo(() => (isSignup ? 'Create Account' : 'Login'), [isSignup]);

  const loginForm = useForm<LoginFormData>({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const signupForm = useForm<SignupFormData>({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      phone: '',
      dateOfBirth: '',
      nin: '',
      bvn: '',
      stateOfOrigin: '',
      address: '',
      gender: 'M',
    },
  });

  const submitLogin = async (data: LoginFormData) => {
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    try {
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (!result || result.error) {
        throw new Error('Invalid email or password.');
      }

      setSuccess('Login successful. Redirecting...');
      window.location.href = '/';
    } catch (submitError: any) {
      setError(submitError.message || 'Unable to login.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitSignup = async (data: SignupFormData) => {
    setError(null);
    setSuccess(null);

    if (data.password !== data.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);

    try {
      const registerResponse = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
          phone: data.phone,
          dateOfBirth: data.dateOfBirth,
          nin: data.nin,
          bvn: data.bvn,
          stateOfOrigin: data.stateOfOrigin,
          address: data.address,
          gender: data.gender,
        }),
      });
      const registerResult = await registerResponse.json();

      if (!registerResponse.ok || !registerResult.success) {
        throw new Error(registerResult.error || 'Failed to create account.');
      }

      const authResult = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (!authResult || authResult.error) {
        throw new Error('Account created but login failed. Please login manually.');
      }

      setSuccess('Account created and logged in successfully.');
      window.location.href = '/';
    } catch (submitError: any) {
      setError(submitError.message || 'Unable to create account.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-h-[92vh] max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between rounded-t-3xl bg-slate-900 p-5 text-white">
          <h3 className="text-lg font-bold md:text-xl">{title}</h3>
          <button onClick={onClose} className="rounded px-2 text-xl font-bold hover:bg-slate-800">
            x
          </button>
        </div>

        <div className="p-5 md:p-6">
          <div className="mb-4 rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
            {isSignup
              ? 'Sign up with your KYC details to create a full account profile.'
              : 'Login with your email and password.'}
          </div>

          {/* Google Sign In Button */}
          <button
            type="button"
            onClick={() => signIn('google', { callbackUrl: '/' })}
            className="mb-4 flex w-full items-center justify-center gap-3 rounded-xl border-2 border-slate-300 bg-white py-3 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-900 hover:bg-slate-50"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </button>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-slate-500">Or continue with</span>
            </div>
          </div>

          {error && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
          {success && (
            <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {success}
            </div>
          )}

          {!isSignup ? (
            <form onSubmit={loginForm.handleSubmit(submitLogin)} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Email</label>
                <input
                  type="email"
                  {...loginForm.register('email', { required: true })}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-900"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Password</label>
                <input
                  type="password"
                  {...loginForm.register('password', { required: true })}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-900"
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-xl bg-slate-900 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-70"
              >
                {isSubmitting ? 'Logging in...' : 'Login'}
              </button>
            </form>
          ) : (
            <form onSubmit={signupForm.handleSubmit(submitSignup)} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Full Name</label>
                  <input
                    type="text"
                    {...signupForm.register('name', { required: true })}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-900"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Email</label>
                  <input
                    type="email"
                    {...signupForm.register('email', { required: true })}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-900"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Password</label>
                  <input
                    type="password"
                    {...signupForm.register('password', { required: true })}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-900"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Confirm Password</label>
                  <input
                    type="password"
                    {...signupForm.register('confirmPassword', { required: true })}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-900"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Phone</label>
                  <input
                    type="tel"
                    {...signupForm.register('phone', { required: true })}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-900"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Date of Birth</label>
                  <input
                    type="date"
                    {...signupForm.register('dateOfBirth', { required: true })}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-900"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">NIN</label>
                  <input
                    type="text"
                    maxLength={11}
                    {...signupForm.register('nin', { required: true })}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm tracking-widest outline-none focus:border-slate-900"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">BVN (Optional)</label>
                  <input
                    type="text"
                    maxLength={11}
                    {...signupForm.register('bvn')}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm tracking-widest outline-none focus:border-slate-900"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Gender</label>
                  <select
                    {...signupForm.register('gender')}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-900"
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
                    {...signupForm.register('stateOfOrigin')}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-900"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Address</label>
                  <input
                    type="text"
                    {...signupForm.register('address')}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-900"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-xl bg-slate-900 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-70"
              >
                {isSubmitting ? 'Creating account...' : 'Create Account'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
