"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const featureCards = [
  {
    title: "Smart Budgeting",
    desc: "Adaptive planning across 50/30/20, zero-based, and custom modes.",
    metric: "3 plans",
    icon: "Budget",
    href: "/budgets",
  },
  {
    title: "Safe Lock Savings",
    desc: "Lock amounts for milestones and track growth with clear timelines.",
    metric: "18% p.a.",
    icon: "Save",
    href: "/savings/dashboard",
  },
  {
    title: "Auto Investments",
    desc: "Structured products with transparent expected returns and status.",
    metric: "Live",
    icon: "Invest",
    href: "/investments/dashboard",
  },
];

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [riskLevel, setRiskLevel] = useState(45);
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/dashboard");
    }
  }, [status, router]);

  if (status === "loading" || status === "authenticated") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0A1222]">
        <p className="text-sm font-semibold tracking-wide text-[#86D4F8]">Loading...</p>
      </div>
    );
  }

  const estimatedMonthlyGrowth = Math.round((riskLevel / 100) * 85000);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#081126] text-white">
      <div className="pointer-events-none absolute inset-0 opacity-80">
        <div className="absolute -left-24 top-[-120px] h-80 w-80 rounded-full bg-[#15A3B8]/40 blur-3xl" />
        <div className="absolute right-[-120px] top-[220px] h-[24rem] w-[24rem] rounded-full bg-[#F28F3B]/25 blur-3xl" />
        <div className="absolute bottom-[-140px] left-1/3 h-[22rem] w-[22rem] rounded-full bg-[#1A5F7A]/40 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 pb-16 pt-8 md:px-8 md:pt-12">
        <header className="mb-10 flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur">
          <div className="flex items-center gap-3">
            <img src="/images/rilstack-logo.png" alt="Rilstack" className="h-10 w-10 rounded-full" />
            <div>
              <p className="text-sm font-semibold tracking-wide text-[#BCE9FF]">RILSTACK</p>
              <p className="text-xs text-white/60">Personal finance stack for modern Nigerians</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a href="/login" className="rounded-xl border border-white/20 px-4 py-2 text-sm font-semibold text-white/90 transition hover:border-white/40">
              Login
            </a>
            <a href="/signup" className="rounded-xl bg-[#F16952] px-4 py-2 text-sm font-bold text-white shadow-[0_10px_30px_rgba(241,105,82,0.35)] transition hover:translate-y-[-1px]">
              Open Account
            </a>
          </div>
        </header>

        <section className="grid items-center gap-8 md:grid-cols-2">
          <div>
            <p className="mb-3 inline-flex rounded-full border border-[#89E3FF]/40 bg-[#0F2845] px-4 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-[#89E3FF]">
              Finance Interface, Reimagined
            </p>
            <h1 className="mb-4 text-4xl font-extrabold leading-tight text-white md:text-6xl">
              Designed like a premium product, not a template.
            </h1>
            <p className="mb-6 max-w-xl text-base leading-7 text-white/75 md:text-lg">
              Run budgets, savings, and investments from one interactive command center with high-clarity insights and motion-rich visuals.
            </p>

            <div className="mb-8 flex flex-wrap gap-3">
              <a href="/signup" className="rounded-2xl bg-[#F16952] px-6 py-3 text-sm font-bold text-white shadow-[0_14px_28px_rgba(241,105,82,0.32)] transition hover:translate-y-[-1px]">
                Start Stacking
              </a>
              <a href="/dashboard" className="rounded-2xl border border-white/20 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
                See Dashboard
              </a>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#0D1F3A]/80 p-4 backdrop-blur">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-semibold text-[#BCE9FF]">Growth Simulation</span>
                <span className="text-white/70">Risk Mix: {riskLevel}%</span>
              </div>
              <input
                type="range"
                min={10}
                max={90}
                value={riskLevel}
                onChange={(e) => setRiskLevel(Number(e.target.value))}
                className="w-full accent-[#F16952]"
              />
              <p className="mt-3 text-sm text-white/75">
                Estimated monthly growth projection: <span className="font-bold text-[#8EF6A3]">N{estimatedMonthlyGrowth.toLocaleString()}</span>
              </p>
            </div>
          </div>

          <div className="relative">
            <div className="float-card relative rounded-[2rem] border border-white/15 bg-gradient-to-b from-[#18345A] to-[#0D1F39] p-4 shadow-[0_40px_80px_rgba(0,0,0,0.45)]">
              <img src="/images/investment-grid.svg" alt="Investment board" className="h-52 w-full rounded-2xl object-cover" />
              <div className="mt-4 grid grid-cols-2 gap-3">
                <img src="/images/budget-map.svg" alt="Budget planning" className="h-28 w-full rounded-xl border border-white/10 bg-white/5 p-2" />
                <img src="/images/savings-orbit.svg" alt="Savings orbit" className="h-28 w-full rounded-xl border border-white/10 bg-white/5 p-2" />
              </div>
            </div>

            <a
              href="/history"
              className="floating-widget absolute -left-8 top-8 rounded-xl border border-[#89E3FF]/40 bg-[#0E2748] px-4 py-3 text-sm shadow-xl"
            >
              <p className="text-white/65">Today</p>
              <p className="font-bold text-[#8EF6A3]">+N24,500</p>
            </a>
            <a
              href="/savings/dashboard"
              className="floating-widget-delayed absolute -right-6 bottom-8 rounded-xl border border-[#F9C07A]/40 bg-[#382515] px-4 py-3 text-sm shadow-xl"
            >
              <p className="text-white/65">Savings Streak</p>
              <p className="font-bold text-[#FFD38D]">31 days</p>
            </a>
          </div>
        </section>

        <section className="mt-14 grid gap-5 md:grid-cols-3">
          {featureCards.map((feature, index) => (
            <a
              key={feature.title}
              href={feature.href}
              onMouseEnter={() => setHoveredFeature(index)}
              onMouseLeave={() => setHoveredFeature(null)}
              className="group rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur transition duration-300 hover:border-[#89E3FF]/40 hover:bg-[#102644]"
            >
              <div className="mb-4 flex items-center justify-between">
                <div className="icon-orb">
                  <span>{feature.icon}</span>
                </div>
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-[#CFF2FF]">
                  {feature.metric}
                </span>
              </div>
              <h3 className="mb-2 text-xl font-bold text-white">{feature.title}</h3>
              <p className="text-sm leading-6 text-white/70">{feature.desc}</p>
              <p className="mt-4 text-sm font-semibold text-[#89E3FF]">
                {hoveredFeature === index ? "Explore module ->" : "Ready when you are"}
              </p>
            </a>
          ))}
        </section>

        <section className="mt-14 rounded-3xl border border-white/10 bg-[#0D1F39]/90 p-6 md:p-10">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-[#89E3FF]">Inside the product</p>
              <h2 className="mb-3 text-3xl font-extrabold leading-tight">A dashboard that feels alive.</h2>
              <p className="mb-6 max-w-lg text-sm leading-7 text-white/75">
                Floating balance snapshots, dynamic savings widgets, and visual decision aids reduce friction and make every action clear.
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs text-white/65">Budget Health</p>
                  <p className="text-lg font-bold text-[#8EF6A3]">Strong</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs text-white/65">Lock Savings</p>
                  <p className="text-lg font-bold text-[#FFD38D]">Active</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <img src="/images/investment-grid.svg" alt="Portfolio image" className="h-40 w-full rounded-xl border border-white/15 bg-white/5 p-2" />
              <img src="/images/savings-orbit.svg" alt="Savings image" className="h-40 w-full rounded-xl border border-white/15 bg-white/5 p-2" />
              <img src="/images/budget-map.svg" alt="Budget image" className="col-span-2 h-44 w-full rounded-xl border border-white/15 bg-white/5 p-2" />
            </div>
          </div>
        </section>

        <footer className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-6 text-sm text-white/65">
          <p>© 2026 Rilstack.xyz. Stack your finances with clarity.</p>
          <div className="flex flex-wrap items-center gap-5">
            <a href="/terms" className="hover:text-white">Terms</a>
            <a href="/privacy" className="hover:text-white">Privacy</a>
            <a href="/contact-support" className="hover:text-white">Support</a>
          </div>
        </footer>
      </div>

      <style jsx>{`
        .float-card {
          animation: bob 5.5s ease-in-out infinite;
        }

        .floating-widget {
          animation: drift 6.4s ease-in-out infinite;
        }

        .floating-widget-delayed {
          animation: drift 6.4s ease-in-out infinite 1.4s;
        }

        .icon-orb {
          width: 52px;
          height: 52px;
          border-radius: 9999px;
          background: radial-gradient(circle at 30% 30%, #9be5ff 0%, #2c7eb2 45%, #183f61 100%);
          box-shadow:
            inset -8px -10px 16px rgba(0, 0, 0, 0.22),
            inset 8px 10px 16px rgba(255, 255, 255, 0.18),
            0 12px 22px rgba(0, 0, 0, 0.28);
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .icon-orb span {
          font-size: 0.68rem;
          font-weight: 800;
          letter-spacing: 0.03em;
          color: #f4fcff;
          text-transform: uppercase;
        }

        @keyframes drift {
          0% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-11px);
          }
          100% {
            transform: translateY(0px);
          }
        }

        @keyframes bob {
          0% {
            transform: translateY(0px) rotate(-0.5deg);
          }
          50% {
            transform: translateY(-8px) rotate(0.5deg);
          }
          100% {
            transform: translateY(0px) rotate(-0.5deg);
          }
        }
      `}</style>
    </main>
  );
}