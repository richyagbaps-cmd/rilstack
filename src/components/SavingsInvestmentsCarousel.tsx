import React, { useEffect, useRef, useState } from "react";

import { useRouter } from "next/navigation";
import BudgetSaveModal from "@/components/BudgetSaveModal";
import BudgetSection from "./BudgetSection";
import SavingsGoals from "./SavingsGoals";
import InvestmentPortfolio from "./InvestmentPortfolio";
import AccountBalance from "./AccountBalance";
import RilSnackGame from "./SnakeMoneyGame";

interface WidgetCard {
  type: "budgets" | "savings" | "investments" | "ril-snack";
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  bg?: string;
  customContent?: React.ReactNode;
}

const CARDS: WidgetCard[] = [
  {
    type: "budgets",
    title: "Budgets & Savings",
    icon: (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
        <circle cx="20" cy="20" r="20" fill="#2c3e5f" />
        <path
          d="M12 28h16v-2H12v2zm0-6h16v-2H12v2zm0-6h16v-2H12v2z"
          fill="#fff"
        />
      </svg>
    ),
    bg: "bg-[#eaf2fa] dark:bg-[#1E2A3A]",
  },
  {
    type: "investments",
    title: "Investments",
    icon: (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
        <circle cx="20" cy="20" r="20" fill="#FFD700" />
        <path d="M20 12l6 12H14l6-12z" fill="#fff" />
      </svg>
    ),
    bg: "bg-[#fffbe6] dark:bg-[#232f3e]",
  },
  {
    type: "ril-snack",
    title: "Ril-Snack",
    icon: (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
        <circle cx="20" cy="20" r="20" fill="#2c3e5f" />
        <rect x="10" y="10" width="20" height="20" rx="6" fill="#4A8B6E" />
        <circle cx="30" cy="15" r="4" fill="#FFD700" />
      </svg>
    ),
    bg: "bg-[#f7f7f7] dark:bg-[#232f3e]",
  },
];

const AUTO_ADVANCE_INTERVAL = 4000;

export default function SavingsInvestmentsCarousel() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [showBudgetSaveModal, setShowBudgetSaveModal] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const router = useRouter();

  // Auto-advance logic
  useEffect(() => {
    if (paused) return;
    const timer = setInterval(() => {
      setActive((prev) => (prev + 1) % CARDS.length);
    }, 3200);
    return () => clearInterval(timer);
  }, [paused]);

  // Pause auto-advance on user interaction
  const handleTouchStart = (e: React.TouchEvent) => {};
  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = () => {
    if (touchStartX.current !== null && touchEndX.current !== null) {
      const diff = touchStartX.current - touchEndX.current;
      if (Math.abs(diff) > 40) {
        if (diff > 0) {
          // swipe left
          setActive((prev) => (prev + 1) % CARDS.length);
        } else {
          // swipe right
          setActive((prev) => (prev - 1 + CARDS.length) % CARDS.length);
        }
      }
    }
    setTimeout(() => setPaused(false), 4000);
    touchStartX.current = null;
    touchEndX.current = null;
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    setPaused(true);
    if (e.key === "ArrowLeft") {
      setActive((prev) => (prev - 1 + CARDS.length) % CARDS.length);
    } else if (e.key === "ArrowRight") {
      setActive((prev) => (prev + 1) % CARDS.length);
    }
    setTimeout(() => setPaused(false), 4000);
  };

  // Wheel-style carousel logic
  const getCardIndex = (offset: number) =>
    (active + offset + CARDS.length) % CARDS.length;
  return (
    <>
      <div
        className="relative w-full max-w-xs mx-auto flex flex-col items-center justify-center py-8 select-none"
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        aria-label="Savings and Investments Carousel"
      >
        <div className="relative flex flex-row items-center justify-center w-full h-36">
          {/* Previous card (left, faint) */}
          <button
            className="absolute left-0 z-10 flex flex-col items-center justify-center rounded-[2.5rem] shadow-xl px-2 py-3 bg-gradient-to-br from-[#eaf2fa] to-[#e0f0e8] opacity-40 blur-[1.5px] scale-90 pointer-events-auto transition-all duration-500 hover:opacity-60 hover:scale-95"
            style={{
              minWidth: 45,
              minHeight: 45,
              transform: "translateY(9px) scale(0.85)",
            }}
            aria-label="Previous"
            onClick={() => {
              setActive((prev) => (prev - 1 + CARDS.length) % CARDS.length);
              setPaused(true);
              setTimeout(() => setPaused(false), 4000);
            }}
          >
            <div className="mb-1" style={{ fontSize: 20 }}>
              {CARDS[getCardIndex(-1)].icon}
            </div>
            <span className="text-xs font-semibold text-[#2c3e5f]">
              {CARDS[getCardIndex(-1)].title}
            </span>
          </button>

          {/* Main card (center, prominent) */}
          <button
            className="relative z-20 flex flex-col items-center justify-center rounded-[2.5rem] shadow-2xl px-4 py-5 bg-gradient-to-br from-[#eaf2fa] via-[#fffbe6] to-[#ede9fe] border-4 border-[#FFD700] hover:shadow-[0_8px_32px_0_rgba(44,62,95,0.18)] hover:scale-105 active:scale-95 transition-all duration-500 focus:outline-none focus:ring-4 focus:ring-[#FFD700]/40"
            style={{ minWidth: 65, minHeight: 65 }}
            onClick={() => {
              const card = CARDS[active];
              setPaused(true);
              setTimeout(() => setPaused(false), 4000);
              if (card.type === "ril-snack") router.push("/snake");
              else if (card.type === "budgets") router.push("/budgets");
              else if (card.type === "investments") router.push("/investments");
            }}
            aria-label={CARDS[active].title}
          >
            <div
              className="mb-2 drop-shadow-lg animate-bounce-slow"
              style={{ fontSize: 40 }}
            >
              {CARDS[active].icon}
            </div>
            <span className="text-lg font-extrabold text-center text-[#2c3e5f] tracking-wide drop-shadow">
              {CARDS[active].title}
            </span>
          </button>

          {/* Next card (right, faint) */}
          <button
            className="absolute right-0 z-10 flex flex-col items-center justify-center rounded-[2.5rem] shadow-xl px-2 py-3 bg-gradient-to-br from-[#eaf2fa] to-[#fffbe6] opacity-40 blur-[1.5px] scale-90 pointer-events-auto transition-all duration-500 hover:opacity-60 hover:scale-95"
            style={{
              minWidth: 45,
              minHeight: 45,
              transform: "translateY(9px) scale(0.85)",
            }}
            aria-label="Next"
            onClick={() => {
              setActive((prev) => (prev + 1) % CARDS.length);
              setPaused(true);
              setTimeout(() => setPaused(false), 4000);
            }}
          >
            <div className="mb-1" style={{ fontSize: 20 }}>
              {CARDS[getCardIndex(1)].icon}
            </div>
            <span className="text-xs font-semibold text-[#2c3e5f]">
              {CARDS[getCardIndex(1)].title}
            </span>
          </button>
        </div>
        {/* Dots navigation */}
        <div className="flex justify-center gap-3 mt-7">
          {CARDS.map((_, idx) => (
            <button
              key={idx}
              className={`w-3 h-3 rounded-full border-2 border-[#FFD700] transition-all duration-300 ${active === idx ? "bg-[#FFD700] scale-125 shadow-lg" : "bg-gray-300 scale-100"}`}
              aria-label={`Go to card ${idx + 1}`}
              onClick={() => {
                setActive(idx);
                setPaused(true);
                setTimeout(() => setPaused(false), 4000);
              }}
            />
          ))}
        </div>
        {/* Wheel glow effect */}
        <div className="absolute -z-10 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-36 h-36 rounded-full bg-gradient-to-br from-[#FFD700]/20 via-[#8B5CF6]/10 to-[#4A8B6E]/10 blur-3xl animate-pulse-slow"></div>
      </div>
      <BudgetSaveModal
        open={showBudgetSaveModal}
        onClose={() => setShowBudgetSaveModal(false)}
      />
      <style jsx global>{`
        /* spin-slow removed: widgets no longer rotate */
        @keyframes bounce-slow {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-8px);
          }
        }
        .animate-bounce-slow {
          animation: bounce-slow 2.5s infinite;
        }
        @keyframes pulse-slow {
          0%,
          100% {
            opacity: 0.7;
          }
          50% {
            opacity: 1;
          }
        }
        .animate-pulse-slow {
          animation: pulse-slow 3.5s infinite;
        }
      `}</style>
    </>
  );
}

// Ril-Snack preview card for carousel
function RilSnackPreviewCard() {
  return (
    <div className="flex flex-col items-center w-full">
      <div className="mb-2 flex items-center gap-2">
        <span className="font-bold text-lg">Ril-Snack</span>
        <span className="text-xs bg-green-100 text-green-700 rounded px-2 py-0.5">
          Preview
        </span>
      </div>
      <div className="w-full flex flex-col items-center">
        <div className="w-40 h-40 bg-[#222] rounded-lg flex items-center justify-center mb-2">
          <svg width="80" height="80" viewBox="0 0 80 80">
            <rect x="0" y="0" width="80" height="80" rx="16" fill="#2c3e5f" />
            <rect x="16" y="16" width="16" height="16" rx="4" fill="#4A8B6E" />
            <rect x="32" y="16" width="16" height="16" rx="4" fill="#4A8B6E" />
            <rect x="48" y="16" width="16" height="16" rx="4" fill="#2c3e5f" />
            <circle cx="64" cy="24" r="7" fill="#FFD700" />
          </svg>
        </div>
        <p className="text-center text-sm text-gray-700 dark:text-gray-200 mb-2">
          Eat the money, grow the snack!
          <br />
          Arrow keys or on-screen controls.
        </p>
        <span className="inline-block text-xs text-blue-600 underline cursor-pointer">
          Tap to play full game
        </span>
      </div>
    </div>
  );
}
