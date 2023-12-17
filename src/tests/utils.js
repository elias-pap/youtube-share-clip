import { errors } from "@playwright/test";
import { expect } from "./fixtures.js";
import {
  endAtContainerID,
  shareIconParentSelector,
  shareIconPathSelector,
  startAtContainerID,
} from "../constants/utils/queries.js";
import {
  languageIconPathSelector,
  menuIconPathSelector,
  searchIconPathSelector,
  testVideoSearchTerm,
  testVideoTitle,
} from "./constants.js";

/**
 * @typedef {import("@playwright/test").Page} Page
 */

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
    await rejectButton.click({
      timeout: 5000,
    });
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
  await searchButton.click();
  await searchButton.click();
  await searchButton.click();
};

/**
 * @param {Page} page
 */
const isOnResultsPage = async (page) => {
  await page.waitForURL((url) => url.pathname.startsWith("/results"));
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
const isOnWatchPage = async (page) => {
  await page.waitForURL((url) => url.pathname.startsWith("/watch"));
  await page.waitForTimeout(4000);
};

/**
 * @param {Page} page
 */
const clickShareButton = async (page) => {
  let shareIconParent = page.locator(shareIconParentSelector);
  let shareButton = shareIconParent.locator("button", {
    has: page.locator(shareIconPathSelector),
  });
  await shareButton.click();
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
 * @param {string?} language
 */
export const switchLanguage = async (page, language) => {
  if (!language) return;
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
