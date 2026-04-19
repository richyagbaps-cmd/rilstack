// Next.js API route for SeaTable CRUD
import type { NextApiRequest, NextApiResponse } from "next";
import { getRows, createRow, updateRow, deleteRow } from "@/utils/seatable";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { dtableUuid, tableName, rowId } = req.query;
  if (!dtableUuid || !tableName) {
    res.status(400).json({ error: "Missing dtableUuid or tableName" });
    return;
  }
  try {
    if (req.method === "GET") {
      const data = await getRows(dtableUuid as string, tableName as string);
      res.json(data);
    } else if (req.method === "POST") {
      const data = await createRow(
        dtableUuid as string,
        tableName as string,
        req.body,
      );
      res.json(data);
    } else if (req.method === "PUT") {
      if (!rowId) return res.status(400).json({ error: "Missing rowId" });
      const data = await updateRow(
        dtableUuid as string,
        tableName as string,
        rowId as string,
        req.body,
      );
      res.json(data);
    } else if (req.method === "DELETE") {
      if (!rowId) return res.status(400).json({ error: "Missing rowId" });
      const data = await deleteRow(
        dtableUuid as string,
        tableName as string,
        rowId as string,
      );
      res.json(data);
    } else {
      res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
}
