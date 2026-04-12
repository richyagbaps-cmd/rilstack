import React, { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { saveUserData } from '@/lib/saveUserData';
import { logUserAction } from '@/lib/logUserAction';

export default function UserForm() {
  const [form, setForm] = useState({ name: '', email: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      // Save user data
      const savedUser = await saveUserData(form);
      // Log user action (exclude sensitive fields)
      await logUserAction('submit_form', { ...form });
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to save user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" value={form.name} onChange={handleChange} placeholder="Name" required />
      <input name="email" value={form.email} onChange={handleChange} placeholder="Email" required />
      <button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save'}</button>
      {success && <div style={{ color: 'green' }}>User saved successfully!</div>}
      {error && <div style={{ color: 'red' }}>{error}</div>}
    </form>
  );
}
