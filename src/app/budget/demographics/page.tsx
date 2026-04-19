"use client";
import { useState } from "react";

export default function DemographicsForm({
  onComplete,
}: {
  onComplete?: (data: any) => void;
}) {
  const [form, setForm] = useState({
    occupation: "",
    age: "",
    gender: "",
    income: "",
  });
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.occupation || !form.age || !form.gender || !form.income) {
      setError("All fields are required.");
      return;
    }
    setError("");
    if (onComplete) onComplete(form);
    else localStorage.setItem("demographics", JSON.stringify(form));
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-8 mt-8 flex flex-col gap-4"
    >
      <h2 className="text-2xl font-bold mb-2 text-center">
        Tell us about yourself
      </h2>
      <div>
        <label className="block mb-1 font-medium">Occupation</label>
        <input
          name="occupation"
          type="text"
          className="w-full border p-2 rounded"
          value={form.occupation}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label className="block mb-1 font-medium">Age</label>
        <input
          name="age"
          type="number"
          min="16"
          max="100"
          className="w-full border p-2 rounded"
          value={form.age}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label className="block mb-1 font-medium">Gender</label>
        <select
          name="gender"
          className="w-full border p-2 rounded"
          value={form.gender}
          onChange={handleChange}
          required
        >
          <option value="">Select...</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="nonbinary">Non-binary</option>
          <option value="prefer_not_to_say">Prefer not to say</option>
        </select>
      </div>
      <div>
        <label className="block mb-1 font-medium">Monthly Income (₦)</label>
        <input
          name="income"
          type="number"
          min="0"
          className="w-full border p-2 rounded"
          value={form.income}
          onChange={handleChange}
          required
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
