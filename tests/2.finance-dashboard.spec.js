// ============================================================
// Sanity Check - Finance Dashboard
// URL  : /finance
// Tool : Playwright
// ============================================================
//
// HOW TO RUN:
//   npx playwright test tests/2.finance-dashboard.spec.js
//   npx playwright test tests/2.finance-dashboard.spec.js --ui
//   npx playwright test tests/2.finance-dashboard.spec.js --grep "General Health"
//
// NOTE:
//   Auth is handled by global.setup.js (runs once before all tests).
//   Session is saved to playwright/.auth/user.json and reused here.
//   No login() function needed in this file.
// ============================================================

require("dotenv").config();

const { test, expect } = require("@playwright/test");

const BASE_URL =
  process.env.BASE_URL || "https://web-bnj-ai-dev-8fdaab.azurewebsites.net";
const DASHBOARD_URL = `${BASE_URL}/finance`;
const SECTION_SELECTOR =
  "section, article, [role='region'], [class*='card'], [class*='section'], [class*='widget'], [class*='panel']";
const TIMESTAMP_REGEX = /\b\d+\s*(days|hours|minutes|seconds)\s*ago\b/i;
const PROGRESS_BAR_SELECTOR = [
  '[role="progressbar"]',
  '[class*="progress"]',
  '[class*="bar"]',
  '[class*="gradient"]',
  '[class*="from-red"]',
  '[class*="to-yellow"]',
].join(", ");
const AI_SURFACE_SELECTOR = [
  '[role="dialog"]',
  '[aria-modal="true"]',
  '[class*="drawer"]',
  '[class*="modal"]',
  '[class*="chat"] textarea',
  '[class*="chat"] input',
  'textarea[placeholder*="Ask"]',
  'textarea[placeholder*="Type"]',
  'input[placeholder*="Ask"]',
  'input[placeholder*="Type"]',
].join(", ");

const FINANCE_METRIC_CARDS = [
  { id: "TC-FIN-009", title: "A/R & A/P Score" },
  { id: "TC-FIN-010", title: "Profit /Loss Score" },
  { id: "TC-FIN-011", title: "Cashflow Score" },
];

const ACTION_TASKS = [
  { id: "TC-FIN-018", title: "Health Score Warning" },
  {
    id: "TC-FIN-019",
    title: "Forecast vs Actual Variance Exceeded",
  },
  { id: "TC-FIN-020", title: "Inventory Shortage Projected" },
  { id: "TC-FIN-021", title: "Cashflow Shortage Detected" },
  { id: "TC-FIN-022", title: "Sudden Financial Change Detected" },
];

async function expectDashboardReady(page) {
  await expect(page).toHaveURL(/finance/, { timeout: 30000 });
  await expect(
    page.getByText("General Health (ICS)", { exact: false })
  ).toBeVisible({ timeout: 30000 });
}

async function goToDashboard(page) {
  await page.goto(DASHBOARD_URL, { waitUntil: "domcontentloaded" });
  await expectDashboardReady(page);
}

async function getContainerByText(page, text) {
  const container = page
    .locator(SECTION_SELECTOR)
    .filter({ hasText: text })
    .first();

  if ((await container.count()) > 0) {
    return container;
  }

  return page.locator("body");
}

async function expectAiSurfaceToOpen(page) {
  const aiSurface = page.locator(AI_SURFACE_SELECTOR).first();
  await expect(aiSurface).toBeVisible({ timeout: 15000 });
}

function isCriticalConsoleError(message) {
  return !/Failed to load resource: the server responded with a status of 404/i.test(
    message
  );
}

test.describe("Finance Dashboard - Sanity Check", () => {
  test.beforeEach(async ({ page }) => {
    await goToDashboard(page);
  });

  test.describe("Page Load & Navigation", () => {
    test("TC-FIN-001 | Dashboard page loads successfully", async ({ page }) => {
      await expect(page).toHaveURL(/finance/);
      await expect(page).toHaveTitle(/.+/);
      console.log("Finance page loaded successfully");
    });

    test("TC-FIN-002 | Benjamin & Joseph logo is visible", async ({ page }) => {
      const logo = page
        .locator('header img, img[alt*="Benjamin"], img[alt*="Joseph"], .logo')
        .first();

      await expect(logo).toBeVisible({ timeout: 15000 });
      console.log("Logo visible");
    });
  });

  test.describe("General Health (ICS)", () => {
    test("TC-FIN-003 | General Health section is visible", async ({ page }) => {
      const generalHealth = await getContainerByText(
        page,
        "General Health (ICS)"
      );

      await expect(
        generalHealth.getByText("General Health (ICS)", { exact: false })
      ).toBeVisible({ timeout: 15000 });
      console.log("General Health (ICS) section visible");
    });

    test("TC-FIN-004 | General Health score is displayed (format: XX/100)", async ({
      page,
    }) => {
      const generalHealth = await getContainerByText(
        page,
        "General Health (ICS)"
      );
      const scoreText = generalHealth
        .getByText(/\b\d{1,3}\s*\/\s*100\b/)
        .first();

      await expect(scoreText).toBeVisible({ timeout: 15000 });
      console.log("General Health score displayed");
    });

    test("TC-FIN-005 | General Health progress bar is rendered", async ({
      page,
    }) => {
      const generalHealth = await getContainerByText(
        page,
        "General Health (ICS)"
      );
      const progressBar = generalHealth.locator(PROGRESS_BAR_SELECTOR).first();

      await expect(progressBar).toBeVisible({ timeout: 15000 });
      console.log("General Health progress bar visible");
    });
  });

  test.describe("Current Financial Health", () => {
    test("TC-FIN-006 | Current Financial Health section is visible", async ({
      page,
    }) => {
      const financialHealth = await getContainerByText(
        page,
        "Current Financial Health"
      );

      await expect(
        financialHealth.getByText("Current Financial Health", { exact: false })
      ).toBeVisible({ timeout: 15000 });
      console.log("Current Financial Health section visible");
    });

    test("TC-FIN-007 | Current Financial Health score is displayed (format: XX/100)", async ({
      page,
    }) => {
      const financialHealth = await getContainerByText(
        page,
        "Current Financial Health"
      );
      const scoreText = financialHealth
        .getByText(/\b\d{1,3}\s*\/\s*100\b/)
        .first();

      await expect(scoreText).toBeVisible({ timeout: 15000 });
      console.log("Current Financial Health score displayed");
    });

    test("TC-FIN-008 | Current Financial Health progress bar is rendered", async ({
      page,
    }) => {
      const financialHealth = await getContainerByText(
        page,
        "Current Financial Health"
      );
      const progressBar = financialHealth
        .locator(PROGRESS_BAR_SELECTOR)
        .first();

      await expect(progressBar).toBeVisible({ timeout: 15000 });
      console.log("Current Financial Health progress bar visible");
    });
  });

  test.describe("Finance Metric Cards", () => {
    for (const { id, title } of FINANCE_METRIC_CARDS) {
      test(`${id} | ${title} card is visible`, async ({ page }) => {
        const card = await getContainerByText(page, title);

        await expect(card.getByText(title, { exact: false })).toBeVisible({
          timeout: 15000,
        });
        console.log(`${title} card visible`);
      });
    }

    test("TC-FIN-012 | All 3 finance metric donut charts are rendered", async ({
      page,
    }) => {
      for (const { title } of FINANCE_METRIC_CARDS) {
        const card = await getContainerByText(page, title);
        const chart = card
          .locator(
            'svg, canvas, [class*="donut"], [class*="chart"], [class*="radial"]'
          )
          .first();

        await expect(chart).toBeVisible({ timeout: 15000 });
      }

      console.log("Found chart element(s) for all finance metric cards");
    });

    test("TC-FIN-013 | Finance metric scores are numeric values", async ({
      page,
    }) => {
      const scoreRegex = /^\d{1,3}$/;
      const visibleScores = [];

      for (const { title } of FINANCE_METRIC_CARDS) {
        const card = await getContainerByText(page, title);
        const score = card.getByText(scoreRegex).first();

        await expect(score).toBeVisible({ timeout: 15000 });
        visibleScores.push(score);
      }

      expect(visibleScores).toHaveLength(3);
      console.log("Found numeric score(s) for all finance metric cards");
    });
  });

  test.describe("Recent Activity", () => {
    test("TC-FIN-014 | Recent Activity section is visible", async ({
      page,
    }) => {
      const section = await getContainerByText(page, "Recent Activity");

      await expect(
        section.getByText("Recent Activity", { exact: false })
      ).toBeVisible({ timeout: 15000 });
      console.log("Recent Activity section visible");
    });

    test("TC-FIN-015 | Recent Activity list has at least 1 item", async ({
      page,
    }) => {
      const section = await getContainerByText(page, "Recent Activity");
      const items = section.getByText(TIMESTAMP_REGEX);

      await expect(items.first()).toBeVisible({ timeout: 15000 });
      expect(await items.count()).toBeGreaterThanOrEqual(1);
      console.log("Found recent activity item(s)");
    });

    test("TC-FIN-016 | Recent Activity items display timestamps", async ({
      page,
    }) => {
      const section = await getContainerByText(page, "Recent Activity");
      const timestamps = section.getByText(TIMESTAMP_REGEX);

      await expect(timestamps.first()).toBeVisible({ timeout: 15000 });
      expect(await timestamps.count()).toBeGreaterThanOrEqual(1);
      console.log("Found timestamp(s) in Recent Activity");
    });
  });

  test.describe("Task Requiring Actions", () => {
    test("TC-FIN-017 | Task Requiring Actions section is visible", async ({
      page,
    }) => {
      const section = await getContainerByText(page, "Task Requiring Actions");

      await expect(
        section.getByText("Task Requiring Actions", { exact: false })
      ).toBeVisible({ timeout: 15000 });
      console.log("Task Requiring Actions section visible");
    });

    for (const { id, title } of ACTION_TASKS) {
      test(`${id} | ${title} task is listed`, async ({ page }) => {
        const section = await getContainerByText(
          page,
          "Task Requiring Actions"
        );

        await expect(section.getByText(title, { exact: false })).toBeVisible({
          timeout: 15000,
        });
        console.log(`${title} task visible`);
      });
    }
  });

  test.describe("Chat with AI", () => {
    test("TC-FIN-023 | Chat with AI button is visible", async ({ page }) => {
      await expect(
        page.getByRole("button", { name: /Chat with AI/i }).first()
      ).toBeVisible({ timeout: 15000 });
      console.log("Chat with AI button visible");
    });

    test("TC-FIN-024 | Chat with AI opens an AI interface", async ({
      page,
    }) => {
      const chatWithAI = page
        .getByRole("button", { name: /Chat with AI/i })
        .first();

      await expect(chatWithAI).toBeEnabled({ timeout: 15000 });
      await chatWithAI.click({ force: true });
      await expectAiSurfaceToOpen(page);
      console.log("Chat with AI opened an AI interface");
    });
  });
});

test.describe("Finance Dashboard - Performance", () => {
  test("TC-FIN-025 | Dashboard fully loads within 15 seconds", async ({
    page,
  }) => {
    const start = Date.now();

    await goToDashboard(page);

    const duration = Date.now() - start;
    console.log(`Finance dashboard load time: ${duration}ms`);
    expect(duration).toBeLessThan(15000);
    console.log("Finance dashboard loaded within 15 seconds");
  });

  test("TC-FIN-026 | Dashboard screenshot (visual baseline)", async ({
    page,
  }) => {
    await goToDashboard(page);
    await page.screenshot({
      path: "test-results/finance-dashboard-baseline.png",
      fullPage: true,
    });
    console.log(
      "Screenshot saved: test-results/finance-dashboard-baseline.png"
    );
  });

  test("TC-FIN-027 | Dashboard loads without critical console errors", async ({
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

    await goToDashboard(page);

    expect(consoleErrors).toEqual([]);
    expect(pageErrors).toEqual([]);
    console.log("No critical console errors detected");
  });
});
