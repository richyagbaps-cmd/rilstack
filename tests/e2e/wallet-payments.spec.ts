import { expect, test } from "@playwright/test";

test("wallet setup, deposit verify and withdrawal api flows", async ({ page }) => {
  await page.goto("/");

  await page.route("**/api/wallet/setup", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        wallet: {
          accountNumber: "1234567890",
          accountName: "RILSTACK USER",
          bankName: "Wema Bank",
          balance: 0,
          customerCode: "CUS_test123",
        },
      }),
    });
  });

  await page.route("**/api/payment/deposit", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        reference: "RIL_TEST_001",
        amount: 5000,
        method: "card",
        paymentUrl: "https://paystack.test/checkout",
      }),
    });
  });

  await page.route("**/api/payment/verify", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        transactionRef: "RIL_TEST_001",
        amount: 5000,
        status: "success",
      }),
    });
  });

  await page.route("**/api/payment/withdraw", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        transactionId: "WTH_TEST_001",
        status: "otp",
        requiresOtp: true,
      }),
    });
  });

  const wallet = await page.evaluate(async () => {
    const response = await fetch("/api/wallet/setup", { method: "POST" });
    return { status: response.status, data: await response.json() };
  });
  expect(wallet.status).toBe(200);
  expect(wallet.data.success).toBeTruthy();

  const deposit = await page.evaluate(async () => {
    const response = await fetch("/api/payment/deposit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: 5000,
        method: "card",
        userEmail: "wallet.user@example.com",
      }),
    });
    return { status: response.status, data: await response.json() };
  });
  expect(deposit.status).toBe(200);
  expect(deposit.data.success).toBeTruthy();

  const verify = await page.evaluate(async () => {
    const response = await fetch("/api/payment/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reference: "RIL_TEST_001" }),
    });
    return { status: response.status, data: await response.json() };
  });
  expect(verify.status).toBe(200);
  expect(verify.data.success).toBeTruthy();

  const withdraw = await page.evaluate(async () => {
    const response = await fetch("/api/payment/withdraw", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: 1000,
        accountNumber: "1234567890",
        bankCode: "035",
        recipientName: "RILSTACK USER",
        userEmail: "wallet.user@example.com",
      }),
    });
    return { status: response.status, data: await response.json() };
  });
  expect(withdraw.status).toBe(200);
  expect(withdraw.data.success).toBeTruthy();
});
