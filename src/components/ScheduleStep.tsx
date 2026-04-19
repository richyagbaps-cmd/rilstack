import React, { useState } from "react";

interface ScheduleStepProps {
  startDate: Date | null;
  endDate: Date | null;
  onChange: (start: Date, end: Date) => void;
}

function formatDuration(start: Date, end: Date) {
  const ms = end.getTime() - start.getTime();
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));
  return `${days} day${days !== 1 ? "s" : ""}`;
}

function formatCountdown(target: Date) {
  const [now, setNow] = useState(new Date());
  React.useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);
  const ms = target.getTime() - now.getTime();
  if (ms <= 0) return "Budget ended";
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));
  const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((ms / (1000 * 60)) % 60);
  const seconds = Math.floor((ms / 1000) % 60);
  return `${days}d ${hours}h ${minutes}m ${seconds}s left`;
}

export default function ScheduleStep({
  startDate,
  endDate,
  onChange,
}: ScheduleStepProps) {
  const [start, setStart] = useState<Date | null>(startDate);
  const [end, setEnd] = useState<Date | null>(endDate);

  const handleStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = new Date(e.target.value);
    setStart(val);
    if (end && val > end) setEnd(val);
    if (end) onChange(val, end);
  };
  const handleEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = new Date(e.target.value);
    setEnd(val);
    if (start) onChange(start, val);
  };

  return (
    <div className="w-full max-w-2xl mx-auto mt-4">
      <div className="mb-4 text-lg font-semibold text-[#2c3e5f]">
        Schedule Your Budget
      </div>
      <div className="flex flex-col gap-4 mb-6">
        <label className="flex flex-col">
          Start Date & Time
          <input
            type="datetime-local"
            className="mt-1 p-2 border rounded"
            value={start ? start.toISOString().slice(0, 16) : ""}
            onChange={handleStartChange}
          />
        </label>
        <label className="flex flex-col">
          End Date & Time
          <input
            type="datetime-local"
            className="mt-1 p-2 border rounded"
            value={end ? end.toISOString().slice(0, 16) : ""}
            onChange={handleEndChange}
          />
        </label>
      </div>
      {start && end && (
        <div className="mb-4 bg-[#f3f4fa] rounded-lg px-4 py-2 font-semibold">
          Duration: {formatDuration(start, end)}
        </div>
      )}
      {start && end && start <= new Date() && end > new Date() && (
        <div className="mb-4 bg-[#e6f7e6] rounded-lg px-4 py-2 font-semibold text-[#2c3e5f]">
          Live Countdown: {formatCountdown(end)}
        </div>
      )}
    </div>
  );
}
