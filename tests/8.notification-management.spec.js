// ============================================================
// Sanity Check - Notification Management
// URL  : /notification-management
// Tool : Playwright
// ============================================================
//
// HOW TO RUN:
//   npx playwright test tests/8.notification-management.spec.js
//   npx playwright test tests/8.notification-management.spec.js --ui
//   npx playwright test tests/8.notification-management.spec.js --grep "Scheduled Dashboard Delivery"
//
// NOTE:
//   Auth is handled by global.setup.js (runs once before all tests).
//   Session is saved to playwright/.auth/user.json and reused here.
// ============================================================

require("dotenv").config();

const { test, expect } = require("@playwright/test");

const BASE_URL =
  process.env.BASE_URL || "https://web-bnj-ai-dev-8fdaab.azurewebsites.net";
const PAGE_URL = `${BASE_URL}/notification-management`;
const HEALTH_CATEGORIES = [
  "General",
  "Current Financial",
  "Current Operational",
  "Year-on-Year (YoY)",
  "Profit & Loss",
  "Accounts Receivable / Accounts Payable (AR/AP)",
  "Cashflow",
  "Claims",
  "Patients",
  "Inventory",
];
const DASHBOARD_DELIVERY_ITEMS = [
  "CEO Dashboard",
  "Financial Dashboard",
  "Operations Dashboard",
];

async function goToNotificationManagement(page) {
  await page.goto(PAGE_URL, { waitUntil: "domcontentloaded" });
  await expect(page).toHaveURL(/notification-management/, { timeout: 30000 });
  await expect(
    page.getByRole("heading", { name: /Notification Management/i }).first()
  ).toBeVisible({ timeout: 30000 });
  await expect(
    page.getByRole("button", { name: /Health Score Alerts/i })
  ).toBeVisible({ timeout: 30000 });
}

async function openScheduledDashboardDelivery(page) {
  await page.getByRole("button", { name: /Scheduled Dashboard Delivery/i }).click();
  await expect(
    page.getByText("Configure when dashboard reports are automatically sent", {
      exact: false,
    })
  ).toBeVisible({ timeout: 15000 });
}

function getSectionCard(page, text) {
  return page.locator("div").filter({ hasText: text }).first();
}

function getScheduledDeliveryCard(page, index) {
  return page
    .locator("div.mb-4.border.border-gray-100.rounded-xl.shadow-sm")
    .nth(index);
}

function isCriticalConsoleError(message) {
  return !/Failed to load resource: the server responded with a status of 404/i.test(
    message
  );
}

test.describe("Notification Management - Sanity Check", () => {
  test.beforeEach(async ({ page }) => {
    await goToNotificationManagement(page);
  });

  test.describe("Page Load & Navigation", () => {
    test("TC-NTF-001 | Notification Management page loads successfully", async ({
      page,
    }) => {
      await expect(page).toHaveURL(/notification-management/);
      await expect(page).toHaveTitle(/.+/);
      console.log("Notification Management page loaded successfully");
    });

    test("TC-NTF-002 | Benjamin & Joseph logo is visible", async ({
      page,
    }) => {
      const logo = page
        .locator('header img, img[alt*="Benjamin"], img[alt*="Joseph"], .logo')
        .first();

      await expect(logo).toBeVisible({ timeout: 15000 });
      console.log("Logo visible");
    });

    test("TC-NTF-003 | Page heading and description are visible", async ({
      page,
    }) => {
      await expect(
        page.getByRole("heading", { name: /Notification Management/i }).first()
      ).toBeVisible({ timeout: 15000 });
      await expect(
        page.getByText(
          "Set alert thresholds and delivery rules to ensure the right stakeholders are notified at the right time.",
          { exact: false }
        )
      ).toBeVisible({ timeout: 15000 });
      console.log("Page heading and description visible");
    });
  });

  test.describe("Health Score Alerts", () => {
    test("TC-NTF-004 | Health Score Alerts tab is visible", async ({ page }) => {
      await expect(
        page.getByRole("button", { name: /Health Score Alerts/i })
      ).toBeVisible({ timeout: 15000 });
      console.log("Health Score Alerts tab visible");
    });

    test("TC-NTF-005 | Alert section heading and description are visible", async ({
      page,
    }) => {
      await expect(
        page.getByText("Select health categories to receive alerts", {
          exact: false,
        })
      ).toBeVisible({ timeout: 15000 });
      await expect(
        page.getByText("Health scores are calculated by the system.", {
          exact: false,
        })
      ).toBeVisible({ timeout: 15000 });
      console.log("Alert section heading and description visible");
    });

    test("TC-NTF-006 | General category is checked by default", async ({
      page,
    }) => {
      const generalCheckbox = page.locator('input[type="checkbox"]').first();

      await expect(generalCheckbox).toBeChecked();
      await expect(page.getByText("General", { exact: true })).toBeVisible({
        timeout: 15000,
      });
      console.log("General category checked by default");
    });

    test("TC-NTF-007 | Warning and critical threshold fields are visible", async ({
      page,
    }) => {
      await expect(page.getByText(/warning/i).first()).toBeVisible({
        timeout: 15000,
      });
      await expect(page.getByText(/critical/i).first()).toBeVisible({
        timeout: 15000,
      });
      await expect(page.getByText("Trigger threshold", { exact: false })).toBeVisible(
        { timeout: 15000 }
      );
      await expect(page.getByText("Critical threshold", { exact: false })).toBeVisible(
        { timeout: 15000 }
      );
      console.log("Warning and critical threshold fields visible");
    });

    test("TC-NTF-008 | Threshold inputs show default values", async ({ page }) => {
      const thresholdInputs = page.locator('input[type="text"]');

      await expect(thresholdInputs.nth(0)).toHaveValue("60");
      await expect(thresholdInputs.nth(1)).toHaveValue("50");
      console.log("Threshold inputs show default values");
    });

    test("TC-NTF-009 | Recipients and channels are visible", async ({ page }) => {
      const generalCard = getSectionCard(page, "General");

      await expect(
        generalCard.getByText("Operations, Finance, Admin, CEO", {
          exact: false,
        })
      ).toBeVisible({ timeout: 15000 });
      await expect(
        generalCard.getByText("CEO, Finance, Operations, Admin", {
          exact: false,
        })
      ).toBeVisible({ timeout: 15000 });
      await expect(
        generalCard.getByText("Email, In-App", { exact: false }).first()
      ).toBeVisible({ timeout: 15000 });
      console.log("Recipients and channels visible");
    });

    test("TC-NTF-010 | Health categories list is visible", async ({ page }) => {
      for (const category of HEALTH_CATEGORIES) {
        await expect(page.getByText(category, { exact: true }).first()).toBeVisible({
          timeout: 15000,
        });
      }

      console.log("Health categories list visible");
    });
  });

  test.describe("Scheduled Dashboard Delivery", () => {
    test.beforeEach(async ({ page }) => {
      await openScheduledDashboardDelivery(page);
    });

    test("TC-NTF-011 | Scheduled Dashboard Delivery tab is visible", async ({
      page,
    }) => {
      await expect(
        page.getByRole("button", { name: /Scheduled Dashboard Delivery/i })
      ).toBeVisible({ timeout: 15000 });
      console.log("Scheduled Dashboard Delivery tab visible");
    });

    test("TC-NTF-012 | Scheduled delivery description is visible", async ({
      page,
    }) => {
      await expect(
        page.getByText(
          "Configure when dashboard reports are automatically sent to users.",
          { exact: false }
        )
      ).toBeVisible({ timeout: 15000 });
      console.log("Scheduled delivery description visible");
    });

    test("TC-NTF-013 | Dashboard delivery items are visible", async ({ page }) => {
      for (const item of DASHBOARD_DELIVERY_ITEMS) {
        await expect(page.getByText(item, { exact: true }).first()).toBeVisible({
          timeout: 15000,
        });
      }

      console.log("Dashboard delivery items visible");
    });

    test("TC-NTF-014 | Delivery frequency values are visible", async ({
      page,
    }) => {
      for (const [index] of DASHBOARD_DELIVERY_ITEMS.entries()) {
        const card = getScheduledDeliveryCard(page, index);
        await expect(card.getByText("Weekly", { exact: true })).toBeVisible({
          timeout: 15000,
        });
      }

      console.log("Delivery frequency values visible");
    });

    test("TC-NTF-015 | Dashboard recipient values are visible", async ({
      page,
    }) => {
      const ceoDashboardCard = getScheduledDeliveryCard(page, 0);
      const financialDashboardCard = getScheduledDeliveryCard(page, 1);
      const operationsDashboardCard = getScheduledDeliveryCard(page, 2);

      await expect(
        ceoDashboardCard.getByText("CEO, Admin", { exact: true })
      ).toBeVisible({ timeout: 15000 });
      await expect(
        financialDashboardCard.locator("button").filter({ hasText: /^CEO$/ }).first()
      ).toBeVisible({ timeout: 15000 });
      await expect(
        operationsDashboardCard.locator("button").filter({ hasText: /^CEO$/ }).first()
      ).toBeVisible({ timeout: 15000 });
      console.log("Dashboard recipient values visible");
    });
  });

  test.describe("Footer Actions", () => {
    test("TC-NTF-016 | Cancel and Save changes actions are visible", async ({
      page,
    }) => {
      await expect(page.getByRole("button", { name: /Cancel/i })).toBeVisible({
        timeout: 15000,
      });
      await expect(
        page.getByRole("button", { name: /Save changes/i })
      ).toBeVisible({ timeout: 15000 });
      console.log("Cancel and Save changes actions visible");
    });
  });

  test.describe("Chat with AI", () => {
    test("TC-NTF-017 | Chat with AI button is visible", async ({ page }) => {
      await expect(
        page.getByRole("button", { name: /Chat with AI/i }).first()
      ).toBeVisible({ timeout: 15000 });
      console.log("Chat with AI button visible");
    });
  });
});

test.describe("Notification Management - Performance", () => {
  test("TC-NTF-018 | Notification Management page fully loads within 15 seconds", async ({
    page,
  }) => {
    const start = Date.now();

    await goToNotificationManagement(page);

    const duration = Date.now() - start;
    console.log(`Notification Management load time: ${duration}ms`);
    expect(duration).toBeLessThan(15000);
    console.log("Notification Management loaded within 15 seconds");
  });

  test("TC-NTF-019 | Notification Management screenshot (visual baseline)", async ({
    page,
  }) => {
    await goToNotificationManagement(page);
    await page.screenshot({
      path: "test-results/notification-management-baseline.png",
      fullPage: true,
    });
    console.log(
      "Screenshot saved: test-results/notification-management-baseline.png"
    );
  });

  test("TC-NTF-020 | Notification Management page loads without critical console errors", async ({
    page,
  }) => {
    const consoleErrors = [];
    const pageErrors = [];

    page.on("console", (message) => {
      if (
        message.type() === "error" &&
        isCriticalConsoleError(message.text())
      ) {
        consoleErrors.push(message.text());
      }
    });

    page.on("pageerror", (error) => {
      pageErrors.push(error.message);
    });

    await goToNotificationManagement(page);

    expect(consoleErrors).toEqual([]);
    expect(pageErrors).toEqual([]);
    console.log("No critical console errors detected");
  });
});
