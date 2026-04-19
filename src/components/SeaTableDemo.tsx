import { useState } from "react";

export default function SeaTableDemo() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({});

  // Set your dtableUuid and tableName here
  const dtableUuid = process.env.NEXT_PUBLIC_SEATABLE_UUID || "";
  const tableName = process.env.NEXT_PUBLIC_SEATABLE_TABLE || "";

  const fetchRows = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/seatable?dtableUuid=${dtableUuid}&tableName=${tableName}`,
      );
      const data = await res.json();
      setRows(data.rows || []);
    } catch (e: any) {
      setError(e.message);
    }
    setLoading(false);
  };

  const handleCreate = async () => {
    setLoading(true);
    setError(null);
    try {
      await fetch(
        `/api/seatable?dtableUuid=${dtableUuid}&tableName=${tableName}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        },
      );
      await fetchRows();
    } catch (e: any) {
      setError(e.message);
    }
    setLoading(false);
  };

  const handleDelete = async (rowId: string) => {
    setLoading(true);
    setError(null);
    try {
      await fetch(
        `/api/seatable?dtableUuid=${dtableUuid}&tableName=${tableName}&rowId=${rowId}`,
        { method: "DELETE" },
      );
      await fetchRows();
    } catch (e: any) {
      setError(e.message);
    }
    setLoading(false);
  };

  return (
    <div className="p-4 border rounded max-w-xl mx-auto mt-8">
      <h2 className="text-xl font-bold mb-2">SeaTable CRUD Demo</h2>
      <button
        className="bg-blue-500 text-white px-4 py-2 rounded mb-2"
        onClick={fetchRows}
        disabled={loading}
      >
        {loading ? "Loading..." : "Fetch Rows"}
      </button>
      {error && <div className="text-red-500">{error}</div>}
      <div className="mb-4">
        <input
          className="border p-2 mr-2"
          placeholder="Column1"
          onChange={(e) => setForm({ ...form, column1: e.target.value })}
        />
        <input
          className="border p-2 mr-2"
          placeholder="Column2"
          onChange={(e) => setForm({ ...form, column2: e.target.value })}
        />
        <button
          className="bg-green-500 text-white px-4 py-2 rounded"
          onClick={handleCreate}
          disabled={loading}
        >
          Create Row
        </button>
      </div>
      <table className="w-full border">
        <thead>
          <tr>
            <th className="border p-2">ID</th>
            <th className="border p-2">Column1</th>
            <th className="border p-2">Column2</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row._id}>
              <td className="border p-2">{row._id}</td>
              <td className="border p-2">{row.column1}</td>
              <td className="border p-2">{row.column2}</td>
              <td className="border p-2">
                <button
                  className="bg-red-500 text-white px-2 py-1 rounded"
                  onClick={() => handleDelete(row._id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
