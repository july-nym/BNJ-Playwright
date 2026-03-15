// ============================================================
// Sanity Check - Claims Dashboard
// URL  : /claims
// Tool : Playwright
// ============================================================
//
// HOW TO RUN:
//   npx playwright test tests/3.claims-dashboard.spec.js
//   npx playwright test tests/3.claims-dashboard.spec.js --ui
//   npx playwright test tests/3.claims-dashboard.spec.js --grep "General Health"
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
const DASHBOARD_URL = `${BASE_URL}/claims`;
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

const CLAIMS_METRIC_CARDS = [
  { id: "TC-CLM-009", title: "Claims Score" },
  { id: "TC-CLM-010", title: "Patient Score" },
  { id: "TC-CLM-011", title: "Inventory Score" },
];

const ACTION_TASKS = [
  { id: "TC-CLM-018", title: "Health Score Warning" },
  {
    id: "TC-CLM-019",
    title: "Forecast vs Actual Variance Exceeded",
  },
  { id: "TC-CLM-020", title: "Inventory Shortage Projected" },
  { id: "TC-CLM-021", title: "Cashflow Shortage Detected" },
  { id: "TC-CLM-022", title: "Sudden Financial Change Detected" },
];

async function expectDashboardReady(page) {
  await expect(page).toHaveURL(/claims/, { timeout: 30000 });
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

test.describe("Claims Dashboard - Sanity Check", () => {
  test.beforeEach(async ({ page }) => {
    await goToDashboard(page);
  });

  test.describe("Page Load & Navigation", () => {
    test("TC-CLM-001 | Dashboard page loads successfully", async ({ page }) => {
      await expect(page).toHaveURL(/claims/);
      await expect(page).toHaveTitle(/.+/);
      console.log("Claims page loaded successfully");
    });

    test("TC-CLM-002 | Benjamin & Joseph logo is visible", async ({ page }) => {
      const logo = page
        .locator('header img, img[alt*="Benjamin"], img[alt*="Joseph"], .logo')
        .first();

      await expect(logo).toBeVisible({ timeout: 15000 });
      console.log("Logo visible");
    });
  });

  test.describe("General Health (ICS)", () => {
    test("TC-CLM-003 | General Health section is visible", async ({ page }) => {
      const generalHealth = await getContainerByText(
        page,
        "General Health (ICS)"
      );

      await expect(
        generalHealth.getByText("General Health (ICS)", { exact: false })
      ).toBeVisible({ timeout: 15000 });
      console.log("General Health (ICS) section visible");
    });

    test("TC-CLM-004 | General Health score is displayed (format: XX/100)", async ({
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

    test("TC-CLM-005 | General Health progress bar is rendered", async ({
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

  test.describe("Current Operation Health", () => {
    test("TC-CLM-006 | Current Operation Health section is visible", async ({
      page,
    }) => {
      const operationHealth = await getContainerByText(
        page,
        "Current Operation Health"
      );

      await expect(
        operationHealth.getByText("Current Operation Health", {
          exact: false,
        })
      ).toBeVisible({ timeout: 15000 });
      console.log("Current Operation Health section visible");
    });

    test("TC-CLM-007 | Current Operation Health score is displayed (format: XX/100)", async ({
      page,
    }) => {
      const operationHealth = await getContainerByText(
        page,
        "Current Operation Health"
      );
      const scoreText = operationHealth
        .getByText(/\b\d{1,3}\s*\/\s*100\b/)
        .first();

      await expect(scoreText).toBeVisible({ timeout: 15000 });
      console.log("Current Operation Health score displayed");
    });

    test("TC-CLM-008 | Current Operation Health progress bar is rendered", async ({
      page,
    }) => {
      const operationHealth = await getContainerByText(
        page,
        "Current Operation Health"
      );
      const progressBar = operationHealth
        .locator(PROGRESS_BAR_SELECTOR)
        .first();

      await expect(progressBar).toBeVisible({ timeout: 15000 });
      console.log("Current Operation Health progress bar visible");
    });
  });

  test.describe("Claims Metric Cards", () => {
    for (const { id, title } of CLAIMS_METRIC_CARDS) {
      test(`${id} | ${title} card is visible`, async ({ page }) => {
        const card = await getContainerByText(page, title);

        await expect(card.getByText(title, { exact: false })).toBeVisible({
          timeout: 15000,
        });
        console.log(`${title} card visible`);
      });
    }

    test("TC-CLM-012 | All 3 claims metric donut charts are rendered", async ({
      page,
    }) => {
      for (const { title } of CLAIMS_METRIC_CARDS) {
        const card = await getContainerByText(page, title);
        const chart = card
          .locator(
            'svg, canvas, [class*="donut"], [class*="chart"], [class*="radial"]'
          )
          .first();

        await expect(chart).toBeVisible({ timeout: 15000 });
      }

      console.log("Found chart element(s) for all claims metric cards");
    });

    test("TC-CLM-013 | Claims metric scores are numeric values", async ({
      page,
    }) => {
      const scoreRegex = /^\d{1,3}$/;
      const visibleScores = [];

      for (const { title } of CLAIMS_METRIC_CARDS) {
        const card = await getContainerByText(page, title);
        const score = card.getByText(scoreRegex).first();

        await expect(score).toBeVisible({ timeout: 15000 });
        visibleScores.push(score);
      }

      expect(visibleScores).toHaveLength(3);
      console.log("Found numeric score(s) for all claims metric cards");
    });
  });

  test.describe("Recent Activity", () => {
    test("TC-CLM-014 | Recent Activity section is visible", async ({
      page,
    }) => {
      const section = await getContainerByText(page, "Recent Activity");

      await expect(
        section.getByText("Recent Activity", { exact: false })
      ).toBeVisible({ timeout: 15000 });
      console.log("Recent Activity section visible");
    });

    test("TC-CLM-015 | Recent Activity list has at least 1 item", async ({
      page,
    }) => {
      const section = await getContainerByText(page, "Recent Activity");
      const items = section.getByText(TIMESTAMP_REGEX);

      await expect(items.first()).toBeVisible({ timeout: 15000 });
      expect(await items.count()).toBeGreaterThanOrEqual(1);
      console.log("Found recent activity item(s)");
    });

    test("TC-CLM-016 | Recent Activity items display timestamps", async ({
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
    test("TC-CLM-017 | Task Requiring Actions section is visible", async ({
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
    test("TC-CLM-023 | Chat with AI button is visible", async ({ page }) => {
      await expect(
        page.getByRole("button", { name: /Chat with AI/i }).first()
      ).toBeVisible({ timeout: 15000 });
      console.log("Chat with AI button visible");
    });

    test("TC-CLM-024 | Chat with AI opens an AI interface", async ({
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

test.describe("Claims Dashboard - Performance", () => {
  test("TC-CLM-025 | Dashboard fully loads within 15 seconds", async ({
    page,
  }) => {
    const start = Date.now();

    await goToDashboard(page);

    const duration = Date.now() - start;
    console.log(`Claims dashboard load time: ${duration}ms`);
    expect(duration).toBeLessThan(15000);
    console.log("Claims dashboard loaded within 15 seconds");
  });

  test("TC-CLM-026 | Dashboard screenshot (visual baseline)", async ({
    page,
  }) => {
    await goToDashboard(page);
    await page.screenshot({
      path: "test-results/claims-dashboard-baseline.png",
      fullPage: true,
    });
    console.log("Screenshot saved: test-results/claims-dashboard-baseline.png");
  });

  test("TC-CLM-027 | Dashboard loads without critical console errors", async ({
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
