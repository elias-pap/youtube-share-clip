import { youtubeLandingPage, youtubeTestVideoPage } from "./constants.js";
import { test } from "./fixtures.js";
import {
  clickOnFirstVideo,
  rejectCookies,
  rendersInputElements,
  visitPage,
} from "./utils.js";

test.describe("Renders input elements", () => {
  test("Coming from home page", async ({ page }) => {
    await visitPage(page, youtubeLandingPage);
    await rejectCookies(page);
    await clickOnFirstVideo(page);
    await rendersInputElements(page);
  });

  test("On video page", async ({ page }) => {
    await visitPage(page, youtubeTestVideoPage);
    await rejectCookies(page);
    await rendersInputElements(page);
  });
});
