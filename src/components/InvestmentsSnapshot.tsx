"use client";

import Link from "next/link";

export interface InvestmentItem {
  id: string;
  name: string;
  amountInvested: number;
  maturityDate: string;
  expectedReturnPercent: number;
  progressPercent: number;
}

export interface InvestmentsSnapshotData {
  totalInvested: number;
  totalExpectedReturns: number;
  items: InvestmentItem[];
}

interface InvestmentsSnapshotProps {
  data: InvestmentsSnapshotData;
}

function formatNaira(value: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(value);
}

function GrowthIcon() {
  return (
    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1A5F7A]/10 text-[#1A5F7A]">
      <svg
        viewBox="0 0 24 24"
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M4 16l5-5 4 4 7-8" />
        <path d="M15 7h5v5" />
      </svg>
    </span>
  );
}

export default function InvestmentsSnapshot({ data }: InvestmentsSnapshotProps) {
  return (
    <section className="rounded-[20px] bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04),0_4px_16px_rgba(0,0,0,0.02)]">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-semibold text-slate-900">Investments</h2>
        <Link href="/investments" className="text-sm font-semibold text-[#1A5F7A] hover:underline">
          See all
        </Link>
      </div>

      <div className="mb-4 flex items-start justify-between gap-4 rounded-2xl bg-slate-50 p-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.08em] text-slate-500">
            Total invested
          </p>
          <p className="mt-1 text-lg font-bold text-slate-900">
            {formatNaira(data.totalInvested)}
          </p>
          <p className="mt-1 text-sm font-medium text-[#2E7D32]">
            Expected returns {formatNaira(data.totalExpectedReturns)}
          </p>
        </div>
        <GrowthIcon />
      </div>

      {data.items.length === 0 ? (
        <Link
          href="/investments/product"
          className="inline-flex h-10 w-full items-center justify-center rounded-xl bg-[#1A5F7A] px-4 text-sm font-semibold text-white transition hover:bg-[#0E4A63]"
        >
          Explore investment products
        </Link>
      ) : (
        <div className="space-y-3">
          {data.items.slice(0, 2).map((item) => (
            <div key={item.id} className="rounded-2xl border border-slate-200 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{item.name}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {formatNaira(item.amountInvested)} invested
                  </p>
                </div>
                <span className="rounded-full bg-[#F4A261]/15 px-2.5 py-1 text-xs font-semibold text-[#9A4B00]">
                  {item.expectedReturnPercent}% return
                </span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-[#1A5F7A]"
                  style={{ width: `${Math.max(0, Math.min(100, item.progressPercent))}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-slate-500">Maturity date: {item.maturityDate}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
