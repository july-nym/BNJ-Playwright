// ============================================================
// Sanity Check - AI Chatbot Widget
// URL  : /claims
// Tool : Playwright
// ============================================================
//
// HOW TO RUN:
//   npx playwright test tests/4.ai-chatbot.spec.js
//   npx playwright test tests/4.ai-chatbot.spec.js --ui
//   npx playwright test tests/4.ai-chatbot.spec.js --grep "Quick Prompts"
//
// NOTE:
//   Auth is handled by global.setup.js (runs once before all tests).
//   Session is saved to playwright/.auth/user.json and reused here.
// ============================================================

require("dotenv").config();

const { test, expect } = require("@playwright/test");

const BASE_URL =
  process.env.BASE_URL || "https://web-bnj-ai-dev-8fdaab.azurewebsites.net";
const CLAIMS_URL = `${BASE_URL}/claims`;
const QUICK_PROMPTS = [
  "Summarize this month's financial highlights",
  "Which insurer has the highest rejection rate?",
  "Show claims pending more than 60 days",
  "Forecast next month's cash balance",
  "Compare expense vs revenue trend this quarter",
];

async function goToClaims(page) {
  await page.goto(CLAIMS_URL, { waitUntil: "domcontentloaded" });
  await expect(page).toHaveURL(/claims/, { timeout: 30000 });
  await expect(
    page.getByText("General Health (ICS)", { exact: false })
  ).toBeVisible({ timeout: 30000 });
}

async function openChatbot(page) {
  const chatButton = page
    .getByRole("button", { name: /Chat with AI/i })
    .first();

  await expect(chatButton).toBeVisible({ timeout: 15000 });
  await chatButton.click({ force: true });
  await expect(page.getByText("AI Chatbot", { exact: false })).toBeVisible({
    timeout: 15000,
  });
}

test.describe("AI Chatbot Widget - Sanity Check", () => {
  test.describe("Launcher", () => {
    test.beforeEach(async ({ page }) => {
      await goToClaims(page);
    });

    test("TC-CHAT-001 | Chat with AI launcher is visible", async ({ page }) => {
      await expect(
        page.getByRole("button", { name: /Chat with AI/i }).first()
      ).toBeVisible({ timeout: 15000 });
      console.log("Chat launcher visible");
    });

    test("TC-CHAT-002 | Chat with AI launcher opens chatbot panel", async ({
      page,
    }) => {
      await openChatbot(page);
      console.log("Chat launcher opened chatbot panel");
    });
  });

  test.describe("Chatbot Panel", () => {
    test.beforeEach(async ({ page }) => {
      await goToClaims(page);
      await openChatbot(page);
    });

    test("TC-CHAT-003 | Chatbot title is visible", async ({ page }) => {
      await expect(page.getByText("AI Chatbot", { exact: false })).toBeVisible({
        timeout: 15000,
      });
      console.log("AI Chatbot title visible");
    });

    test("TC-CHAT-004 | Intro heading is visible", async ({ page }) => {
      await expect(
        page.getByText("Let's talk about the data!", { exact: false })
      ).toBeVisible({ timeout: 15000 });
      console.log("Chatbot intro heading visible");
    });

    test("TC-CHAT-005 | Quick prompts are visible", async ({ page }) => {
      for (const prompt of QUICK_PROMPTS) {
        await expect(page.getByText(prompt, { exact: false })).toBeVisible({
          timeout: 15000,
        });
      }

      console.log("Quick prompts visible");
    });

    test("TC-CHAT-006 | Question input placeholder is visible", async ({
      page,
    }) => {
      const input = page.getByPlaceholder("Type your question here");

      await expect(input).toBeVisible({ timeout: 15000 });
      console.log("Question input placeholder visible");
    });

    test("TC-CHAT-007 | Send button is visible", async ({ page }) => {
      const sendButton = page
        .locator('img[alt="Send"]')
        .locator("xpath=ancestor::button[1]")
        .first();

      await expect(sendButton).toBeVisible({ timeout: 15000 });
      console.log("Send button visible");
    });

    test("TC-CHAT-008 | User can type into question input", async ({
      page,
    }) => {
      const input = page.getByPlaceholder("Type your question here");
      const question = "Show claims pending more than 60 days";

      await input.fill(question);
      await expect(input).toHaveValue(question);
      console.log("Question input accepts typing");
    });

    test("TC-CHAT-009 | Chatbot close control is visible", async ({ page }) => {
      const enlargeButton = page.locator('button[title="Enlarge"]').first();
      const closeButton = page
        .locator("svg.lucide-x")
        .locator("xpath=ancestor::button[1]")
        .first();

      await expect(enlargeButton).toBeVisible({ timeout: 15000 });
      await expect(closeButton).toBeVisible({ timeout: 15000 });
      console.log("Chatbot header controls visible");
    });

    test("TC-CHAT-010 | Chatbot can be closed", async ({ page }) => {
      const closeButton = page
        .locator("svg.lucide-x")
        .locator("xpath=ancestor::button[1]")
        .first();

      await expect(closeButton).toBeVisible({ timeout: 15000 });
      await closeButton.click({ force: true });
      await expect(
        page.getByText("AI Chatbot", { exact: false })
      ).not.toBeVisible({ timeout: 15000 });
      console.log("Chatbot closed successfully");
    });
  });
});
