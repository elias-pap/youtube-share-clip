import { test as baseTest, chromium } from "@playwright/test";
import v8toIstanbul from "v8-to-istanbul";
import path from "path";
import { fileURLToPath } from "url";
import { logError } from "../utils/other";
import { mkdirSync, writeFileSync } from "fs";
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

test.beforeAll(() => {
  mkdirSync("test-results/coverage/tmp", { recursive: true });
});

test.beforeEach(async ({ page, browserName }, { title }) => {
  console.info(`Running "${title}" test...`);
  page.on("console", (msg) => console.info(msg.text()));
  if (browserName !== "chromium") return;
  await page.coverage.startJSCoverage();
});

test.afterEach(async ({ page, browserName }, { title }) => {
  if (browserName !== "chromium") return;
  const coverage = await page.coverage.stopJSCoverage();

  let entries = coverage.filter(({ url }) =>
    url.includes("youtube-share-clip"),
  );
  if (!entries)
    return logError(`"${title}" test entries not found. Skipping coverage.`);
  if (entries.length !== 1)
    return logError(
      `"${title}" test entries has invalid length. Skipping coverage.`,
    );
  let entry = entries[0];
  if (!entry)
    return logError(`"${title}" test entry not found. Skipping coverage.`);
  let { source, functions } = entry;
  if (!source)
    return logError(
      `"${title}" test entry source not found. Skipping coverage.`,
    );
  const converter = v8toIstanbul("", 0, { source });
  await converter.load();
  converter.applyCoverage(functions);
  let coverageData = converter.toIstanbul();
  let rootParentFolder = path.join(__dirname, "../../../");
  let coverageDataWithCorrectPaths = JSON.stringify(coverageData).replaceAll(
    rootParentFolder,
    "",
  );
  writeFileSync(
    `test-results/coverage/tmp/${title.replaceAll(" ", "-")}`,
    coverageDataWithCorrectPaths,
  );
});
export const expect = test.expect;
