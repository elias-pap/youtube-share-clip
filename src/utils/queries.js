import { sleep } from "./other.js";
import {
  endAtContainerID,
  pollingTimeoutInSeconds,
  shareButtonSelector,
  shareButtonSelector2,
  sleepTime,
  startAtContainerID,
} from "../constants/utils/queries.js";

/**
 * @typedef {import("../types/utils/queries.js").InputElementGetter} InputElementGetter
 * @typedef {import("../types/utils/queries.js").CheckboxElementGetter} CheckboxElementGetter
 * @typedef {import("../types/utils/queries.js").ElementGetter} ElementGetter
 */

/**
 * @param {(() => (Element|NodeListOf<Element>)?)[]} getters
 * @returns {Promise<Element|null|NodeListOf<Element>>}
 */
const pollForElementOrElements = async (getters) => {
  const pollsPerSecond = 1000 / sleepTime;
  const numberOfPolls = pollsPerSecond * pollingTimeoutInSeconds;

  for (let i = 0; i < numberOfPolls; i++) {
    let getter = getters[i % getters.length];
    let elementOrElements = getter();
    if (elementOrElements) return elementOrElements;
    await sleep(sleepTime);
  }

  return null;
};

/**
 * @param {(() => Element?)[]} elementGetters
 * @returns {Promise<Element?>}
 */
const pollForElement = async (elementGetters) => {
  return /** @type {Promise<Element?>} */ (
    pollForElementOrElements(elementGetters)
  );
};

/**
 * @param {(() => NodeListOf<Element>?)[]} elementsGetters
 * @returns {Promise<NodeListOf<Element>?>}
 */
const pollForElements = async (elementsGetters) => {
  return /** @type {Promise<NodeListOf<Element>?>} */ (
    pollForElementOrElements(elementsGetters)
  );
};

/**
 * @type {InputElementGetter}
 */
export const getStartAtInputElement = async () =>
  /** @type {HTMLInputElement?} */ (
    await pollForElement([
      () => document.querySelector(`#${startAtContainerID} input`),
    ])
  );

/**
 * @type {InputElementGetter}
 */
export const getEndAtInputElement = async () =>
  /** @type {HTMLInputElement?} */ (
    await pollForElement([
      () => document.querySelector(`#${endAtContainerID} input`),
    ])
  );

/**
 * @type {CheckboxElementGetter}
 */
export const getStartAtCheckboxElement = async () =>
  await pollForElement([
    () => document.querySelector(`#${startAtContainerID} #start-at-checkbox`),
  ]);

/**
 * @type {CheckboxElementGetter}
 */
export const getEndAtCheckboxElement = async () =>
  await pollForElement([
    () => document.querySelector(`#${endAtContainerID} #start-at-checkbox`),
  ]);

/**
 * @type {InputElementGetter}
 */
export const getShareURLElement = async () =>
  /** @type {HTMLInputElement?} */ (
    await pollForElement([
      () =>
        /** @type {HTMLInputElement} */ (document.getElementById("share-url")),
    ])
  );

/**
 * @type {ElementGetter}
 */
export const getStartAtContainer = async () =>
  await pollForElement([
    () =>
      document.querySelector(
        `ytd-popup-container #contents #${startAtContainerID}`,
      ),
  ]);

/**
 * @param {Element} nextElement
 * @returns {Promise<Element?>}
 */
export const getEndAtLabelElement = async (nextElement) =>
  await pollForElement([
    () => nextElement.querySelector("#checkboxLabel yt-formatted-string"),
  ]);

/**
 * @param {Element} nextElement
 * @returns {Promise<NodeListOf<Element>?>}
 */
export const getEndAtCheckboxContainerElements = async (nextElement) =>
  await pollForElements([
    () => nextElement.querySelectorAll("#checkboxContainer"),
  ]);

/**
 * @param {Element} nextElement
 * @returns {Promise<Element?>}
 */
export const getEndAtInputWrapperElement = async (nextElement) =>
  await pollForElement([() => nextElement.querySelector("tp-yt-paper-input")]);

/**
 * @param {Element} nextElement
 * @returns {Promise<Element?>}
 */
export const getEndAtLabelWrapperElement = async (nextElement) =>
  await pollForElement([() => nextElement.querySelector("#checkboxLabel")]);

/**
 * @type {ElementGetter}
 */
export const getShareDialog = async () =>
  await pollForElement([
    () => document.querySelector("ytd-popup-container #contents"),
  ]);

/**
 * @type {ElementGetter}
 */
export const getShareButton = async () =>
  await pollForElement([
    () => document.querySelector(shareButtonSelector),
    () => document.querySelector(shareButtonSelector2),
  ]);

/**
 * @type {ElementGetter}
 */
export const getBody = async () =>
  await pollForElement([() => document.querySelector("body")]);
