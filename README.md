# BNJ Playwright

Playwright end-to-end test suite for the BNJ dashboards.

## Requirements

- Node.js 18 or newer
- npm
- Valid test credentials for the BNJ environment

## Install

```bash
npm install
npx playwright install
```

Optional first checks:

```bash
npm run test:list
npm run format:check
```

## Environment Setup

Create a `.env` file in the project root with:

```env
BASE_URL=https://web-bnj-ai-dev-8fdaab.azurewebsites.net
TEST_EMAIL=your-test-email
TEST_PASSWORD=your-test-password
HEADLESS=true
SLOWMO=0
```

Notes:

- `BASE_URL` is the application under test.
- `TEST_EMAIL` and `TEST_PASSWORD` are used by the global setup login flow.
- Set `HEADLESS=false` for visible browser execution.
- Set `SLOWMO=500` or similar for slower local debugging.

## Project Structure

```text
tests/
  global.setup.js
  1.ceo-dashboard.spec.js
  2.finance-dashboard.spec.js
  3.claims-dashboard.spec.js
  4.ai-chatbot.spec.js
playwright.config.js
playwright/.auth/user.json
test-results/
playwright-report/
```

## How It Works

- [`tests/global.setup.js`](/Users/reposado/BNJ-Playwright/tests/global.setup.js) logs in once and saves the authenticated session.
- [`playwright.config.js`](/Users/reposado/BNJ-Playwright/playwright.config.js) runs the `setup` project first, then the `chromium` project.
- [`tests/1.ceo-dashboard.spec.js`](/Users/reposado/BNJ-Playwright/tests/1.ceo-dashboard.spec.js) reuses the saved session through `storageState`.
- [`tests/2.finance-dashboard.spec.js`](/Users/reposado/BNJ-Playwright/tests/2.finance-dashboard.spec.js) covers the Finance dashboard with the same shared authenticated session.
- [`tests/3.claims-dashboard.spec.js`](/Users/reposado/BNJ-Playwright/tests/3.claims-dashboard.spec.js) covers the Claims dashboard with the same shared authenticated session.
- [`tests/4.ai-chatbot.spec.js`](/Users/reposado/BNJ-Playwright/tests/4.ai-chatbot.spec.js) focuses on the shared AI Chatbot widget behavior from the dashboard UI.

The stored auth state is written to `playwright/.auth/user.json`.

## Run Tests

Run the full suite:

```bash
npm test
```

Run only the login setup flow:

```bash
npm run test:setup
```

Run only the CEO Dashboard spec:

```bash
npm run test:ceo
```

Run only the Finance Dashboard spec:

```bash
npm run test:finance
```

Run only the Claims Dashboard spec:

```bash
npm run test:claims
```

Run only the AI Chatbot widget spec:

```bash
npm run test:chatbot
```

Run the CEO Dashboard spec in headed mode:

```bash
npm run test:ceo:headed
```

Run the Finance Dashboard spec in headed mode:

```bash
npm run test:finance:headed
```

Run the Claims Dashboard spec in headed mode:

```bash
npm run test:claims:headed
```

Run the AI Chatbot widget spec in headed mode:

```bash
npm run test:chatbot:headed
```

Run with Playwright UI mode:

```bash
npm run test:ceo:ui
```

Run the Finance Dashboard spec in UI mode:

```bash
npm run test:finance:ui
```

Run the Claims Dashboard spec in UI mode:

```bash
npm run test:claims:ui
```

Run the AI Chatbot widget spec in UI mode:

```bash
npm run test:chatbot:ui
```

Run a subset by test title:

```bash
npm run test:ceo:general-health
```

Run the Finance dashboard General Health subset:

```bash
npm run test:finance:general-health
```

Run the Claims dashboard General Health subset:

```bash
npm run test:claims:general-health
```

Run only the AI Chatbot quick prompt checks:

```bash
npm run test:chatbot:prompts
```

List all discovered tests:

```bash
npm run test:list
```

Run the suite in headed mode:

```bash
npm run test:headed
```

Run with Playwright debug mode:

```bash
npm run test:debug
```

## Reports and Artifacts

- HTML report: `playwright-report/`
- JSON results: `test-results/results.json`
- Failure screenshots, traces, and videos: `test-results/`

Open the latest HTML report with:

```bash
npm run test:report
```

## Formatting

Format the whole repo:

```bash
npm run format
```

Check formatting without changing files:

```bash
npm run format:check
```

Run a simple local CI check:

```bash
npm run ci
```

Prettier configuration lives in [`.prettierrc.json`](/Users/reposado/BNJ-Playwright/.prettierrc.json), and ignored paths are defined in [`.prettierignore`](/Users/reposado/BNJ-Playwright/.prettierignore).

## Current Coverage

The current suite covers:

- AI Chatbot launcher, panel content, quick prompts, input, and close behavior
- Claims dashboard page load
- Claims general and current operation health sections
- Claims score cards and donut charts
- Claims recent activity and task requiring actions
- Claims chat widget and basic performance checks
- Finance dashboard page load
- Finance general and current financial health sections
- Finance score cards and donut charts
- Finance recent activity and task requiring actions
- Finance chat widget and basic performance checks
- Dashboard page load
- General Health (ICS) section
- Health metric cards
- Performance to Target Score
- Recent Activity
- Task Requiring Actions
- Chat with AI button
- Basic performance timing
- Full-page screenshot capture

## Troubleshooting

If login fails:

- Verify `BASE_URL`, `TEST_EMAIL`, and `TEST_PASSWORD` in `.env`
- Check whether the Microsoft sign-in flow changed
- Re-run with `HEADLESS=false` to inspect the login steps visually

If tests fail after authentication:

- Delete `playwright/.auth/user.json`
- Re-run `npm test` so the setup project creates a fresh session

If the app is slow in test environments:

- Keep the default Playwright timeouts
- Use `SLOWMO` only for debugging, not for regular execution
