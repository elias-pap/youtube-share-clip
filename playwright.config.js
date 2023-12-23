import { defineConfig, devices } from "@playwright/test";

const CI = process.env.CI;

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: "src/tests",
  fullyParallel: true,
  forbidOnly: !!CI,
  workers: CI ? 1 : undefined,
  reporter: [["html", { open: "never" }]],
  timeout: CI ? 120000 : 60000,
  use: {
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "Google Chrome",
      use: { ...devices["Desktop Chrome"], channel: "chrome" },
    },
  ],
});
