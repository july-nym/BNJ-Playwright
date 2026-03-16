// ============================================================
// Sanity Check - User Management
// URL  : /user-management
// Tool : Playwright
// ============================================================
//
// HOW TO RUN:
//   npx playwright test tests/6.user-management.spec.js
//   npx playwright test tests/6.user-management.spec.js --ui
//   npx playwright test tests/6.user-management.spec.js --grep "User Table"
//
// NOTE:
//   Auth is handled by global.setup.js (runs once before all tests).
//   Session is saved to playwright/.auth/user.json and reused here.
// ============================================================

require("dotenv").config();

const { test, expect } = require("@playwright/test");

const BASE_URL =
  process.env.BASE_URL || "https://web-bnj-ai-dev-8fdaab.azurewebsites.net";
const PAGE_URL = `${BASE_URL}/user-management`;
const TABLE_HEADERS = ["Name", "Email", "Role", "Status", "Action"];
async function goToUserManagement(page) {
  await page.goto(PAGE_URL, { waitUntil: "domcontentloaded" });
  await expect(page).toHaveURL(/user-management/, { timeout: 30000 });
  await expect(
    page.getByRole("heading", { name: /User Management/i }).first()
  ).toBeVisible({ timeout: 30000 });
  await expect(
    page.getByPlaceholder("Search user name or email")
  ).toBeVisible({ timeout: 30000 });
}

function getUserTable(page) {
  return page.locator("table.w-full").first();
}

function isCriticalConsoleError(message) {
  return !/Failed to load resource: the server responded with a status of 404/i.test(
    message
  );
}

test.describe("User Management - Sanity Check", () => {
  test.beforeEach(async ({ page }) => {
    await goToUserManagement(page);
  });

  test.describe("Page Load & Navigation", () => {
    test("TC-UM-001 | User Management page loads successfully", async ({
      page,
    }) => {
      await expect(page).toHaveURL(/user-management/);
      await expect(page).toHaveTitle(/.+/);
      console.log("User Management page loaded successfully");
    });

    test("TC-UM-002 | Benjamin & Joseph logo is visible", async ({ page }) => {
      const logo = page
        .locator('header img, img[alt*="Benjamin"], img[alt*="Joseph"], .logo')
        .first();

      await expect(logo).toBeVisible({ timeout: 15000 });
      console.log("Logo visible");
    });

    test("TC-UM-003 | Page heading and description are visible", async ({
      page,
    }) => {
      await expect(
        page.getByRole("heading", { name: /User Management/i }).first()
      ).toBeVisible({ timeout: 15000 });
      await expect(
        page.getByText(
          "Manage user accounts and set access permissions for Financial and Operational dashboards.",
          { exact: false }
        )
      ).toBeVisible({ timeout: 15000 });
      console.log("Page heading and description visible");
    });
  });

  test.describe("Top Actions", () => {
    test("TC-UM-004 | Add new user button is visible", async ({ page }) => {
      await expect(
        page.getByRole("button", { name: /Add new user/i })
      ).toBeVisible({ timeout: 15000 });
      console.log("Add new user button visible");
    });

    test("TC-UM-005 | Search input is visible with correct placeholder", async ({
      page,
    }) => {
      const searchInput = page.getByPlaceholder("Search user name or email");

      await expect(searchInput).toBeVisible({ timeout: 15000 });
      await expect(searchInput).toHaveAttribute(
        "placeholder",
        "Search user name or email"
      );
      console.log("Search input visible");
    });

    test("TC-UM-006 | Search input accepts text", async ({ page }) => {
      const searchInput = page.getByPlaceholder("Search user name or email");

      await searchInput.fill("leo.nguyen@deeeplabs.com");
      await expect(searchInput).toHaveValue("leo.nguyen@deeeplabs.com");
      console.log("Search input accepts text");
    });
  });

  test.describe("User Table", () => {
    test("TC-UM-007 | User table headers are visible", async ({ page }) => {
      const table = getUserTable(page);

      for (const header of TABLE_HEADERS) {
        await expect(
          table.getByText(header, { exact: true }).first()
        ).toBeVisible({ timeout: 15000 });
      }

      console.log("User table headers visible");
    });

    test("TC-UM-008 | User table shows at least one record", async ({
      page,
    }) => {
      const rows = getUserTable(page).locator("tbody tr");

      await expect(rows.first()).toBeVisible({ timeout: 15000 });
      expect(await rows.count()).toBeGreaterThanOrEqual(1);
      console.log("User table has at least one record");
    });

    test("TC-UM-009 | Sample user names are visible in the table", async ({
      page,
    }) => {
      const nameCells = getUserTable(page).locator("tbody tr td:first-child");

      await expect(nameCells.first()).toBeVisible({ timeout: 15000 });
      expect(await nameCells.count()).toBeGreaterThanOrEqual(3);

      for (let index = 0; index < Math.min(3, await nameCells.count()); index += 1) {
        await expect(nameCells.nth(index)).not.toHaveText(/^\s*$/);
      }

      console.log("Visible user names rendered in table");
    });

    test("TC-UM-010 | User table contains email values", async ({ page }) => {
      const emails = page.getByText(/.+@.+\..+/).filter({ hasNotText: "Chat with AI" });

      await expect(emails.first()).toBeVisible({ timeout: 15000 });
      expect(await emails.count()).toBeGreaterThanOrEqual(3);
      console.log("User table contains email values");
    });

    test("TC-UM-011 | User table contains role values", async ({ page }) => {
      const tableBody = getUserTable(page).locator("tbody").first();

      await expect(
        tableBody.getByText("ADMIN", { exact: true }).first()
      ).toBeVisible({
        timeout: 15000,
      });
      await expect(
        tableBody.getByText("CEO", { exact: true }).first()
      ).toBeVisible({ timeout: 15000 });
      console.log("User table contains role values");
    });

    test("TC-UM-012 | Active status badges are visible", async ({ page }) => {
      const activeBadges = page.getByText("Active", { exact: true });

      await expect(activeBadges.first()).toBeVisible({ timeout: 15000 });
      expect(await activeBadges.count()).toBeGreaterThanOrEqual(3);
      console.log("Active status badges visible");
    });

    test("TC-UM-013 | Edit actions are visible", async ({ page }) => {
      const editButtons = page.locator('button[title="Edit"]');

      await expect(editButtons.first()).toBeVisible({ timeout: 15000 });
      expect(await editButtons.count()).toBeGreaterThanOrEqual(1);
      console.log("Edit actions visible");
    });

    test("TC-UM-014 | Delete actions are visible", async ({ page }) => {
      const deleteButtons = page.locator('button[title="Delete"]');

      await expect(deleteButtons.first()).toBeVisible({ timeout: 15000 });
      expect(await deleteButtons.count()).toBeGreaterThanOrEqual(1);
      console.log("Delete actions visible");
    });
  });

  test.describe("Pagination & Summary", () => {
    test("TC-UM-015 | User summary text is visible", async ({ page }) => {
      await expect(
        page.getByText(/Showing \d+ to \d+ of \d+ users/i)
      ).toBeVisible({ timeout: 15000 });
      console.log("User summary text visible");
    });

    test("TC-UM-016 | Pagination indicator is visible", async ({ page }) => {
      await expect(page.getByText(/Page \d+ of \d+/i)).toBeVisible({
        timeout: 15000,
      });
      console.log("Pagination indicator visible");
    });
  });

  test.describe("Chat with AI", () => {
    test("TC-UM-017 | Chat with AI button is visible", async ({ page }) => {
      await expect(
        page.getByRole("button", { name: /Chat with AI/i }).first()
      ).toBeVisible({ timeout: 15000 });
      console.log("Chat with AI button visible");
    });
  });
});

test.describe("User Management - Performance", () => {
  test("TC-UM-018 | User Management page fully loads within 15 seconds", async ({
    page,
  }) => {
    const start = Date.now();

    await goToUserManagement(page);

    const duration = Date.now() - start;
    console.log(`User Management load time: ${duration}ms`);
    expect(duration).toBeLessThan(15000);
    console.log("User Management loaded within 15 seconds");
  });

  test("TC-UM-019 | User Management screenshot (visual baseline)", async ({
    page,
  }) => {
    await goToUserManagement(page);
    await page.screenshot({
      path: "test-results/user-management-baseline.png",
      fullPage: true,
    });
    console.log("Screenshot saved: test-results/user-management-baseline.png");
  });

  test("TC-UM-020 | User Management page loads without critical console errors", async ({
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

    await goToUserManagement(page);

    expect(consoleErrors).toEqual([]);
    expect(pageErrors).toEqual([]);
    console.log("No critical console errors detected");
  });
});
