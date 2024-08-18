import {
  youtubeLandingPage,
  youtubeTestVideoLink,
  youtubeTestVideoPage,
} from "./constants.js";
import { test } from "./fixtures.js";
import {
  clickOnAVideo,
  gets5SecondsLink,
  rejectCookies,
  rendersInputElements,
  searchForVideo,
  switchLanguage,
  visitPage,
  rendersColouredProgressBar,
  colouredProgressBarHasCorrectLength,
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

test.describe("Gets a link to a section of a video", () => {
  test("Gets link", async ({ page, context }) => {
    await visitPage(page, youtubeTestVideoPage);
    await rejectCookies(page);
    await rendersInputElements(page);
    await context.grantPermissions(["clipboard-read"]);
    await gets5SecondsLink(page);
    await context.clearPermissions();
  });
});

test.describe.only("Colours the played range in progress bar", () => {
  test("progress bar is coloured", async ({ page }) => {
    await visitPage(page, youtubeTestVideoLink);
    await rendersColouredProgressBar(page);
    await colouredProgressBarHasCorrectLength(page);
  });
});
