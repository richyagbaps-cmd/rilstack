import { expect, test } from "@playwright/test";

async function mockSettingsContext(page: Parameters<typeof test>[0]["page"]) {
  await page.route("**/api/auth/session", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        user: { name: "Settings User", email: "settings@example.com" },
        expires: new Date(Date.now() + 3600000).toISOString(),
      }),
    });
  });

  await page.route("**/api/settings/profile", async (route) => {
    if (route.request().method() === "GET") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          profile: {
            fullName: "Settings User",
            phone: "08012345678",
            email: "settings@example.com",
            dateOfBirth: "1991-05-20",
            gender: "F",
            stateOfOrigin: "Lagos",
            lga: "Ikeja",
            address: "10 Sample Road",
            nin: "12345678901",
            idType: "nin",
            idNumber: "12345678901",
            occupation: "Engineer",
            incomeRange: "N500,000 - N1,000,000",
            sourceOfFunds: "Salary",
            bvn: "12345678901",
          },
        }),
      });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ success: true, profile: route.request().postDataJSON() }),
    });
  });

  await page.route("**/api/settings/preferences", async (route) => {
    if (route.request().method() === "GET") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          preferences: {
            privacyMode: false,
            biometric: false,
            loginAlerts: true,
            twoFaEnabled: false,
            pushNotifications: true,
            budgetAlerts: true,
            savingsReminders: true,
            investmentUpdates: true,
            promoTips: true,
          },
        }),
      });
      return;
    }

    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ success: true }) });
  });

  await page.route("**/api/settings/password", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ success: true, message: "Password updated successfully." }) });
  });

  await page.route("**/api/settings/pin", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ success: true, message: "PIN updated successfully." }) });
  });

  await page.route("**/api/settings/kyc-documents", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ success: true, message: "KYC documents updated successfully." }) });
  });

  await page.route("**/api/settings/export-data", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ success: true, data: { profile: {} } }) });
  });

  await page.route("**/api/settings/linked-accounts", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ success: true, linkedAccounts: { credentials: true, google: true } }) });
  });
}

test("settings profile persists and actions are enabled", async ({ page }) => {
  await mockSettingsContext(page);
  page.on("dialog", async (dialog) => {
    const message = dialog.message().toLowerCase();
    if (message.includes("current password")) await dialog.accept("Password123!");
    else if (message.includes("new password")) await dialog.accept("Password456!");
    else if (message.includes("confirm new password")) await dialog.accept("Password456!");
    else if (message.includes("current pin")) await dialog.accept("1234");
    else if (message.includes("new pin")) await dialog.accept("5678");
    else if (message.includes("confirm new pin")) await dialog.accept("5678");
    else if (message.includes("selfie")) await dialog.accept("https://cdn.example.com/selfie.jpg");
    else if (message.includes("id document")) await dialog.accept("https://cdn.example.com/id.jpg");
    else await dialog.accept("");
  });

  await page.goto("/settings");
  await page.getByLabel("Full Name").fill("Settings User Updated");
  await page.getByRole("button", { name: "Save Settings" }).click();
  await expect(page.getByText("Settings saved successfully.")).toBeVisible();

  await page.getByRole("button", { name: "Upload missing docs" }).click();
  await page.getByRole("button", { name: "Change Password" }).click();
  await page.getByRole("button", { name: "Change PIN" }).click();
  await page.getByRole("button", { name: "Manage Linked Accounts" }).click();
});
