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
  for (const language of [null, "English (US)", "Ελληνικά"]) {
    test(`Coming from home page and refresh - language: ${
      language ?? "default"
    }`, async ({ page }) => {
      await visitPage(page, youtubeLandingPage);

      await rejectCookies(page);
      if (language) await switchLanguage(page, language);

      await searchForVideo(page);
      await clickOnAVideo(page);
      await rendersInputElements(page);

      await visitPage(page, youtubeTestVideoPage);
      await rendersInputElements(page);
    });
  }

  test("On video page", async ({ page }) => {
    await visitPage(page, youtubeTestVideoPage);
    await rejectCookies(page);
    await rendersInputElements(page);
  });
});
