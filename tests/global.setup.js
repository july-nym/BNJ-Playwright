// ============================================================
// Global Setup - Login once and save session to file
// File : global.setup.js
// ============================================================

require("dotenv").config();

const fs = require("fs");
const path = require("path");
const { test: setup, expect } = require("@playwright/test");

const BASE_URL =
  process.env.BASE_URL || "https://web-bnj-ai-dev-8fdaab.azurewebsites.net";
const AUTH_FILE = path.join(__dirname, "..", "playwright/.auth/user.json");
const DASHBOARD_PATH = "/ceo-dashboard";
const EMAIL_SELECTOR = 'input[type="email"], input[name="email"]';
const PASSWORD_SELECTOR = 'input[type="password"], input[name="password"]';

function getRequiredEnv(name) {
  const value = process.env[name];

  if (!value) {
    throw new Error(
      `${name} is not set.\n` +
        "Copy .env.example to .env and fill in the required credentials."
    );
  }

  return value;
}

function ensureAuthDirectory() {
  fs.mkdirSync(path.dirname(AUTH_FILE), { recursive: true });
}

async function openDashboard(page) {
  await page.goto(`${BASE_URL}${DASHBOARD_PATH}`, {
    waitUntil: "domcontentloaded",
  });
}

async function signInWithMicrosoft(page, email, password) {
  await page.locator(EMAIL_SELECTOR).first().fill(email);
  await page.getByRole("button", { name: /Next/i }).click();

  await page.locator(PASSWORD_SELECTOR).first().fill(password);
  await page.getByRole("button", { name: /Sign in/i }).click();
}

async function handleStaySignedInPrompt(page) {
  const staySignedInButton = page.getByRole("button", { name: /^Yes$/i });

  try {
    await staySignedInButton.waitFor({ state: "visible", timeout: 10000 });
    await staySignedInButton.click();
    console.log("'Stay signed in' prompt accepted");
  } catch {
    console.log("'Stay signed in' prompt not shown, continuing");
  }
}

async function waitForDashboardReady(page) {
  await page.waitForURL(`**${DASHBOARD_PATH}`, { timeout: 150000 });
  await expect(page).toHaveURL(/ceo-dashboard/, { timeout: 30000 });
  await expect(
    page.getByText("General Health (ICS)", { exact: false })
  ).toBeVisible({ timeout: 30000 });
}

setup("authenticate", async ({ page }) => {
  const email = getRequiredEnv("TEST_EMAIL");
  const password = getRequiredEnv("TEST_PASSWORD");

  console.log("Running global login setup");
  console.log(`BASE_URL: ${BASE_URL}`);
  console.log(`Email: ${email}`);

  ensureAuthDirectory();
  await openDashboard(page);
  await signInWithMicrosoft(page, email, password);
  await handleStaySignedInPrompt(page);
  await waitForDashboardReady(page);

  await page.context().storageState({ path: AUTH_FILE });
  console.log(`Login successful, session saved to: ${AUTH_FILE}`);
});
