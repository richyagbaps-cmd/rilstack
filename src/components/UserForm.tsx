import React, { useState } from "react";
import { saveUserData } from "@/lib/saveUserData";
import { logUserAction } from "@/lib/logUserAction";

export default function UserForm() {
  const [form, setForm] = useState({ name: "", email: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const savedUser = await saveUserData(form);
      setUser(savedUser);
      // Fire-and-forget audit log
      logUserAction("form_submit", { form });
    } catch (err: any) {
      setError(err.message || "Failed to save user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        name="name"
        value={form.name}
        onChange={handleChange}
        placeholder="Name"
        required
      />
      <input
        name="email"
        value={form.email}
        onChange={handleChange}
        placeholder="Email"
        required
      />
      <button type="submit" disabled={loading}>
        {loading ? "Saving..." : "Save"}
      </button>
      {error && <div style={{ color: "red" }}>{error}</div>}
      {user && (
        <div style={{ color: "green" }}>Saved: {JSON.stringify(user)}</div>
      )}
    </form>
  );
}
