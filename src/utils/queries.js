import { logElementNotFoundError, sleep } from "./other.js";
import {
  endAtContainerID,
  pollingTimeoutInSeconds,
  sleepTime,
  startAtContainerID,
} from "../constants/utils/queries.js";

/**
 * @typedef {import("../types/utils/queries.js").InputElementGetter} InputElementGetter
 * @typedef {import("../types/utils/queries.js").CheckboxElementGetter} CheckboxElementGetter
 * @typedef {import("../types/utils/queries.js").ElementGetter} ElementGetter
 */

/**
 * @template T
 * @param {() => T?} elementGetter
 * @returns {Promise<T?>}
 */
const pollForElement = async (elementGetter) => {
  const pollsPerSecond = 1000 / sleepTime;
  const numberOfPolls = pollsPerSecond * pollingTimeoutInSeconds;

  for (let i = 0; i < numberOfPolls; i++) {
    let element = elementGetter();
    if (element) {
      return element;
    }
    await sleep(sleepTime);
  }

  return null;
};

/**
 * @type {InputElementGetter}
 */
export const getStartAtInputElement = async () =>
  await pollForElement(() =>
    document.querySelector(`#${startAtContainerID} input`)
  );

/**
 * @type {InputElementGetter}
 */
export const getEndAtInputElement = async () =>
  await pollForElement(() =>
    document.querySelector(`#${endAtContainerID} input`)
  );

/**
 * @type {CheckboxElementGetter}
 */
export const getStartAtCheckboxElement = async () =>
  await pollForElement(() =>
    document.querySelector(`#${startAtContainerID} #start-at-checkbox`)
  );

/**
 * @type {CheckboxElementGetter}
 */
export const getEndAtCheckboxElement = async () =>
  await pollForElement(() =>
    document.querySelector(`#${endAtContainerID} #start-at-checkbox`)
  );

/**
 * @type {InputElementGetter}
 */
export const getShareURLElement = async () =>
  await pollForElement(
    () => /** @type {HTMLInputElement} */ (document.getElementById("share-url"))
  );

/**
 * @type {ElementGetter}
 */
export const getStartAtContainer = async () =>
  await pollForElement(() =>
    document.querySelector(
      `ytd-popup-container #contents #${startAtContainerID}`
    )
  );

/**
 * @param {Element} startAtContainer
 * @returns {Promise<Element?>}
 */
export const getStartAtCloneLabelElement = async (startAtContainer) => {
  let nextElement = startAtContainer.nextElementSibling;
  if (!nextElement) return logElementNotFoundError("next of start");
  return await pollForElement(() =>
    // @ts-ignore
    nextElement.querySelector("#checkboxLabel yt-formatted-string")
  );
};

/**
 * @type {ElementGetter}
 */
export const getShareDialog = async () =>
  await pollForElement(() =>
    document.querySelector("ytd-popup-container #contents")
  );

/**
 * @type {ElementGetter}
 */
export const getShareButton = async () =>
  await pollForElement(() =>
    document.querySelector("#actions-inner button[aria-label='Share']")
  );
