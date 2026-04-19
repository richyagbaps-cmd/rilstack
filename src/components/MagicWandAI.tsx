import React, { useState } from "react";

export default function MagicWandAI({
  onShuffle,
  onUndo,
  disabled,
}: {
  onShuffle: () => void;
  onUndo: () => void;
  disabled?: boolean;
}) {
  const [shuffled, setShuffled] = useState(false);
  return (
    <div className="flex items-center gap-2">
      <button
        className={`flex items-center gap-1 px-3 py-1 rounded-full bg-[#00e096] text-white font-semibold shadow ${disabled ? "opacity-50 cursor-not-allowed" : "hover:bg-[#00c080]"}`}
        onClick={() => {
          setShuffled(true);
          onShuffle();
        }}
        disabled={disabled || shuffled}
        title="Let AI reshuffle allocations"
      >
        <span className="text-lg">🪄</span> Magic wand
      </button>
      {shuffled && (
        <button
          className="ml-2 px-3 py-1 rounded-full bg-[#FFD700] text-[#2c3e5f] font-semibold shadow hover:bg-[#ffe066]"
          onClick={() => {
            setShuffled(false);
            onUndo();
          }}
        >
          Undo
        </button>
      )}
    </div>
  );
}
