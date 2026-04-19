"use client";
import { useState, useEffect } from "react";

const ADMIN_MIN_DAYS = 10; // This can be fetched from backend/admin settings

function daysFromToday(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function getCountdown(date: string) {
  const now = new Date();
  const unlock = new Date(date);
  const diff = unlock.getTime() - now.getTime();
  if (diff <= 0) return "Unlocked";
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const mins = Math.floor((diff / (1000 * 60)) % 60);
  return `${days}d ${hours}h ${mins}m`;
}

export default function SafeLockManager() {
  const [locks, setLocks] = useState<any[]>([]);
  const [amount, setAmount] = useState("");
  const [unlockDate, setUnlockDate] = useState(daysFromToday(ADMIN_MIN_DAYS));
  const [error, setError] = useState("");

  useEffect(() => {
    const interval = setInterval(() => setLocks([...locks]), 60000); // force re-render for countdown
    return () => clearInterval(interval);
  }, [locks]);

  const handleAddLock = () => {
    setError("");
    if (!amount || Number(amount) <= 0) return setError("Enter a valid amount");
    if (!unlockDate || unlockDate < daysFromToday(ADMIN_MIN_DAYS))
      return setError(
        `Unlock date must be at least ${ADMIN_MIN_DAYS} days from today`,
      );
    setLocks([...locks, { amount: Number(amount), unlockDate }]);
    setAmount("");
    setUnlockDate(daysFromToday(ADMIN_MIN_DAYS));
  };

  return (
    <div className="max-w-lg mx-auto bg-white rounded-xl shadow-lg p-8 mt-8">
      <h2 className="text-2xl font-bold mb-4 text-center">Safe Locks</h2>
      <div className="mb-4">
        Lock a portion of your savings goal. Locked funds cannot be withdrawn
        until the unlock date.
      </div>
      <div className="flex gap-2 mb-4">
        <input
          type="number"
          className="border p-2 rounded w-32"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <input
          type="date"
          className="border p-2 rounded"
          min={daysFromToday(ADMIN_MIN_DAYS)}
          value={unlockDate}
          onChange={(e) => setUnlockDate(e.target.value)}
        />
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded"
          onClick={handleAddLock}
        >
          Add Lock
        </button>
      </div>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      <h3 className="font-bold mb-2">Active Safe Locks</h3>
      <ul className="divide-y">
        {locks.length === 0 && (
          <li className="text-gray-500">No active safe locks.</li>
        )}
        {locks.map((lock, idx) => (
          <li key={idx} className="py-2 flex justify-between items-center">
            <span>
              ₦{lock.amount.toLocaleString()} locked until {lock.unlockDate}
            </span>
            <span className="text-blue-600 font-mono">
              {getCountdown(lock.unlockDate)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
