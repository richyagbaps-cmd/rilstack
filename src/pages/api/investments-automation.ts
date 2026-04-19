// This is a backend simulation for investment automation and flexible withdrawal logic.
import { NextApiRequest, NextApiResponse } from "next";

// Demo admin-configured products
const products = [
  {
    key: "fixed",
    name: "Fixed Deposit",
    type: "fixed",
    rate: 0.18,
    penalty: 0,
  },
  {
    key: "daily",
    name: "Daily Interest",
    type: "daily",
    rate: 0.12,
    penalty: 0,
  },
  {
    key: "flex",
    name: "Flexible Bond",
    type: "flexible",
    rate: 0.1,
    penalty: 0.05,
  }, // 5% penalty
];

// Demo user investments
let investments = [
  {
    id: 1,
    product: "flex",
    amount: 10000,
    investedAt: "2026-03-01",
    maturity: "2026-09-01",
    status: "active",
    returns: 0,
  },
];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const { action, id, pin } = req.body;
    // Simulate PIN check
    if (!/^\d{4,6}$/.test(pin))
      return res.status(400).json({ error: "Invalid PIN" });
    const inv = investments.find((i) => i.id === id);
    if (!inv) return res.status(404).json({ error: "Investment not found" });
    const prod = products.find((p) => p.key === inv.product);
    if (!prod) return res.status(404).json({ error: "Product not found" });
    // Automated maturity
    const now = new Date();
    const mat = new Date(inv.maturity);
    if (action === "mature" && now >= mat && inv.status === "active") {
      let finalReturn = 0;
      if (prod.type === "fixed") finalReturn = inv.amount * prod.rate;
      if (prod.type === "daily") {
        const days = Math.floor(
          (now.getTime() - new Date(inv.investedAt).getTime()) /
            (1000 * 60 * 60 * 24),
        );
        finalReturn = inv.amount * (Math.pow(1 + prod.rate / 365, days) - 1);
      }
      inv.status = "matured";
      inv.returns = Math.round(finalReturn);
      // Simulate adding to savings and notification
      return res.json({
        matured: true,
        amount: inv.amount + inv.returns,
        message: `Your investment in ${prod.name} has matured. ₦${inv.amount + inv.returns} added to savings.`,
      });
    }
    // Early withdrawal for flexible
    if (
      action === "withdraw" &&
      prod.type === "flexible" &&
      inv.status === "active"
    ) {
      const penalty = Math.round(inv.amount * prod.penalty);
      const net = inv.amount - penalty;
      inv.status = "withdrawn";
      return res.json({
        withdrawn: true,
        penalty,
        net,
        message: `Early withdrawal: ₦${penalty} penalty, ₦${net} returned to savings.`,
      });
    }
    return res.status(400).json({ error: "Invalid action or status" });
  }
  res.status(405).json({ error: "Method not allowed" });
}
