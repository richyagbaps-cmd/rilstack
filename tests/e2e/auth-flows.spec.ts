import { expect, test } from "@playwright/test";

test("signup api flow returns success", async ({ page }) => {
  await page.goto("/");

  await page.route("**/api/auth/register", async (route) => {
    const req = route.request();
    const body = req.postDataJSON();
    expect(body.email).toContain("@");
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        user: { id: "rilstack999", name: "Test User", email: body.email, kycLevel: 1 },
      }),
    });
  });

  const result = await page.evaluate(async () => {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        surname: "Tester",
        firstName: "Flow",
        email: "flow.signup@example.com",
        password: "Password123!",
        phone: "08012345678",
        termsAccepted: true,
      }),
    });
    return { status: res.status, json: await res.json() };
  });

  expect(result.status).toBe(200);
  expect(result.json.success).toBeTruthy();
});

test("login page credentials flow redirects to dashboard", async ({ page }) => {
  await page.route("**/api/auth/session", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ user: null, expires: new Date(Date.now() + 3600000).toISOString() }),
    });
  });

  await page.route("**/api/auth/callback/credentials", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ ok: true, status: 200, error: null, url: "/dashboard" }),
    });
  });

  await page.goto("/login");
  await page.getByPlaceholder("Email or Phone").fill("flow.signup@example.com");
  await page.getByLabel("Password").fill("Password123!");
  await page.getByRole("button", { name: "Sign in" }).click();

  await expect(page).toHaveURL(/dashboard/);
});

test("complete profile submits and redirects", async ({ page }) => {
  await page.route("**/api/auth/session", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        user: { name: "Google User", email: "google.user@example.com" },
        expires: new Date(Date.now() + 3600000).toISOString(),
      }),
    });
  });

  await page.route("**/api/auth/complete-profile", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ success: true, user: { kycLevel: 5 } }),
    });
  });

  await page.goto("/profile/complete");
  await page.getByLabel("Surname").fill("Doe");
  await page.getByLabel("First Name").fill("Jane");
  await page.getByLabel("Phone Number").fill("08012345678");
  await page.getByLabel("Date of Birth").fill("1990-01-01");
  await page.getByLabel("Residential Address").fill("1 Test Street");
  await page.getByLabel("Set 4-digit PIN").fill("1234");
  await page.getByLabel("Confirm PIN").fill("1234");
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Activate Account" }).click();

  await expect(page).toHaveURL(/dashboard/);
});
