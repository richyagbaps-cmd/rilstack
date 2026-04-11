import React, { useState } from "react";

const NUMPAD = [
  [1, 2, 3],
  [4, 5, 6],
  [7, 8, 9],
  ["biometric", 0, "del"]
];

export default function PinPad({ value, onChange, onBiometric }: { value: string; onChange: (v: string) => void; onBiometric?: () => void }) {
  const handlePress = (key: number | string) => {
    if (typeof key === "number") {
      if (value.length < 6) onChange(value + key);
    } else if (key === "del") {
      onChange(value.slice(0, -1));
    } else if (key === "biometric" && onBiometric) {
      onBiometric();
    }
  };
  return (
    <div className="flex flex-col items-center gap-2 select-none">
      {NUMPAD.map((row, i) => (
        <div key={i} className="flex gap-2">
          {row.map((key, j) => (
            <button
              key={j}
              className={`w-14 h-14 flex items-center justify-center rounded-full text-2xl font-bold shadow bg-white active:bg-[#e6eaf0] ${key === "biometric" ? "text-[#00e096]" : key === "del" ? "text-red-500" : "text-[#2c3e5f]"}`}
              onClick={() => handlePress(key)}
              aria-label={typeof key === "number" ? key.toString() : key}
            >
              {key === "biometric" ? <span role="img" aria-label="biometric">🔒</span> : key === "del" ? <span>&larr;</span> : key}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}
