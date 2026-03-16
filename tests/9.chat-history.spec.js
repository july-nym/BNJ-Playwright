// ============================================================
// Sanity Check - Chat History
// URL  : /chat-history
// Tool : Playwright
// ============================================================
//
// HOW TO RUN:
//   npx playwright test tests/9.chat-history.spec.js
//   npx playwright test tests/9.chat-history.spec.js --ui
//   npx playwright test tests/9.chat-history.spec.js --grep "History Table"
//
// NOTE:
//   Auth is handled by global.setup.js (runs once before all tests).
//   Session is saved to playwright/.auth/user.json and reused here.
// ============================================================

require("dotenv").config();

const { test, expect } = require("@playwright/test");

const BASE_URL =
  process.env.BASE_URL || "https://web-bnj-ai-dev-8fdaab.azurewebsites.net";
const PAGE_URL = `${BASE_URL}/chat-history`;
const TABLE_HEADERS = ["Date", "Discussion", "Action"];

async function goToChatHistory(page) {
  await page.goto(PAGE_URL, { waitUntil: "domcontentloaded" });
  await expect(page).toHaveURL(/chat-history/, { timeout: 30000 });
  await expect(
    page.getByRole("heading", { name: /Chat History/i }).first()
  ).toBeVisible({ timeout: 30000 });
  await expect(page.getByText("Date range", { exact: false })).toBeVisible({
    timeout: 30000,
  });
}

function getHistoryTable(page) {
  return page.locator("table.w-full").first();
}

function isCriticalConsoleError(message) {
  return !/Failed to load resource: the server responded with a status of 404/i.test(
    message
  );
}

test.describe("Chat History - Sanity Check", () => {
  test.beforeEach(async ({ page }) => {
    await goToChatHistory(page);
  });

  test.describe("Page Load & Navigation", () => {
    test("TC-CHT-001 | Chat History page loads successfully", async ({
      page,
    }) => {
      await expect(page).toHaveURL(/chat-history/);
      await expect(page).toHaveTitle(/.+/);
      console.log("Chat History page loaded successfully");
    });

    test("TC-CHT-002 | Benjamin & Joseph logo is visible", async ({
      page,
    }) => {
      const logo = page
        .locator('header img, img[alt*="Benjamin"], img[alt*="Joseph"], .logo')
        .first();

      await expect(logo).toBeVisible({ timeout: 15000 });
      console.log("Logo visible");
    });

    test("TC-CHT-003 | Page heading and description are visible", async ({
      page,
    }) => {
      await expect(
        page.getByRole("heading", { name: /Chat History/i }).first()
      ).toBeVisible({ timeout: 15000 });
      await expect(
        page.getByText("Easily track and manage your chat history using AI.", {
          exact: false,
        })
      ).toBeVisible({ timeout: 15000 });
      console.log("Page heading and description visible");
    });
  });

  test.describe("Date Range Filter", () => {
    test("TC-CHT-004 | Date range label is visible", async ({ page }) => {
      await expect(page.getByText("Date range", { exact: false })).toBeVisible({
        timeout: 15000,
      });
      console.log("Date range label visible");
    });

    test("TC-CHT-005 | Start and end date inputs are visible", async ({
      page,
    }) => {
      const dateInputs = page.locator('input[type="date"]');

      await expect(dateInputs.nth(0)).toBeVisible({ timeout: 15000 });
      await expect(dateInputs.nth(1)).toBeVisible({ timeout: 15000 });
      console.log("Start and end date inputs visible");
    });

    test("TC-CHT-006 | Date separator is visible", async ({ page }) => {
      const dateSeparator = page.locator('input[type="date"] + span').first();

      await expect(dateSeparator).toBeVisible({ timeout: 15000 });
      await expect(dateSeparator).toHaveText("—");
      console.log("Date separator visible");
    });
  });

  test.describe("History Table", () => {
    test("TC-CHT-007 | History table headers are visible", async ({ page }) => {
      const table = getHistoryTable(page);

      for (const header of TABLE_HEADERS) {
        await expect(
          table.getByText(header, { exact: true }).first()
        ).toBeVisible({ timeout: 15000 });
      }

      console.log("History table headers visible");
    });

    test("TC-CHT-008 | History table shows at least one row", async ({
      page,
    }) => {
      const rows = getHistoryTable(page).locator("tbody tr");

      await expect(rows.first()).toBeVisible({ timeout: 15000 });
      expect(await rows.count()).toBeGreaterThanOrEqual(1);
      console.log("History table has at least one row");
    });

    test("TC-CHT-009 | History table contains date values", async ({
      page,
    }) => {
      const dateCells = getHistoryTable(page).getByText(
        /\b[A-Z][a-z]{2} \d{1,2}, \d{4} at \d{2}:\d{2} (am|pm)\b/i
      );

      await expect(dateCells.first()).toBeVisible({ timeout: 15000 });
      expect(await dateCells.count()).toBeGreaterThanOrEqual(1);
      console.log("History table contains date values");
    });

    test("TC-CHT-010 | Discussion placeholder values are visible", async ({
      page,
    }) => {
      const discussionCells = getHistoryTable(page).getByText("—", {
        exact: true,
      });

      await expect(discussionCells.first()).toBeVisible({ timeout: 15000 });
      expect(await discussionCells.count()).toBeGreaterThanOrEqual(1);
      console.log("Discussion placeholder values visible");
    });

    test("TC-CHT-011 | Delete row actions are visible", async ({ page }) => {
      const deleteButtons = page.locator('button[title="Delete"]');

      await expect(deleteButtons.first()).toBeVisible({ timeout: 15000 });
      expect(await deleteButtons.count()).toBeGreaterThanOrEqual(1);
      console.log("Delete row actions visible");
    });
  });

  test.describe("Summary & Pagination", () => {
    test("TC-CHT-012 | History summary text is visible", async ({ page }) => {
      await expect(
        page.getByText(/Showing \d+ to \d+ of \d+ chat history/i)
      ).toBeVisible({ timeout: 15000 });
      console.log("History summary text visible");
    });

    test("TC-CHT-013 | Pagination indicator is visible", async ({ page }) => {
      await expect(page.getByText(/Page \d+ of \d+/i)).toBeVisible({
        timeout: 15000,
      });
      console.log("Pagination indicator visible");
    });
  });

  test.describe("Chat with AI", () => {
    test("TC-CHT-014 | Chat with AI button is visible", async ({ page }) => {
      await expect(
        page.getByRole("button", { name: /Chat with AI/i }).first()
      ).toBeVisible({ timeout: 15000 });
      console.log("Chat with AI button visible");
    });
  });
});

test.describe("Chat History - Performance", () => {
  test("TC-CHT-015 | Chat History page fully loads within 15 seconds", async ({
    page,
  }) => {
    const start = Date.now();

    await goToChatHistory(page);

    const duration = Date.now() - start;
    console.log(`Chat History load time: ${duration}ms`);
    expect(duration).toBeLessThan(15000);
    console.log("Chat History loaded within 15 seconds");
  });

  test("TC-CHT-016 | Chat History screenshot (visual baseline)", async ({
    page,
  }) => {
    await goToChatHistory(page);
    await page.screenshot({
      path: "test-results/chat-history-baseline.png",
      fullPage: true,
    });
    console.log("Screenshot saved: test-results/chat-history-baseline.png");
  });

  test("TC-CHT-017 | Chat History page loads without critical console errors", async ({
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

    await goToChatHistory(page);

    expect(consoleErrors).toEqual([]);
    expect(pageErrors).toEqual([]);
    console.log("No critical console errors detected");
  });
});
