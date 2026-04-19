import React, { useState, useRef } from "react";

interface MetricCard {
  label: string;
  value: string;
  detail: string;
  tone: string;
}

export default function MetricCardsCarousel({
  cards,
}: {
  cards: MetricCard[];
}) {
  const [active, setActive] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  React.useEffect(() => {
    intervalRef.current = setInterval(() => {
      setActive((prev) => (prev + 1) % cards.length);
    }, 3500);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [cards.length]);

  return (
    <div className="flex flex-col items-center py-6">
      <div className="w-full flex justify-center">
        <div className="flex flex-col items-center w-full max-w-xs rounded-2xl border border-[#E9EDF2] bg-[#F8F9FC] p-6 shadow-sm transition-all duration-300">
          <p className="text-xs uppercase tracking-[0.2em] text-[#4A5B6E]">
            {cards[active].label}
          </p>
          <p className="mt-3 text-2xl font-bold text-[#1E2A3A]">
            {cards[active].value}
          </p>
          <p className="mt-2 text-xs text-[#4A5B6E] text-center">
            {cards[active].detail}
          </p>
        </div>
      </div>
      <div className="flex justify-center gap-2 mt-4">
        {cards.map((_, idx) => (
          <button
            key={idx}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${active === idx ? "bg-[#2c3e5f]" : "bg-gray-300 dark:bg-gray-700"}`}
            onClick={() => setActive(idx)}
            aria-label={`Go to card ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
