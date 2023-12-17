import { youtubeLandingPage, youtubeTestVideoPage } from "./constants.js";
import { test } from "./fixtures.js";
import {
  clickOnAVideo,
  rejectCookies,
  rendersInputElements,
  searchForVideo,
  switchLanguage,
  visitPage,
} from "./utils.js";

test.beforeEach(async ({ page }, { title }) => {
  console.info(`Running ${title} test...`);
  page.on("console", (msg) => console.info(msg.text()));
});

test.describe("Renders input elements", () => {
  test("Coming from home page", async ({ page }) => {
    for (const language of [null, "English (US)", "Ελληνικά"]) {
      await visitPage(page, youtubeLandingPage);
      if (!language) await rejectCookies(page);
      await switchLanguage(page, language);
      await searchForVideo(page);
      await clickOnAVideo(page);
      await rendersInputElements(page);
    }
  });

  test("On video page", async ({ page }) => {
    for (const language of [null, "English (US)", "Ελληνικά"]) {
      await visitPage(page, youtubeTestVideoPage);
      if (!language) await rejectCookies(page);
      await switchLanguage(page, language);
      await rendersInputElements(page);
    }
  });
});
