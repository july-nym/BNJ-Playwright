// ============================================================
// Sanity Check - Target & Benchmark
// URL  : /target-benchmark
// Tool : Playwright
// ============================================================
//
// HOW TO RUN:
//   npx playwright test tests/5.target-benchmark.spec.js
//   npx playwright test tests/5.target-benchmark.spec.js --ui
//   npx playwright test tests/5.target-benchmark.spec.js --grep "Financial Targets"
//
// NOTE:
//   Auth is handled by global.setup.js (runs once before all tests).
//   Session is saved to playwright/.auth/user.json and reused here.
// ============================================================

require("dotenv").config();

const { test, expect } = require("@playwright/test");

const BASE_URL =
  process.env.BASE_URL || "https://web-bnj-ai-dev-8fdaab.azurewebsites.net";
const PAGE_URL = `${BASE_URL}/target-benchmark`;
const TARGET_FIELDS = [
  { id: "TC-TBM-009", label: "Revenue Target" },
  { id: "TC-TBM-010", label: "Cost of Goods Sold (COGS)" },
  { id: "TC-TBM-011", label: "Operating Expenses (OPEX)" },
  { id: "TC-TBM-012", label: "Profit" },
  { id: "TC-TBM-013", label: "Operating Cashflow" },
  { id: "TC-TBM-014", label: "Cashflow Ratio" },
  { id: "TC-TBM-015", label: "Cash Conversion Cycle" },
  { id: "TC-TBM-016", label: "Debt & Financing Expense" },
  { id: "TC-TBM-017", label: "Operational Profit" },
  { id: "TC-TBM-018", label: "Working Capital Targets" },
  { id: "TC-TBM-019", label: "A/R" },
  { id: "TC-TBM-020", label: "A/P" },
  { id: "TC-TBM-021", label: "Inventory Value" },
  { id: "TC-TBM-022", label: "Interest Expense" },
  { id: "TC-TBM-023", label: "Outstanding Principal" },
  { id: "TC-TBM-024", label: "Inventory Risk Threshold" },
  { id: "TC-TBM-025", label: "Min. Inventory Turnover Rate" },
  { id: "TC-TBM-026", label: "Max. Inventory Turnover Rate" },
  { id: "TC-TBM-027", label: "Max. Expired Stock Percentage" },
  { id: "TC-TBM-028", label: "Patient Experience" },
  { id: "TC-TBM-029", label: "Min. Patient Satisfaction Score" },
];

async function goToTargetBenchmark(page) {
  await page.goto(PAGE_URL, { waitUntil: "domcontentloaded" });
  await expect(page).toHaveURL(/target-benchmark/, { timeout: 30000 });
  await expect(
    page.getByRole("heading", { name: /Target & Benchmark/i }).first()
  ).toBeVisible({ timeout: 30000 });
  await expect(
    page.getByText("Quarterly Target Window", { exact: false }).first()
  ).toBeVisible({ timeout: 30000 });
}

function isCriticalConsoleError(message) {
  return !/Failed to load resource: the server responded with a status of 404/i.test(
    message
  );
}

test.describe("Target & Benchmark - Sanity Check", () => {
  test.beforeEach(async ({ page }) => {
    await goToTargetBenchmark(page);
  });

  test.describe("Page Load & Navigation", () => {
    test("TC-TBM-001 | Target & Benchmark page loads successfully", async ({
      page,
    }) => {
      await expect(page).toHaveURL(/target-benchmark/);
      console.log("Target & Benchmark page loaded successfully");
    });

    test("TC-TBM-002 | Page heading is visible", async ({ page }) => {
      await expect(
        page.getByRole("heading", { name: /Target & Benchmark/i }).first()
      ).toBeVisible({ timeout: 15000 });
      await expect(
        page.getByText(
          "Manage the yearly budget, forecast, and performance targets",
          { exact: false }
        ).first()
      ).toBeVisible({ timeout: 15000 });
      console.log("Target & Benchmark heading visible");
    });
  });

  test.describe("Target Period", () => {
    test("TC-TBM-003 | Year and quarter controls are visible", async ({
      page,
    }) => {
      await expect(page.getByText("Year", { exact: true }).first()).toBeVisible({
        timeout: 15000,
      });
      await expect(
        page.getByText("Quarterly Target Window", { exact: false }).first()
      ).toBeVisible({ timeout: 15000 });
      await expect(page.getByText("Q1", { exact: true }).first()).toBeVisible({
        timeout: 15000,
      });
      await expect(page.getByText("Q2", { exact: true }).first()).toBeVisible({
        timeout: 15000,
      });
      await expect(page.getByText("Q3", { exact: true }).first()).toBeVisible({
        timeout: 15000,
      });
      await expect(page.getByText("Q4", { exact: true }).first()).toBeVisible({
        timeout: 15000,
      });
      console.log("Year and quarter controls visible");
    });

    test("TC-TBM-004 | Target Period section is visible", async ({ page }) => {
      await expect(
        page.getByText("Target Period", { exact: false }).first()
      ).toBeVisible({ timeout: 15000 });
      await expect(
        page.getByText("Fiscal Year", { exact: false }).first()
      ).toBeVisible({ timeout: 15000 });
      await expect(
        page.getByText("Quarter Start Date", { exact: false }).first()
      ).toBeVisible({ timeout: 15000 });
      console.log("Target Period section visible");
    });

    test("TC-TBM-005 | Current year value is displayed", async ({ page }) => {
      await expect(
        page.getByText("2026", { exact: false }).first()
      ).toBeVisible({ timeout: 15000 });
      console.log("Current year value visible");
    });
  });

  test.describe("Financial Targets", () => {
    test("TC-TBM-006 | Financial Targets section is visible", async ({
      page,
    }) => {
      await expect(
        page.getByText("Financial Targets", { exact: false }).first()
      ).toBeVisible({ timeout: 15000 });
      console.log("Financial Targets section visible");
    });

    test("TC-TBM-007 | Edit window notice is displayed", async ({ page }) => {
      await expect(
        page.getByText("The targets cannot be created/modified at this time.", {
          exact: false,
        }).first()
      ).toBeVisible({ timeout: 15000 });
      console.log("Edit window notice visible");
    });

    test("TC-TBM-008 | Manual entry or upload instruction is displayed", async ({
      page,
    }) => {
      await expect(
        page.getByText(
          "Enter targets and benchmarks manually, or upload a file using the template.",
          { exact: false }
        ).first()
      ).toBeVisible({ timeout: 15000 });
      console.log("Manual entry/upload instruction visible");
    });

    for (const { id, label } of TARGET_FIELDS) {
      test(`${id} | ${label} field is visible`, async ({ page }) => {
        await expect(page.getByText(label, { exact: false }).first()).toBeVisible({
          timeout: 15000,
        });
        console.log(`${label} field visible`);
      });
    }
  });

  test.describe("Upload Area", () => {
    test("TC-TBM-030 | File upload dropzone is visible", async ({ page }) => {
      await expect(
        page.getByText("Drop your files here or browse", { exact: false }).first()
      ).toBeVisible({ timeout: 15000 });
      console.log("File upload dropzone visible");
    });

    test("TC-TBM-031 | Maximum file size note is visible", async ({ page }) => {
      await expect(
        page.getByText("Maximum size: 50MB", { exact: false }).first()
      ).toBeVisible({ timeout: 15000 });
      console.log("Maximum file size note visible");
    });
  });

  test.describe("Page Actions", () => {
    test("TC-TBM-032 | Cancel action is visible", async ({ page }) => {
      await expect(
        page.getByRole("button", { name: /cancel/i }).first()
      ).toBeVisible({ timeout: 15000 });
      console.log("Cancel action visible");
    });

    test("TC-TBM-033 | Save and Replace Data action is visible", async ({
      page,
    }) => {
      await expect(
        page.getByRole("button", { name: /save & replace data/i }).first()
      ).toBeVisible({ timeout: 15000 });
      console.log("Save and Replace Data action visible");
    });
  });

  test.describe("Chat with AI", () => {
    test("TC-TBM-034 | Chat with AI button is visible", async ({ page }) => {
      await expect(
        page.getByRole("button", { name: /Chat with AI/i }).first()
      ).toBeVisible({ timeout: 15000 });
      console.log("Chat with AI button visible");
    });
  });
});

test.describe("Target & Benchmark - Performance", () => {
  test("TC-TBM-035 | Page fully loads within 15 seconds", async ({ page }) => {
    const start = Date.now();

    await goToTargetBenchmark(page);

    const duration = Date.now() - start;
    console.log(`Target & Benchmark load time: ${duration}ms`);
    expect(duration).toBeLessThan(15000);
    console.log("Target & Benchmark loaded within 15 seconds");
  });

  test("TC-TBM-036 | Page screenshot (visual baseline)", async ({ page }) => {
    await goToTargetBenchmark(page);
    await page.screenshot({
      path: "test-results/target-benchmark-baseline.png",
      fullPage: true,
    });
    console.log("Screenshot saved: test-results/target-benchmark-baseline.png");
  });

  test("TC-TBM-037 | Page loads without critical console errors", async ({
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

    await goToTargetBenchmark(page);

    expect(consoleErrors).toEqual([]);
    expect(pageErrors).toEqual([]);
    console.log("No critical console errors detected");
  });
});
