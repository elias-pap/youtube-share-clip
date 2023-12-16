import { errors } from "@playwright/test";
import { expect } from "./fixtures.js";
import {
  endAtContainerID,
  startAtContainerID,
} from "../constants/utils/queries.js";
import { testVideoSearchTerm } from "./constants.js";

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
  let searchBar = page.getByPlaceholder("Search");
  await searchBar.fill(testVideoSearchTerm);
  let searchButton = page.getByRole("button", { name: "Search", exact: true });
  await searchButton.click();
  await searchButton.click();
};

/**
 * @param {Page} page
 */
export const clickOnAVideo = async (page) => {
  let videoTitles = page.locator("#video-title");
  let firstVideoTitle = videoTitles.nth(0);
  await firstVideoTitle.click();
};

/**
 * @param {Page} page
 */
const isOnWatchPage = async (page) => {
  await expect(page).toHaveURL(/watch/);
};

/**
 * @param {Page} page
 */
const muteVideo = async (page) => {
  await page.keyboard.press("M");
};

/**
 * @param {Page} page
 */
const clickShareButton = async (page) => {
  await page
    .locator(
      "#actions-inner #top-level-buttons-computed ytd-button-renderer button",
    )
    .click();
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
  await muteVideo(page);
  await clickShareButton(page);
  await rendersStartAtCheckboxAndInput(page);
  await rendersEndAtCheckboxAndInput(page);
};
