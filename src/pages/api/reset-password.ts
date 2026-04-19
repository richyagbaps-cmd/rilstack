import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });
  const { token, password } = req.body;
  if (!token || !password)
    return res.status(400).json({ error: "Missing token or password" });
  // Simulate password reset (in production, verify token and update user password)
  await new Promise((r) => setTimeout(r, 500));
  return res.status(200).json({ success: true });
}
