import React, { useEffect, useState } from "react";
import { fetchInvestments } from "@/lib/investmentsApi";

export default function CustomerInvestments() {
  const [investments, setInvestments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchInvestments()
      .then(setInvestments)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;

  return (
    <div>
      <h2>Available Investments</h2>
      {investments.map((inv) => (
        <div key={inv.id} style={{ marginBottom: 16 }}>
          <div>
            <b>{inv.name}</b>
          </div>
          <div>{inv.description}</div>
          <div>
            Units left: <b>{inv.total_units_available}</b>
          </div>
        </div>
      ))}
    </div>
  );
}
