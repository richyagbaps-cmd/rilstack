import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });
  const { identifier } = req.body;
  if (!identifier) return res.status(400).json({ error: "Missing identifier" });
  // Simulate sending reset link (email/SMS)
  // In production, look up user and send real email/SMS with a secure token
  await new Promise((r) => setTimeout(r, 500));
  return res.status(200).json({ success: true });
}
