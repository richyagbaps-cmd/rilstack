"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const featureCards = [
  {
    title: "AI Budgeting",
    desc: "Strict or relaxed budgets with spending pockets. AI allocates your income using 50/30/20, zero-based, or custom rules.",
    href: "/login",
    badge: "New",
  },
  {
    title: "Daily Interest + Safe Locks",
    desc: "Earn daily interest. Lock money away until a future date - no early access.",
    href: "/signup",
    badge: "Popular",
  },
  {
    title: "Auto-Investments",
    desc: "Admin-managed investment products. Your returns are calculated and paid automatically at maturity.",
    href: "/login",
    badge: "Live",
  },
];

function ArrowRightIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function UserPlusIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <path d="M16 19a5 5 0 0 0-10 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="11" cy="8" r="3" stroke="currentColor" strokeWidth="2" />
      <path d="M19 8v6M16 11h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function CalculatorBrainIcon() {
  return (
    <svg viewBox="0 0 64 64" className="h-12 w-12" fill="none" aria-hidden="true">
      <rect x="10" y="7" width="30" height="50" rx="8" stroke="#1A5F7A" strokeWidth="2.5" />
      <rect x="16" y="13" width="18" height="9" rx="3" fill="#1A5F7A" opacity="0.2" />
      <circle cx="20" cy="31" r="3" fill="#1A5F7A" />
      <circle cx="30" cy="31" r="3" fill="#1A5F7A" />
      <circle cx="20" cy="41" r="3" fill="#1A5F7A" />
      <circle cx="30" cy="41" r="3" fill="#1A5F7A" />
      <path d="M43 24c4-6 14-3 14 5 0 6-5 8-8 8h-6c-4 0-7-2-7-6 0-4 3-7 7-7z" stroke="#1A5F7A" strokeWidth="2.5" />
      <path d="M46 27v7M50 27v7" stroke="#1A5F7A" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function PiggyLockIcon() {
  return (
    <svg viewBox="0 0 64 64" className="h-12 w-12" fill="none" aria-hidden="true">
      <path d="M11 34c0-9 7-16 16-16h10c9 0 16 7 16 16 0 8-5 14-13 16v4H24v-5c-8-2-13-8-13-15z" stroke="#F4A261" strokeWidth="2.5" />
      <circle cx="41" cy="28" r="1.8" fill="#F4A261" />
      <path d="M18 34h7" stroke="#F4A261" strokeWidth="2.5" strokeLinecap="round" />
      <rect x="34" y="36" width="14" height="10" rx="2.5" stroke="#F4A261" strokeWidth="2" />
      <path d="M38 36v-2a3 3 0 1 1 6 0v2" stroke="#F4A261" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function CoinsArrowIcon() {
  return (
    <svg viewBox="0 0 64 64" className="h-12 w-12" fill="none" aria-hidden="true">
      <ellipse cx="22" cy="44" rx="10" ry="4" stroke="#1A5F7A" strokeWidth="2.5" />
      <ellipse cx="22" cy="36" rx="10" ry="4" stroke="#1A5F7A" strokeWidth="2.5" />
      <ellipse cx="22" cy="28" rx="10" ry="4" stroke="#1A5F7A" strokeWidth="2.5" />
      <path d="M35 42l8-8 5 5 8-8" stroke="#1A5F7A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M56 24v7h-7" stroke="#1A5F7A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ClipboardCheckIcon() {
  return (
    <svg viewBox="0 0 64 64" className="h-12 w-12" fill="none" aria-hidden="true">
      <rect x="16" y="10" width="32" height="44" rx="6" stroke="#1A5F7A" strokeWidth="2.5" />
      <rect x="24" y="6" width="16" height="8" rx="3" fill="#1A5F7A" opacity="0.2" stroke="#1A5F7A" strokeWidth="2" />
      <path d="M23 34l6 6 12-12" stroke="#1A5F7A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function StackedLoading() {
  return (
    <div className="stack-loader" aria-hidden="true">
      <span />
      <span />
      <span />
    </div>
  );
}

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/dashboard");
    }
  }, [status, router]);

  if (status === "loading" || status === "authenticated") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gradient-to-b from-[#F8F9FA] to-white">
        <StackedLoading />
        <p className="text-sm font-semibold tracking-wide text-[#1A5F7A]">Loading rilstack...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-gradient-to-b from-[#F8F9FA] to-white text-[#212529]">
      <header className="sticky top-0 z-40 h-14 border-b border-black/5 bg-white/95 shadow-[0_2px_8px_rgba(0,0,0,0.04)] backdrop-blur">
        <div className="mx-auto flex h-full max-w-6xl items-center justify-center px-6">
          <a href="/" className="inline-flex items-center gap-2" aria-label="rilstack home">
            <img src="/icons/rilstack-logo.png" alt="Rilstack" className="logo-intro h-8 w-8 rounded-md object-contain" />
            <span className="text-lg font-bold tracking-[-0.2px] text-[#1A5F7A]">rilstack</span>
          </a>
        </div>
        </header>

      <div className="mx-auto w-full max-w-6xl px-6 pb-16 pt-8 md:px-8">
        <section className="relative rounded-[2rem] bg-white px-0 py-8 md:py-12">
          <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
            <div className="logo-pulse mb-5 inline-flex rounded-2xl bg-[#1A5F7A]/10 p-4">
              <img src="/icons/rilstack-logo.png" alt="Rilstack official logo" className="h-12 w-12 rounded-lg object-contain" />
            </div>
            <h1 className="mb-3 text-[32px] font-extrabold leading-[1.14] tracking-[-0.2px] text-[#1A5F7A] md:text-[42px]">
              Stack Your Finances, One Layer at a Time
            </h1>
            <p className="mb-7 max-w-2xl text-base leading-7 text-[#6C757D] md:text-lg">
              AI budgets, daily interest savings, automated investments - all in one place.
            </p>

            <div className="flex w-full max-w-md flex-wrap justify-center gap-3">
              <a
                href="/login"
                className="inline-flex h-12 min-w-[150px] items-center justify-center gap-2 rounded-full bg-[#1A5F7A] px-6 text-[15px] font-semibold text-white shadow-[0_4px_12px_rgba(0,0,0,0.1),0_1px_2px_rgba(0,0,0,0.05)] transition hover:bg-[#0E4A63] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F4A261] active:scale-[0.98]"
              >
                <span>Login</span>
                <ArrowRightIcon />
              </a>
              <a
                href="/signup"
                className="inline-flex h-12 min-w-[150px] items-center justify-center gap-2 rounded-full border-2 border-[#1A5F7A] bg-white px-6 text-[15px] font-semibold text-[#1A5F7A] transition hover:bg-[rgba(26,95,122,0.05)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F4A261] active:scale-[0.98]"
              >
                <span>Sign Up</span>
                <UserPlusIcon />
              </a>
            </div>
          </div>
        </section>

        <section className="mt-10">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-[22px] font-bold tracking-[-0.2px] text-black">Feature Highlights</h2>
            <div className="flex gap-2" aria-hidden="true">
              <span className="h-2 w-2 rounded-full bg-[#1A5F7A]/30" />
              <span className="h-2 w-2 rounded-full bg-[#1A5F7A]/60" />
              <span className="h-2 w-2 rounded-full bg-[#1A5F7A]" />
            </div>
          </div>

          <div className="feature-scroll flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2">
            {featureCards.map((feature, index) => (
              <a
                key={feature.title}
                href={feature.href}
                className="feature-card min-w-[280px] snap-start rounded-[20px] border border-black/5 bg-white p-5 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05),0_8px_10px_-6px_rgba(0,0,0,0.02)] transition hover:-translate-y-[2px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F4A261]"
              >
                <div className="mb-4 flex items-center justify-between">
                  <div className="inline-flex h-[72px] w-[72px] items-center justify-center rounded-full bg-[rgba(26,95,122,0.10)]">
                    {index === 0 && <CalculatorBrainIcon />}
                    {index === 1 && <PiggyLockIcon />}
                    {index === 2 && <CoinsArrowIcon />}
                  </div>
                  <span className="rounded-full bg-[#F4A261] px-3 py-1 text-xs font-semibold text-white">{feature.badge}</span>
                </div>
                <h3 className="mb-2 text-[18px] font-bold text-black">{feature.title}</h3>
                <p className="text-sm leading-6 text-[#6C757D]">{feature.desc}</p>
                <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-[#1A5F7A]">Login or register to continue</p>
              </a>
            ))}
          </div>
        </section>

        <section className="mt-12 rounded-[20px] bg-[#F8F9FA] px-5 py-10 md:px-8">
          <h2 className="mb-6 text-center text-[22px] font-bold tracking-[-0.2px] text-black">Explore rilstack</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <a href="/about" className="rounded-2xl bg-white p-5 shadow-[0_4px_12px_rgba(0,0,0,0.05),0_1px_2px_rgba(0,0,0,0.03)] transition hover:-translate-y-[2px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F4A261]">
              <h3 className="mb-2 text-base font-semibold text-[#1A5F7A]">About Us</h3>
              <p className="text-sm leading-6 text-[#6C757D]">Learn our mission, values, and why rilstack exists.</p>
            </a>
            <a href="/contact-support" className="rounded-2xl bg-white p-5 shadow-[0_4px_12px_rgba(0,0,0,0.05),0_1px_2px_rgba(0,0,0,0.03)] transition hover:-translate-y-[2px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F4A261]">
              <h3 className="mb-2 text-base font-semibold text-[#1A5F7A]">Contact Us</h3>
              <p className="text-sm leading-6 text-[#6C757D]">Reach support quickly for account and payment help.</p>
            </a>
            <a href="/contact-support#faq" className="rounded-2xl bg-white p-5 shadow-[0_4px_12px_rgba(0,0,0,0.05),0_1px_2px_rgba(0,0,0,0.03)] transition hover:-translate-y-[2px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F4A261]">
              <h3 className="mb-2 text-base font-semibold text-[#1A5F7A]">FAQ</h3>
              <p className="text-sm leading-6 text-[#6C757D]">Read answers to common questions about using rilstack.</p>
            </a>
          </div>
        </section>
      </div>

      <footer className="mt-10 bg-[#212529] px-6 py-6 text-white md:px-10">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4">
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <a href="/terms" className="underline decoration-transparent underline-offset-4 transition hover:decoration-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F4A261]">Terms & Conditions</a>
            <a href="/privacy" className="underline decoration-transparent underline-offset-4 transition hover:decoration-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F4A261]">Privacy Policy</a>
            <a href="/contact-support" className="underline decoration-transparent underline-offset-4 transition hover:decoration-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F4A261]">Contact Support</a>
          </div>
          <div className="flex items-center justify-between text-xs text-[#ADB5BD]">
            <p>© 2027 rilstack. All rights reserved.</p>
            <p>v1.0.0</p>
          </div>
        </div>
      </footer>

      <style jsx>{`
        .logo-intro {
          animation: logoStackIn 800ms cubic-bezier(0.2, 1, 0.3, 1) both;
        }

        .logo-pulse {
          animation: pulseSoft 2400ms ease-in-out infinite;
        }

        .stack-loader {
          position: relative;
          width: 44px;
          height: 36px;
        }

        .stack-loader span {
          position: absolute;
          width: 28px;
          height: 12px;
          border-radius: 6px;
          left: 8px;
          background: #1a5f7a;
          animation: stackPulse 1100ms ease-in-out infinite;
        }

        .stack-loader span:nth-child(1) {
          top: 0;
          animation-delay: 0ms;
        }

        .stack-loader span:nth-child(2) {
          top: 10px;
          left: 11px;
          opacity: 0.9;
          animation-delay: 120ms;
        }

        .stack-loader span:nth-child(3) {
          top: 20px;
          left: 14px;
          background: #f4a261;
          animation-delay: 240ms;
        }

        .feature-scroll {
          scrollbar-width: thin;
          scrollbar-color: #1a5f7a22 transparent;
        }

        .feature-card {
          animation: fadeUp 520ms ease both;
        }

        @keyframes logoStackIn {
          0% {
            opacity: 0;
            transform: translateY(10px) scale(0.9);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes pulseSoft {
          0%,
          100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.035);
          }
        }

        @keyframes stackPulse {
          0%,
          100% {
            transform: scale(1);
            opacity: 0.8;
          }
          50% {
            transform: scale(1.08);
            opacity: 1;
          }
        }

        @keyframes fadeUp {
          0% {
            opacity: 0;
            transform: translateY(14px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </main>
  );
}