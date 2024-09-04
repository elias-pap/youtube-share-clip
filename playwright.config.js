import { defineConfig, devices } from "@playwright/test";

const CI = process.env.CI;

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: "src/tests",
  retries: CI ? 1 : 0,
  fullyParallel: true,
  forbidOnly: !!CI,
  workers: CI ? "75%" : "25%",
  reporter: [["html", { open: "never" }]],
  timeout: CI ? 120000 : 60000,
  expect: {
    timeout: 20000,
  },
  globalTimeout: 3600000,
  use: {
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"], browserName: "chromium" },
    },
    // {
    //   name: "Google Chrome",
    //   use: {
    //     ...devices["Desktop Chrome"],
    //     channel: "chrome",
    //     browserName: "chrome",
    //   },
    // },
    // {
    //   name: "Microsoft Edge",
    //   use: { ...devices["Desktop Edge"], browserName: "edge" },
    // },
  ],
});
