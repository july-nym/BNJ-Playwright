// ============================================================
// Playwright Configuration
// Project : CEO Dashboard - BNJ
// ============================================================

require("dotenv").config();

const path = require("path");
const { defineConfig, devices } = require("@playwright/test");

const BASE_URL =
  process.env.BASE_URL || "https://web-bnj-ai-dev-8fdaab.azurewebsites.net";
const AUTH_FILE = path.join(__dirname, "playwright", ".auth", "user.json");
const DEFAULT_VIEWPORT = { width: 1440, height: 900 };
const REQUIRED_ENV = ["BASE_URL", "TEST_EMAIL", "TEST_PASSWORD"];
const missingEnv = REQUIRED_ENV.filter((key) => !process.env[key]);

if (missingEnv.length > 0) {
  console.warn(
    `Missing env vars: ${missingEnv.join(", ")}\n` +
      "Copy .env.example to .env and fill in your credentials.\n"
  );
}

module.exports = defineConfig({
  testDir: "./tests",
  timeout: 180000,
  outputDir: "test-results",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : 1,

  expect: {
    timeout: 30000,
  },

  reporter: [
    ["list"],
    ["html", { outputFolder: "playwright-report", open: "on-failure" }],
    ["json", { outputFile: "test-results/results.json" }],
  ],

  use: {
    baseURL: BASE_URL,
    navigationTimeout: 60000,
    actionTimeout: 30000,
    headless: process.env.HEADLESS !== "false",
    viewport: DEFAULT_VIEWPORT,
    deviceScaleFactor: 1,
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    trace: "retain-on-failure",
    ignoreHTTPSErrors: true,
    locale: "en-SG",
    timezoneId: "Asia/Singapore",
    launchOptions: {
      slowMo: process.env.SLOWMO ? parseInt(process.env.SLOWMO, 10) : 0,
    },
  },

  projects: [
    {
      name: "setup",
      testMatch: "**/global.setup.js",
    },
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        viewport: DEFAULT_VIEWPORT,
        storageState: AUTH_FILE,
      },
      dependencies: ["setup"],
    },
    // {
    //   name: "firefox",
    //   use: {
    //     ...devices["Desktop Firefox"],
    //     viewport: DEFAULT_VIEWPORT,
    //     storageState: AUTH_FILE,
    //   },
    //   dependencies: ["setup"],
    // },
  ],
});
