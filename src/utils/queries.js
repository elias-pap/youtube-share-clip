import { sleep } from "./other.js";
import {
  endAtContainerID,
  pollingTimeoutInSeconds,
  shareIconParentSelector,
  shareIconPathSelector,
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
    if (element) return element;
    await sleep(sleepTime);
  }

  return null;
};

/**
 * @type {InputElementGetter}
 */
export const getStartAtInputElement = async () =>
  await pollForElement(() =>
    document.querySelector(`#${startAtContainerID} input`),
  );

/**
 * @type {InputElementGetter}
 */
export const getEndAtInputElement = async () =>
  await pollForElement(() =>
    document.querySelector(`#${endAtContainerID} input`),
  );

/**
 * @type {CheckboxElementGetter}
 */
export const getStartAtCheckboxElement = async () =>
  await pollForElement(() =>
    document.querySelector(`#${startAtContainerID} #start-at-checkbox`),
  );

/**
 * @type {CheckboxElementGetter}
 */
export const getEndAtCheckboxElement = async () =>
  await pollForElement(() =>
    document.querySelector(`#${endAtContainerID} #start-at-checkbox`),
  );

/**
 * @type {InputElementGetter}
 */
export const getShareURLElement = async () =>
  await pollForElement(
    () =>
      /** @type {HTMLInputElement} */ (document.getElementById("share-url")),
  );

/**
 * @type {ElementGetter}
 */
export const getStartAtContainer = async () =>
  await pollForElement(() =>
    document.querySelector(
      `ytd-popup-container #contents #${startAtContainerID}`,
    ),
  );

/**
 * @param {Element} nextElement
 * @returns {Promise<Element?>}
 */
export const getStartAtCloneLabelElement = async (nextElement) =>
  await pollForElement(() =>
    nextElement.querySelector("#checkboxLabel yt-formatted-string"),
  );

/**
 * @type {ElementGetter}
 */
export const getShareDialog = async () =>
  await pollForElement(() =>
    document.querySelector("ytd-popup-container #contents"),
  );

/**
 * @type {ElementGetter}
 */
export const getShareIcon = async () =>
  await pollForElement(() =>
    document.querySelector(
      `${shareIconParentSelector} ${shareIconPathSelector}`,
    ),
  );

/**
 * @param {Element} shareIcon
 * @returns {Promise<Element?>}
 */
export const getShareButton = async (shareIcon) =>
  await pollForElement(() => shareIcon.closest("button"));

/**
 * @type {ElementGetter}
 */
export const getBody = async () =>
  await pollForElement(() => document.querySelector("body"));
