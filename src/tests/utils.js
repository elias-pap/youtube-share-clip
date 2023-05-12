import { errors } from "@playwright/test";
import { expect } from "./fixtures.js";

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
export const clickOnFirstVideo = async (page) => {
  await page.locator("#thumbnail").nth(1).click();
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
    .locator("#actions-inner")
    .getByRole("button", { name: "Share" })
    .click();
};

/**
 * @param {Page} page
 */
const rendersStartAtCheckboxAndInput = async (page) => {
  await expect(page.getByRole("checkbox", { name: "Start at" })).toBeVisible();
  await expect(page.locator("#input-1").getByRole("textbox")).toBeVisible();
};

/**
 * @param {Page} page
 */
const rendersEndAtCheckboxAndInput = async (page) => {
  await expect(page.getByRole("checkbox", { name: "End at" })).toBeVisible();
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
