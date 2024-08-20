import { test as baseTest } from "@playwright/test";
import path from "path";
import { fileURLToPath } from "url";
import { chromium } from "playwright-extra";
import stealth from "puppeteer-extra-plugin-stealth";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

chromium.use(stealth());

export const test = baseTest.extend({
  // eslint-disable-next-line no-empty-pattern
  context: async ({}, use) => {
    const pathToExtension = path.join(__dirname, "../../build");
    const context = await chromium.launchPersistentContext("", {
      headless: false,
      args: [
        `--headless=new`,
        `--disable-extensions-except=${pathToExtension}`,
        `--load-extension=${pathToExtension}`,
        `--mute-audio=true`,
      ],
    });
    await use(context);
    await context.close();
  },
});
export const expect = test.expect;
