import { errors } from "@playwright/test";
import { expect } from "./fixtures.js";
import {
  endAtContainerID,
  shareButtonSelector,
  shareButtonSelector2,
  startAtContainerID,
} from "../constants/utils/queries.js";
import {
  languageIconPathSelector,
  maxRetries,
  menuIconPathSelector,
  searchIconPathSelector,
  singleActionTimeout,
  sleepTime,
  testVideoSearchTerm,
  testVideoTitle,
} from "./constants.js";
import { sleep } from "../utils/other.js";

/**
 * @typedef {import("@playwright/test").Page} Page
 */

/**
 * @param {() => Promise<void>} callback
 * @param {() => boolean} condition
 */
const doUntil = async (callback, condition) => {
  let retriesLeft = maxRetries;
  while (!condition() && retriesLeft > 0) {
    await callback();
    retriesLeft--;
    sleep(sleepTime);
  }
  if (!condition() && retriesLeft === 0)
    console.warn("No retries left and condition is not satisfied.");
};

/**
 * @param {Page} page
 * @param {string} url
 */
export const visitPage = async (page, url) => {
  await page.goto(url);
};

/**
 * @param {Page} page
 */
export const rejectCookies = async (page) => {
  if (process.env.CI) return;
  const rejectButton = page.getByRole("button", {
    name: "Reject the use of cookies and other data for the purposes described",
  });
  try {
    await rejectButton.click({ timeout: singleActionTimeout });
  } catch (error) {
    if (error instanceof errors.TimeoutError)
      console.info("Reject cookies button not found.");
  }
};

/**
 * @param {Page} page
 */
export const searchForVideo = async (page) => {
  let searchBar = page.locator('input[id="search"]');
  await searchBar.fill(testVideoSearchTerm);
  let searchButton = page.locator("button", {
    has: page.locator(searchIconPathSelector),
  });
  await doUntil(
    async () => {
      await searchButton.click();
    },
    () => page.url().startsWith("https://www.youtube.com/results"),
  );
};

/**
 * @param {Page} page
 * @param {string} pathPrefix
 */
const isOnPage = async (page, pathPrefix) => {
  await page.waitForURL((url) => url.pathname.startsWith(pathPrefix));
};

/**
 * @param {Page} page
 */
const isOnResultsPage = async (page) => {
  await isOnPage(page, "/results");
};

/**
 * @param {Page} page
 */
const isOnWatchPage = async (page) => {
  await isOnPage(page, "/watch");
};

/**
 * @param {Page} page
 */
export const clickOnAVideo = async (page) => {
  await isOnResultsPage(page);
  let videoTitles = page.getByRole("link", { name: testVideoTitle });
  let firstVideoTitle = videoTitles.nth(0);
  await firstVideoTitle.click();
};

/**
 * @param {Page} page
 */
const clickShareButton = async (page) => {
  for (;;) {
    let shareButton = page.locator(shareButtonSelector);
    try {
      await shareButton.click({ timeout: singleActionTimeout });
      return;
    } catch (error) {
      if (error instanceof errors.TimeoutError) {
        console.warn(
          `Share button not found with selector ${shareButtonSelector}.`,
        );
      }
    }
    shareButton = page.locator(shareButtonSelector2);
    try {
      await shareButton.click({ timeout: singleActionTimeout });
      return;
    } catch (error) {
      if (error instanceof errors.TimeoutError) {
        console.warn(
          `Share button not found with selector ${shareButtonSelector2}.`,
        );
      }
    }
  }
};

/**
 * @param {Page} page
 */
const rendersStartAtCheckboxAndInput = async (page) => {
  await expect(
    page.locator(`#${startAtContainerID} #start-at-checkbox`),
  ).toBeVisible();
  await expect(page.locator("#input-1").getByRole("textbox")).toBeVisible();
};

/**
 * @param {Page} page
 */
const rendersEndAtCheckboxAndInput = async (page) => {
  await expect(
    page.locator(`#${endAtContainerID} #start-at-checkbox`),
  ).toBeVisible();
  await expect(page.locator("#input-2").getByRole("textbox")).toBeVisible();
};

/**
 * @param {Page} page
 */
export const rendersInputElements = async (page) => {
  await isOnWatchPage(page);
  await clickShareButton(page);
  await rendersStartAtCheckboxAndInput(page);
  await rendersEndAtCheckboxAndInput(page);
};

/**
 * @param {Page} page
 * @param {string} language
 */
export const switchLanguage = async (page, language) => {
  let menuButtonParent = page.locator("ytd-topbar-menu-button-renderer");
  let menuButton = menuButtonParent.locator("button", {
    has: page.locator(menuIconPathSelector),
  });
  await menuButton.click();
  let selectLanguageButton = page.locator("a", {
    has: page.locator(languageIconPathSelector),
  });
  await selectLanguageButton.click();
  let languageButton = page.locator("a", {
    hasText: language,
  });
  await languageButton.click();
};
