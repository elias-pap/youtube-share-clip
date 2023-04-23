import { test, expect } from "./fixtures.js";

test("Has input elements", async ({ page }) => {
  // Visit youtube landing page
  await page.goto("https://youtube.com/");

  // Reject cookies in popup dialog
  const rejectButton = page.getByRole("button", {
    name: "Reject the use of cookies and other data for the purposes described",
  });
  if (await rejectButton.isVisible()) {
    rejectButton.click();
  }

  // Click on the first video
  await page.locator("#thumbnail").nth(1).click();

  // Verify page change
  await expect(page).toHaveURL(/watch/);

  // Mute the video
  await page.keyboard.press("M");

  // Click on Share button
  await page
    .locator("#actions-inner")
    .getByRole("button", { name: "Share" })
    .click();

  // Locate Start at checkbox and input
  await expect(page.getByRole("checkbox", { name: "Start at" })).toBeVisible();
  await expect(page.locator("#input-1").getByRole("textbox")).toBeVisible();

  // Locate End at checkbox and input
  await expect(page.getByRole("checkbox", { name: "End at" })).toBeVisible();
  await expect(page.locator("#input-2").getByRole("textbox")).toBeVisible();
});
