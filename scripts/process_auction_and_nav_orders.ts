// Node.js script to process auction-based and mutual fund NAV orders
import { prisma } from "../src/lib/prisma";
import { investmentEvents } from "../src/lib/events";

async function processAuctionOrders() {
  // Find all pending_auction orders for products whose auction has closed
  const now = new Date();
  const auctionProducts = await prisma.product.findMany({
    where: { type: { in: ["tbill", "bond"] }, active: true },
  });
  for (const product of auctionProducts) {
    // Example: Assume auctionClose is stored in product (add to schema if needed)
    // if (now < product.auctionClose) continue;
    const orders = await prisma.investmentOrder.findMany({
      where: { productId: product.id, status: "pending_auction" },
    });
    if (!orders.length) continue;
    // Pro-rata allocation if oversubscribed
    const totalRequested = orders.reduce((sum, o) => sum + o.amount, 0);
    let allocationRatio = 1;
    if (totalRequested > product.available_for_purchase) {
      allocationRatio = product.available_for_purchase / totalRequested;
    }
    for (const order of orders) {
      let attempts = 0,
        success = false,
        allocated = Math.floor(order.amount * allocationRatio);
      while (attempts < 3 && !success) {
        try {
          // Simulate auction allocation (replace with real logic if needed)
          if (allocated > 0) {
            await prisma.investmentOrder.update({
              where: { id: order.id },
              data: {
                allocation: allocated,
                status: "executed",
                executedAt: now,
                discountRate: 0, // TODO: fetch actual auction result
              },
            });
            investmentEvents.emit("InvestmentExecuted", {
              userId: order.userId,
              productId: order.productId,
              amount: allocated,
              quantity: allocated,
              purchaseDate: now,
              currentValue: allocated,
            });
            success = true;
          } else {
            throw new Error("No allocation");
          }
        } catch (e) {
          attempts++;
          if (attempts < 3) {
            await new Promise((res) =>
              setTimeout(res, Math.pow(2, attempts - 1) * 1000),
            );
          }
        }
      }
      if (!success) {
        await prisma.investmentOrder.update({
          where: { id: order.id },
          data: {
            status: "failed",
            failureReason: "Auction allocation failed",
          },
        });
        await prisma.user.update({
          where: { id: order.userId },
          data: { wallet_balance: { increment: order.amount } },
        });
        investmentEvents.emit("InvestmentFailed", {
          userId: order.userId,
          productId: order.productId,
          amount: order.amount,
          reason: "Auction allocation failed",
        });
      }
    }
  }
}

async function processNavOrders() {
  // Find all pending_nav orders for mutual funds after NAV cut-off
  const now = new Date();
  const navFunds = await prisma.product.findMany({
    where: { type: "mutual-fund", active: true },
  });
  for (const fund of navFunds) {
    // Example: Assume navCutoff is stored in product (add to schema if needed)
    // if (now < fund.navCutoff) continue;
    const orders = await prisma.investmentOrder.findMany({
      where: { productId: fund.id, status: "pending_nav" },
    });
    if (!orders.length) continue;
    // Fetch NAV (mocked here)
    const nav = 2500; // TODO: fetch real NAV
    for (const order of orders) {
      let attempts = 0,
        success = false,
        units = order.amount / nav;
      while (attempts < 3 && !success) {
        try {
          // Simulate NAV allocation (replace with real logic if needed)
          if (units > 0) {
            await prisma.investmentOrder.update({
              where: { id: order.id },
              data: {
                navUsed: nav,
                allocation: units,
                status: "executed",
                executedAt: now,
              },
            });
            investmentEvents.emit("InvestmentExecuted", {
              userId: order.userId,
              productId: order.productId,
              amount: order.amount,
              quantity: units,
              purchaseDate: now,
              currentValue: order.amount,
            });
            success = true;
          } else {
            throw new Error("NAV allocation failed");
          }
        } catch (e) {
          attempts++;
          if (attempts < 3) {
            await new Promise((res) =>
              setTimeout(res, Math.pow(2, attempts - 1) * 1000),
            );
          }
        }
      }
      if (!success) {
        await prisma.investmentOrder.update({
          where: { id: order.id },
          data: {
            status: "failed",
            failureReason: "NAV allocation failed",
          },
        });
        await prisma.user.update({
          where: { id: order.userId },
          data: { wallet_balance: { increment: order.amount } },
        });
        investmentEvents.emit("InvestmentFailed", {
          userId: order.userId,
          productId: order.productId,
          amount: order.amount,
          reason: "NAV allocation failed",
        });
      }
    }
  }
}

async function main() {
  await processAuctionOrders();
  await processNavOrders();
  console.log("Order processing complete");
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
