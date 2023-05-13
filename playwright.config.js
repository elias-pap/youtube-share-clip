import { defineConfig, devices } from "@playwright/test";

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: "./src/tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  workers: process.env.CI ? 1 : undefined,
  reporter: "list",
  timeout: 60000,
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
