// ============================================================
// Sanity Check - CEO Dashboard
// URL  : /ceo-dashboard
// Tool : Playwright
// ============================================================
//
// HOW TO RUN:
//   npx playwright test tests/1.ceo-dashboard.spec.js
//   npx playwright test tests/1.ceo-dashboard.spec.js --ui
//   npx playwright test tests/1.ceo-dashboard.spec.js --grep "General Health"
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
const DASHBOARD_URL = `${BASE_URL}/ceo-dashboard`;
const SECTION_SELECTOR =
  "section, article, [role='region'], [class*='card'], [class*='section'], [class*='widget'], [class*='panel']";
const TIMESTAMP_REGEX = /\b\d+\s*(days|hours|minutes|seconds)\s*ago\b/i;
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

const HEALTH_METRIC_CARDS = [
  { id: "TC-CEO-006", title: "Current Operation Health" },
  { id: "TC-CEO-007", title: "Current Financial Health" },
  { id: "TC-CEO-008", title: "YoY Health" },
];

const ACTION_TASKS = [
  { id: "TC-CEO-021", title: "Health Score Warning" },
  {
    id: "TC-CEO-022",
    title: "Forecast vs Actual Variance Exceeded",
  },
  { id: "TC-CEO-023", title: "Inventory Shortage Projected" },
  { id: "TC-CEO-024", title: "Cashflow Shortage Detected" },
];

async function expectDashboardReady(page) {
  await expect(page).toHaveURL(/ceo-dashboard/, { timeout: 30000 });
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

test.describe("CEO Dashboard - Sanity Check", () => {
  test.beforeEach(async ({ page }) => {
    await goToDashboard(page);
  });

  test.describe("Page Load & Navigation", () => {
    test("TC-CEO-001 | Dashboard page loads successfully", async ({ page }) => {
      await expect(page).toHaveURL(/ceo-dashboard/);
      await expect(page).toHaveTitle(/.+/);
      console.log("Page loaded successfully");
    });

    test("TC-CEO-002 | Benjamin & Joseph logo is visible", async ({ page }) => {
      const logo = page
        .locator('header img, img[alt*="Benjamin"], img[alt*="Joseph"], .logo')
        .first();

      await expect(logo).toBeVisible({ timeout: 15000 });
      console.log("Logo visible");
    });
  });

  test.describe("General Health (ICS)", () => {
    test("TC-CEO-003 | General Health section is visible", async ({ page }) => {
      const generalHealth = await getContainerByText(
        page,
        "General Health (ICS)"
      );

      await expect(
        generalHealth.getByText("General Health (ICS)", { exact: false })
      ).toBeVisible({ timeout: 15000 });
      console.log("General Health (ICS) section visible");
    });

    test("TC-CEO-004 | General Health score is displayed (format: XX/100)", async ({
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
      console.log("Health score displayed");
    });

    test("TC-CEO-005 | General Health progress bar is rendered", async ({
      page,
    }) => {
      const generalHealth = await getContainerByText(
        page,
        "General Health (ICS)"
      );
      const progressBar = generalHealth
        .locator('[role="progressbar"], [class*="progress"], [class*="bar"]')
        .first();

      await expect(progressBar).toBeVisible({ timeout: 15000 });
      console.log("Progress bar visible");
    });
  });

  test.describe("Health Metric Cards", () => {
    for (const { id, title } of HEALTH_METRIC_CARDS) {
      test(`${id} | ${title} card is visible`, async ({ page }) => {
        const card = await getContainerByText(page, title);

        await expect(card.getByText(title, { exact: false })).toBeVisible({
          timeout: 15000,
        });
        console.log(`${title} card visible`);
      });
    }

    test("TC-CEO-009 | All 3 health metric donut charts are rendered", async ({
      page,
    }) => {
      for (const { title } of HEALTH_METRIC_CARDS) {
        const card = await getContainerByText(page, title);
        const chart = card
          .locator(
            'svg, canvas, [class*="donut"], [class*="chart"], [class*="radial"]'
          )
          .first();

        await expect(chart).toBeVisible({ timeout: 15000 });
      }

      console.log("Found chart element(s) for all health metric cards");
    });

    test("TC-CEO-010 | Health metric scores are numeric values", async ({
      page,
    }) => {
      const scoreRegex = /^\d{1,3}$/;
      const visibleScores = [];

      for (const { title } of HEALTH_METRIC_CARDS) {
        const card = await getContainerByText(page, title);
        const score = card.getByText(scoreRegex).first();

        await expect(score).toBeVisible({ timeout: 15000 });
        visibleScores.push(score);
      }

      expect(visibleScores).toHaveLength(3);
      console.log("Found numeric score(s) for all health metric cards");
    });
  });

  test.describe("Performance to Target Score", () => {
    test("TC-CEO-011 | Performance to Target Score section is visible", async ({
      page,
    }) => {
      const section = await getContainerByText(
        page,
        "Performance to Target Score"
      );

      await expect(
        section.getByText("Performance to Target Score", { exact: false })
      ).toBeVisible({ timeout: 15000 });
      console.log("Performance to Target Score section visible");
    });

    test("TC-CEO-012 | Revenue label is displayed", async ({ page }) => {
      const section = await getContainerByText(
        page,
        "Performance to Target Score"
      );

      await expect(section.getByText("Revenue", { exact: true })).toBeVisible({
        timeout: 15000,
      });
      console.log("Revenue label visible");
    });

    test("TC-CEO-013 | Revenue value is displayed in SGD format", async ({
      page,
    }) => {
      const section = await getContainerByText(
        page,
        "Performance to Target Score"
      );

      await expect(section.getByText(/SGD/i).first()).toBeVisible({
        timeout: 15000,
      });
      console.log("SGD revenue value visible");
    });

    test("TC-CEO-014 | Ask AI button is present in chart section", async ({
      page,
    }) => {
      const section = await getContainerByText(
        page,
        "Performance to Target Score"
      );
      const askAI = section.getByRole("button", { name: /Ask AI/i }).first();

      await expect(askAI).toBeVisible({ timeout: 15000 });
      console.log("Ask AI button visible");
    });

    test("TC-CEO-015 | Ask AI button is clickable", async ({ page }) => {
      const section = await getContainerByText(
        page,
        "Performance to Target Score"
      );
      const askAI = section.getByRole("button", { name: /Ask AI/i }).first();

      await expect(askAI).toBeEnabled({ timeout: 15000 });
      await askAI.click();
      await expect(page).toHaveURL(/ceo-dashboard/);
      console.log("Ask AI button clickable");
    });

    test("TC-CEO-016 | Ask AI opens an AI interface", async ({ page }) => {
      const section = await getContainerByText(
        page,
        "Performance to Target Score"
      );
      const askAI = section.getByRole("button", { name: /Ask AI/i }).first();

      await expect(askAI).toBeEnabled({ timeout: 15000 });
      await askAI.click();
      await expectAiSurfaceToOpen(page);
      console.log("Ask AI opened an AI interface");
    });
  });

  test.describe("Recent Activity", () => {
    test("TC-CEO-017 | Recent Activity section is visible", async ({
      page,
    }) => {
      const section = await getContainerByText(page, "Recent Activity");

      await expect(
        section.getByText("Recent Activity", { exact: false })
      ).toBeVisible({ timeout: 15000 });
      console.log("Recent Activity section visible");
    });

    test("TC-CEO-018 | Recent Activity list has at least 1 item", async ({
      page,
    }) => {
      const section = await getContainerByText(page, "Recent Activity");
      const items = section.getByText(TIMESTAMP_REGEX);

      await expect(items.first()).toBeVisible({ timeout: 15000 });
      expect(await items.count()).toBeGreaterThanOrEqual(1);
      console.log("Found recent activity item(s)");
    });

    test("TC-CEO-019 | Recent Activity items display timestamps", async ({
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
    test("TC-CEO-020 | Task Requiring Actions section is visible", async ({
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
    test("TC-CEO-025 | Chat with AI button is visible", async ({ page }) => {
      await expect(
        page.getByRole("button", { name: /Chat with AI/i }).first()
      ).toBeVisible({ timeout: 15000 });
      console.log("Chat with AI button visible");
    });

    test("TC-CEO-026 | Chat with AI opens an AI interface", async ({ page }) => {
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

test.describe("CEO Dashboard - Performance", () => {
  test("TC-CEO-027 | Dashboard fully loads within 15 seconds", async ({
    page,
  }) => {
    const start = Date.now();

    await goToDashboard(page);

    const duration = Date.now() - start;
    console.log(`Dashboard load time: ${duration}ms`);
    expect(duration).toBeLessThan(15000);
    console.log("Dashboard loaded within 15 seconds");
  });

  test("TC-CEO-028 | Dashboard screenshot (visual baseline)", async ({
    page,
  }) => {
    await goToDashboard(page);
    await page.screenshot({
      path: "test-results/ceo-dashboard-baseline.png",
      fullPage: true,
    });
    console.log("Screenshot saved: test-results/ceo-dashboard-baseline.png");
  });

  test("TC-CEO-029 | Dashboard loads without critical console errors", async ({
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
