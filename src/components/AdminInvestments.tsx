import React, { useEffect, useState } from 'react';
import { fetchInvestments, updateInvestmentUnits } from '@/lib/investmentsApi';
import { isAdmin } from '@/lib/isAdmin';

export default function AdminInvestments() {
  const [investments, setInvestments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    isAdmin().then(isAdminUser => {
      if (!isAdminUser) {
        setError('Access denied: Admins only');
        setLoading(false);
        return;
      }
      fetchInvestments()
        .then(setInvestments)
        .catch(e => setError(e.message))
        .finally(() => setLoading(false));
    });
  }, []);

  const handleUnitsChange = (id: string, value: number) => {
    setInvestments(investments =>
      investments.map(inv =>
        inv.id === id ? { ...inv, total_units_available: value } : inv
      )
    );
  };

  const handleSave = async (id: string, units: number) => {
    setSaving(id);
    setError(null);
    setSuccess(null);
    try {
      await updateInvestmentUnits(id, units);
      setSuccess('Units updated!');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(null);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <div>
      <h2>Admin Investments Panel</h2>
      {investments.map(inv => (
        <div key={inv.id} style={{ marginBottom: 16 }}>
          <div><b>{inv.name}</b></div>
          <div>{inv.description}</div>
          <input
            type="number"
            value={inv.total_units_available}
            onChange={e => handleUnitsChange(inv.id, Number(e.target.value))}
            min={0}
          />
          <button
            onClick={() => handleSave(inv.id, inv.total_units_available)}
            disabled={saving === inv.id}
          >
            {saving === inv.id ? 'Saving...' : 'Save'}
          </button>
        </div>
      ))}
      {success && <div style={{ color: 'green' }}>{success}</div>}
      {error && <div style={{ color: 'red' }}>{error}</div>}
    </div>
  );
}
