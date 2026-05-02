"use client";

/**
 * PinModal — PiggyVest-style full-screen PIN entry with numpad.
 *
 * Usage:
 *   <PinModal open={showPin} title="Confirm Deposit" onSuccess={doDeposit} onCancel={() => setShowPin(false)} />
 *
 * First use: creates PIN. Subsequent uses: verifies PIN.
 * Exports helpers: hasPinStored(), savePinStored(), verifyPinStored()
 */

import React, { useCallback, useEffect, useState } from "react";

const PIN_KEY = "rilstack-user-pin";
const PIN_LEN = 4;

function hashPin(pin: string): string {
  let hash = 5381;
  for (let i = 0; i < pin.length; i++) {
    hash = (hash * 33) ^ pin.charCodeAt(i);
  }
  return "rv_" + Math.abs(hash >>> 0).toString(36);
}

export function hasPinStored(): boolean {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem(PIN_KEY);
}

export function savePinStored(pin: string): void {
  localStorage.setItem(PIN_KEY, hashPin(pin));
}

export function verifyPinStored(pin: string): boolean {
  const stored = typeof window !== "undefined" ? localStorage.getItem(PIN_KEY) : null;
  if (!stored) return false;
  return hashPin(pin) === stored;
}

export function clearPinStored(): void {
  if (typeof window !== "undefined") localStorage.removeItem(PIN_KEY);
}

// ─── Types ───────────────────────────────────────────────────────────────────

type Step = "create" | "confirm" | "enter";

interface PinModalProps {
  open: boolean;
  title?: string;
  subtitle?: string;
  onSuccess: () => void;
  onCancel: () => void;
}

// ─── Component ───────────────────────────────────────────────────────────────

const NUMPAD = [
  ["1", "2", "3"],
  ["4", "5", "6"],
  ["7", "8", "9"],
  ["", "0", "del"],
] as const;

export default function PinModal({
  open,
  title = "Enter PIN",
  subtitle,
  onSuccess,
  onCancel,
}: PinModalProps) {
  const [step, setStep] = useState<Step>("enter");
  const [pin, setPin] = useState("");
  const [createPin, setCreatePin] = useState("");
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const currentPin = step === "confirm" ? pin : createPin;

  // Reset on open
  useEffect(() => {
    if (!open) return;
    setPin("");
    setCreatePin("");
    setError("");
    setShake(false);
    setAttempts(0);
    setStep(hasPinStored() ? "enter" : "create");
  }, [open]);

  const doShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 450);
  };

  const processComplete = useCallback(
    (entered: string) => {
      if (step === "create") {
        setCreatePin(entered);
        setPin("");
        setStep("confirm");
        return;
      }

      if (step === "confirm") {
        if (entered !== createPin) {
          setError("PINs don't match. Try again.");
          doShake();
          setPin("");
          return;
        }
        savePinStored(createPin);
        setError("");
        onSuccess();
        return;
      }

      // step === "enter"
      if (!verifyPinStored(entered)) {
        const next = attempts + 1;
        setAttempts(next);
        setError(
          next >= 5
            ? "Too many attempts. Try again later."
            : `Incorrect PIN. ${5 - next} attempt${5 - next !== 1 ? "s" : ""} left.`,
        );
        doShake();
        setPin("");
        return;
      }
      setError("");
      onSuccess();
    },
    [step, pin, createPin, attempts, onSuccess],
  );

  const handleKey = useCallback(
    (key: string) => {
      if (key === "del") {
        if (step === "confirm") {
          setPin((p) => p.slice(0, -1));
        } else {
          setCreatePin((p) => p.slice(0, -1));
        }
        setError("");
        return;
      }

      const current = step === "confirm" ? pin : createPin;
      if (current.length >= PIN_LEN) return;
      const next = current + key;

      if (step === "confirm") {
        setPin(next);
      } else {
        setCreatePin(next);
      }

      if (next.length === PIN_LEN) {
        setTimeout(() => processComplete(next), 120);
      }
    },
    [step, pin, createPin, processComplete],
  );

  if (!open) return null;

  const displayPin = step === "confirm" ? pin : createPin;

  const headings: Record<Step, string> = {
    create: "Create Your PIN",
    confirm: "Confirm PIN",
    enter: title,
  };

  const captions: Record<Step, string> = {
    create: "Set a 4-digit PIN to secure all your actions",
    confirm: "Re-enter your PIN to confirm",
    enter: subtitle || "Enter your 4-digit security PIN",
  };

  return (
    <div
      className="fixed inset-0 z-[120] flex flex-col items-center justify-end bg-black/60 backdrop-blur-[2px] animate-fade-in"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-md animate-slide-up rounded-t-[32px] bg-white pb-10 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle */}
        <div className="mx-auto mb-5 mt-3 h-1 w-10 rounded-full bg-slate-200" />

        {/* Lock icon */}
        <div className="mb-3 flex justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#E6F7F3]">
            <svg
              className="h-7 w-7 text-[#0AB68B]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
        </div>

        <h2 className="text-center text-[18px] font-bold text-[#0F2C3D]">{headings[step]}</h2>
        <p className="mb-5 mt-1 text-center text-sm text-slate-500">{captions[step]}</p>

        {/* PIN dots */}
        <div className={`mb-5 flex justify-center gap-5 ${shake ? "animate-shake" : ""}`}>
          {Array.from({ length: PIN_LEN }, (_, i) => (
            <div
              key={i}
              className={`h-4 w-4 rounded-full border-2 transition-all duration-150 ${
                i < displayPin.length
                  ? "scale-110 border-[#0AB68B] bg-[#0AB68B]"
                  : "border-slate-300 bg-transparent"
              }`}
            />
          ))}
        </div>

        {/* Error */}
        {error && (
          <p className="mb-3 text-center text-[13px] font-medium text-red-500 animate-fade-in">
            {error}
          </p>
        )}

        {/* Numpad */}
        <div className="mx-auto grid max-w-[256px] grid-cols-3 gap-3 px-2">
          {NUMPAD.flat().map((key, i) => {
            if (key === "") return <div key={i} />;
            return (
              <button
                key={i}
                type="button"
                onClick={() => handleKey(key)}
                className={`flex h-[60px] w-full items-center justify-center rounded-2xl text-xl font-semibold transition-all active:scale-95 ${
                  key === "del"
                    ? "bg-transparent text-slate-400"
                    : "bg-[#F5F8FA] text-[#0F2C3D] shadow-sm active:bg-[#D6F0EA] active:text-[#0AB68B]"
                }`}
                aria-label={key === "del" ? "Delete" : key}
              >
                {key === "del" ? (
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l6.414 6.414a2 2 0 001.414.586H19a2 2 0 002-2V7a2 2 0 00-2-2h-8.172a2 2 0 00-1.414.586L3 12z"
                    />
                  </svg>
                ) : (
                  key
                )}
              </button>
            );
          })}
        </div>

        {/* Cancel / Forgot PIN */}
        <div className="mt-6 flex justify-center gap-6">
          <button
            type="button"
            onClick={onCancel}
            className="text-sm text-slate-500 hover:text-slate-700"
          >
            Cancel
          </button>
          {step === "enter" && hasPinStored() && (
            <button
              type="button"
              onClick={() => {
                clearPinStored();
                setStep("create");
                setCreatePin("");
                setPin("");
                setError("");
              }}
              className="text-sm font-semibold text-[#0AB68B]"
            >
              Forgot PIN?
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
