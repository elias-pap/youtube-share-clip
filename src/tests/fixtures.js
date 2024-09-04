import { test as baseTest, chromium } from "@playwright/test";
import path from "path";
import { fileURLToPath } from "url";
import { collectCoverage, prepareCoverage, startCoverage } from "./utils";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const test = baseTest.extend({
  // eslint-disable-next-line no-empty-pattern
  context: async ({}, use) => {
    const pathToExtension = path.join(__dirname, "../../build");
    const browser = await chromium.launchPersistentContext("", {
      headless: false,
      args: [
        `--headless=new`,
        `--disable-extensions-except=${pathToExtension}`,
        `--load-extension=${pathToExtension}`,
        `--mute-audio=true`,
      ],
    });
    await use(browser);
    await browser.close();
  },
});

test.beforeAll(({ browserName }) => {
  prepareCoverage(browserName);
});

test.beforeEach(async ({ page, browserName }, { title }) => {
  console.info(`Test "${title}" started...`);
  page.on("console", (msg) => console.info(msg.text()));
  await startCoverage(page, browserName);
});

test.afterEach(async ({ page, browserName }, { title }) => {
  await collectCoverage(page, browserName, title);
  console.info(`Test "${title}" finished.`);
});

export const expect = test.expect;
