// Next.js API route for SeaTable CRUD
import type { NextApiRequest, NextApiResponse } from "next";
import {
  deleteRow,
  insertRow,
  query,
  updateRow,
} from "@/lib/seatable";

function normalizeTableName(input: string): string {
  const value = input.trim();
  if (!/^[A-Za-z0-9_]+$/.test(value)) {
    throw new Error("Invalid tableName. Use letters, numbers, and underscores only.");
  }
  return value;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { dtableUuid, tableName, rowId } = req.query;
  if (!tableName) {
    res.status(400).json({ error: "Missing tableName" });
    return;
  }

  try {
    const safeTableName = normalizeTableName(tableName as string);

    // Legacy compatibility: dtableUuid is ignored because the new client resolves it from env/auth.
    void dtableUuid;

    if (req.method === "GET") {
      const data = await query(
        `SELECT * FROM ${safeTableName} ORDER BY _ctime DESC LIMIT 200`,
      );
      res.json(data);
    } else if (req.method === "POST") {
      const data = await insertRow(safeTableName, req.body || {});
      res.json(data);
    } else if (req.method === "PUT") {
      if (!rowId) return res.status(400).json({ error: "Missing rowId" });
      await updateRow(safeTableName, rowId as string, req.body || {});
      res.json({ ok: true });
    } else if (req.method === "DELETE") {
      if (!rowId) return res.status(400).json({ error: "Missing rowId" });
      await deleteRow(safeTableName, rowId as string);
      res.json({ ok: true });
    } else {
      res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
}
