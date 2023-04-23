import { logElementNotFoundError, sleep } from "./other.js";
import {
  endAtContainerID,
  pollingTimeoutInSeconds,
  sleepTime,
  startAtContainerID,
} from "../constants/utils/queries.js";
import {
  // @ts-ignore
  ElementGetter,
  // @ts-ignore
  InputElementGetter,
  // @ts-ignore
  CheckboxElementGetter,
} from "../types/utils/queries.js";

/**
 * @param {ElementGetter} elementGetter
 * @returns {Promise<Element?>}
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
export const getStartAtInputElement = () =>
  document.querySelector(`#${startAtContainerID} input`);

/**
 * @type {InputElementGetter}
 */
export const getEndAtInputElement = () =>
  document.querySelector(`#${endAtContainerID} input`);

/**
 * @type {CheckboxElementGetter}
 */
export const getStartAtCheckboxElement = () =>
  document.querySelector(`#${startAtContainerID} #start-at-checkbox`);

/**
 * @type {CheckboxElementGetter}
 */
export const getEndAtCheckboxElement = () =>
  document.querySelector(`#${endAtContainerID} #start-at-checkbox`);

/**
 * @type {InputElementGetter}
 */
export const getShareURLElement = () =>
  /** @type {HTMLInputElement} */ (document.getElementById("share-url"));

/**
 * @returns {Promise<Element?>}
 */
export const getStartAtContainer = async () =>
  await pollForElement(() =>
    document.querySelector(
      `ytd-popup-container #contents #${startAtContainerID}`
    )
  );

/**
 * @param {Element} startAtContainer
 * @returns {Element?}
 */
export const getStartAtCloneLabelElement = (startAtContainer) => {
  let nextElement = startAtContainer.nextElementSibling;
  if (!nextElement) return logElementNotFoundError("next of start");
  return nextElement.querySelector("#checkboxLabel yt-formatted-string");
};

/**
 * @returns {Promise<Element?>}
 */
export const getShareDialog = async () =>
  await pollForElement(() =>
    document.querySelector("ytd-popup-container #contents")
  );

/**
 * @returns {Promise<Element?>}
 */
export const getShareButton = async () =>
  await pollForElement(() =>
    document.querySelector("#actions-inner button[aria-label='Share']")
  );
