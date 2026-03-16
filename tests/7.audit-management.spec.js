// ============================================================
// Sanity Check - Audit Management
// URL  : /audit-management
// Tool : Playwright
// ============================================================
//
// HOW TO RUN:
//   npx playwright test tests/7.audit-management.spec.js
//   npx playwright test tests/7.audit-management.spec.js --ui
//   npx playwright test tests/7.audit-management.spec.js --grep "Upload Sections"
//
// NOTE:
//   Auth is handled by global.setup.js (runs once before all tests).
//   Session is saved to playwright/.auth/user.json and reused here.
// ============================================================

require("dotenv").config();

const { test, expect } = require("@playwright/test");

const BASE_URL =
  process.env.BASE_URL || "https://web-bnj-ai-dev-8fdaab.azurewebsites.net";
const PAGE_URL = `${BASE_URL}/audit-management`;
const DOCUMENT_SECTIONS = [
  { id: "TC-AUD-005", title: "Medical Bill" },
  { id: "TC-AUD-006", title: "Universal Claim Form" },
  { id: "TC-AUD-007", title: "Medical Claims Authentication Form" },
];

async function goToAuditManagement(page) {
  await page.goto(PAGE_URL, { waitUntil: "domcontentloaded" });
  await expect(page).toHaveURL(/audit-management/, { timeout: 30000 });
  await expect(
    page.getByRole("heading", { name: /Audit Management/i }).first()
  ).toBeVisible({ timeout: 30000 });
  await expect(
    page.getByText("Medical Bill", { exact: false }).first()
  ).toBeVisible({
    timeout: 30000,
  });
}

function isCriticalConsoleError(message) {
  return !/Failed to load resource: the server responded with a status of 404/i.test(
    message
  );
}

test.describe("Audit Management - Sanity Check", () => {
  test.beforeEach(async ({ page }) => {
    await goToAuditManagement(page);
  });

  test.describe("Page Load & Navigation", () => {
    test("TC-AUD-001 | Audit Management page loads successfully", async ({
      page,
    }) => {
      await expect(page).toHaveURL(/audit-management/);
      await expect(page).toHaveTitle(/.+/);
      console.log("Audit Management page loaded successfully");
    });

    test("TC-AUD-002 | Benjamin & Joseph logo is visible", async ({ page }) => {
      const logo = page
        .locator('header img, img[alt*="Benjamin"], img[alt*="Joseph"], .logo')
        .first();

      await expect(logo).toBeVisible({ timeout: 15000 });
      console.log("Logo visible");
    });

    test("TC-AUD-003 | Page heading is visible", async ({ page }) => {
      await expect(
        page.getByRole("heading", { name: /Audit Management/i }).first()
      ).toBeVisible({ timeout: 15000 });
      console.log("Page heading visible");
    });

    test("TC-AUD-004 | Page description is visible", async ({ page }) => {
      await expect(
        page
          .getByText("Upload claim documents for AI validation.", {
            exact: false,
          })
          .first()
      ).toBeVisible({ timeout: 15000 });
      console.log("Page description visible");
    });
  });

  test.describe("Upload Sections", () => {
    for (const { id, title } of DOCUMENT_SECTIONS) {
      test(`${id} | ${title} upload section is visible`, async ({ page }) => {
        await expect(
          page.getByText(title, { exact: true }).first()
        ).toBeVisible({
          timeout: 15000,
        });
        console.log(`${title} upload section visible`);
      });
    }

    test("TC-AUD-008 | Select file controls are visible", async ({ page }) => {
      const selectFileTexts = page.getByText("Select file", { exact: true });

      await expect(selectFileTexts.first()).toBeVisible({ timeout: 15000 });
      expect(await selectFileTexts.count()).toBeGreaterThanOrEqual(3);
      console.log("Select file controls visible");
    });

    test("TC-AUD-009 | No file selected placeholders are visible", async ({
      page,
    }) => {
      const placeholders = page.getByText("No file selected", { exact: true });

      await expect(placeholders.first()).toBeVisible({ timeout: 15000 });
      expect(await placeholders.count()).toBeGreaterThanOrEqual(3);
      console.log("No file selected placeholders visible");
    });

    test("TC-AUD-010 | Remove actions are visible", async ({ page }) => {
      const removeTexts = page.getByText("Remove", { exact: true });

      await expect(removeTexts.first()).toBeVisible({ timeout: 15000 });
      expect(await removeTexts.count()).toBeGreaterThanOrEqual(3);
      console.log("Remove actions visible");
    });
  });

  test.describe("Footer Actions", () => {
    test("TC-AUD-011 | Clear files action is visible", async ({ page }) => {
      await expect(page.getByText("Clear files", { exact: true })).toBeVisible({
        timeout: 15000,
      });
      console.log("Clear files action visible");
    });

    test("TC-AUD-012 | Run audit validation action is visible", async ({
      page,
    }) => {
      await expect(
        page.getByText("Run audit validation", { exact: true })
      ).toBeVisible({ timeout: 15000 });
      console.log("Run audit validation action visible");
    });
  });

  test.describe("Chat with AI", () => {
    test("TC-AUD-013 | Chat with AI button is visible", async ({ page }) => {
      await expect(
        page.getByRole("button", { name: /Chat with AI/i }).first()
      ).toBeVisible({ timeout: 15000 });
      console.log("Chat with AI button visible");
    });
  });
});

test.describe("Audit Management - Performance", () => {
  test("TC-AUD-014 | Audit Management page fully loads within 15 seconds", async ({
    page,
  }) => {
    const start = Date.now();

    await goToAuditManagement(page);

    const duration = Date.now() - start;
    console.log(`Audit Management load time: ${duration}ms`);
    expect(duration).toBeLessThan(15000);
    console.log("Audit Management loaded within 15 seconds");
  });

  test("TC-AUD-015 | Audit Management screenshot (visual baseline)", async ({
    page,
  }) => {
    await goToAuditManagement(page);
    await page.screenshot({
      path: "test-results/audit-management-baseline.png",
      fullPage: true,
    });
    console.log("Screenshot saved: test-results/audit-management-baseline.png");
  });

  test("TC-AUD-016 | Audit Management page loads without critical console errors", async ({
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

    await goToAuditManagement(page);

    expect(consoleErrors).toEqual([]);
    expect(pageErrors).toEqual([]);
    console.log("No critical console errors detected");
  });
});
