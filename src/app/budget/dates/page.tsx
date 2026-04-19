"use client";
import { useState } from "react";

function getToday() {
  return new Date().toISOString().slice(0, 10);
}

export default function BudgetDates({
  onComplete,
}: {
  onComplete?: (data: any) => void;
}) {
  const [start, setStart] = useState(getToday());
  const [end, setEnd] = useState("");
  const [error, setError] = useState("");
  const [serverTime, setServerTime] = useState<string>("");

  // Poll server time every 5s
  React.useEffect(() => {
    const fetchTime = async () => {
      try {
        const res = await fetch("/api/time");
        const { time } = await res.json();
        setServerTime(time);
      } catch {}
    };
    fetchTime();
    const id = setInterval(fetchTime, 5000);
    return () => clearInterval(id);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!start || !end) {
      setError("Both dates are required.");
      return;
    }
    if (end <= start) {
      setError("End date must be after start date.");
      return;
    }
    setError("");
    if (onComplete) onComplete({ start, end });
    else localStorage.setItem("budget_dates", JSON.stringify({ start, end }));
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-8 mt-8 flex flex-col gap-4"
    >
      <h2 className="text-2xl font-bold mb-2 text-center">Budget Period</h2>
      <div className="text-center text-blue-700 font-mono mb-2 text-lg">
        Server Time: {serverTime || "..."}
      </div>
      <div>
        <label className="block mb-1 font-medium">Start Date</label>
        <input
          type="date"
          className="w-full border p-2 rounded"
          value={start}
          onChange={(e) => setStart(e.target.value)}
          required
        />
      </div>
      <div>
        <label className="block mb-1 font-medium">End Date</label>
        <input
          type="date"
          className="w-full border p-2 rounded"
          value={end}
          onChange={(e) => setEnd(e.target.value)}
          required
          min={start}
        />
      </div>
      {error && <div className="text-red-500">{error}</div>}
      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 rounded font-semibold"
      >
        Continue
      </button>
    </form>
  );
}
