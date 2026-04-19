import { NextApiRequest, NextApiResponse } from "next";

// This is a placeholder. In production, hash PINs and store securely!
let users: any[] = [];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === "POST") {
    const { kyc, pin, termsAccepted } = req.body;
    if (!kyc || !pin || !termsAccepted) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    // Save user (simulate DB)
    users.push({ ...kyc, pin, termsAccepted });
    return res.status(200).json({ success: true });
  }
  res.status(405).json({ error: "Method not allowed" });
}
