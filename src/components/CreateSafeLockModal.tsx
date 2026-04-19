import React, { useState } from "react";

interface CreateSafeLockModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (lock: { amount: number; releaseDate: string }) => void;
  minDate: string;
}

export default function CreateSafeLockModal({
  open,
  onClose,
  onCreate,
  minDate,
}: CreateSafeLockModalProps) {
  const [amount, setAmount] = useState(0);
  const [releaseDate, setReleaseDate] = useState(minDate);

  if (!open) return null;

  const handleCreate = () => {
    if (!amount || !releaseDate) return;
    onCreate({ amount, releaseDate });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-2xl p-0 w-full max-w-md flex flex-col items-center relative">
        <button
          className="absolute top-4 right-4 text-[#2c3e5f] text-2xl font-bold"
          onClick={onClose}
        >
          &times;
        </button>
        <div className="p-8 w-full">
          <h2 className="text-xl font-bold mb-4 text-[#2c3e5f]">
            Create Safe Lock
          </h2>
          <label className="block mb-2 font-medium">Amount (₦)</label>
          <input
            type="number"
            className="w-full mb-4 px-3 py-2 border rounded"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            min={1}
          />
          <label className="block mb-2 font-medium">Release Date</label>
          <input
            type="datetime-local"
            className="w-full mb-4 px-3 py-2 border rounded"
            value={releaseDate}
            min={minDate}
            onChange={(e) => setReleaseDate(e.target.value)}
          />
          <div className="text-xs text-[#2c3e5f] mb-4">
            Funds will be locked until this date (minimum 10 days from today).
            Money earns daily interest but cannot be withdrawn early.
          </div>
          <button
            className="w-full bg-[#2c3e5f] text-white px-4 py-2 rounded font-semibold"
            onClick={handleCreate}
          >
            Create Safe Lock
          </button>
        </div>
      </div>
    </div>
  );
}
