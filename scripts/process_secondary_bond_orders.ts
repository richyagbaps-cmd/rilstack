// Node.js script to process secondary market bond orders
import { prisma } from "../src/lib/prisma";
import { investmentEvents } from "../src/lib/events";

async function processSecondaryBondOrders() {
  // Find all pending_broker orders for secondary bonds
  const orders = await prisma.investmentOrder.findMany({
    where: { status: "pending_broker" },
    include: { product: true, user: true },
  });
  for (const order of orders) {
    // Retry broker API up to 3 times with exponential backoff
    let attempts = 0,
      brokerSuccess = false;
    let tradeConfirmation = null;
    while (attempts < 3 && !brokerSuccess) {
      try {
        // Simulate broker API call (replace with real API call)
        brokerSuccess = Math.random() > 0.2; // 80% fill rate
        if (brokerSuccess) {
          tradeConfirmation = JSON.stringify({
            price: 102.5,
            accruedInterest: 1200,
            settlementDate: new Date(Date.now() + 2 * 86400000),
          });
        } else {
          throw new Error("Broker API failed");
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
    if (brokerSuccess) {
      await prisma.investmentOrder.update({
        where: { id: order.id },
        data: {
          status: "executed",
          executedAt: new Date(),
          tradeConfirmation,
        },
      });
      // Emit InvestmentExecuted event for post-execution updates
      investmentEvents.emit("InvestmentExecuted", {
        userId: order.userId,
        productId: order.productId,
        amount: order.amount,
        quantity: order.amount, // For bonds, quantity is amount
        purchaseDate: new Date(),
        currentValue: order.amount,
      });
    } else {
      await prisma.investmentOrder.update({
        where: { id: order.id },
        data: {
          status: "failed",
          failureReason: "Broker API timeout or no liquidity",
        },
      });
      // Refund wallet on failure
      await prisma.user.update({
        where: { id: order.userId },
        data: { wallet_balance: { increment: order.amount } },
      });
      // Emit InvestmentFailed event (optional)
      investmentEvents.emit("InvestmentFailed", {
        userId: order.userId,
        productId: order.productId,
        amount: order.amount,
        reason: "Broker API timeout or no liquidity",
      });
    }
  }
  await prisma.$disconnect();
  console.log("Secondary bond order processing complete");
}

processSecondaryBondOrders().catch((e) => {
  console.error(e);
  process.exit(1);
});
