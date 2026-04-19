"use client";

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 px-6 text-center">
      <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#2c3e5f] text-3xl font-extrabold text-white shadow-lg">
        R
      </div>
      <h1 className="text-2xl font-bold text-slate-900">You&apos;re Offline</h1>
      <p className="mt-3 max-w-sm text-slate-500">
        It looks like you&apos;ve lost your internet connection. Please check
        your network and try again.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="mt-8 rounded-2xl bg-[#2c3e5f] px-8 py-3 text-sm font-semibold text-white shadow-md transition-all hover:opacity-90"
      >
        Try Again
      </button>
    </div>
  );
}
