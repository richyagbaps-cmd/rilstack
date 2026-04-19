import { useState } from "react";

export default function PinSetup({
  onComplete,
}: {
  onComplete: (pin: string) => void;
}) {
  const [pin, setPin] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{4,6}$/.test(pin)) {
      setError("PIN must be 4-6 digits");
      return;
    }
    if (pin !== confirm) {
      setError("PINs do not match");
      return;
    }
    setError("");
    onComplete(pin);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block mb-1 font-medium">Set a 4-6 digit PIN</label>
        <input
          type="password"
          maxLength={6}
          minLength={4}
          pattern="\d*"
          className="w-full border p-2 rounded"
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
          required
        />
      </div>
      <div>
        <label className="block mb-1 font-medium">Confirm PIN</label>
        <input
          type="password"
          maxLength={6}
          minLength={4}
          pattern="\d*"
          className="w-full border p-2 rounded"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value.replace(/\D/g, ""))}
          required
        />
      </div>
      {error && <div className="text-red-500">{error}</div>}
      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 rounded font-semibold"
      >
        Set PIN
      </button>
    </form>
  );
}
