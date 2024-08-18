import * as Sentry from "@sentry/browser";
import { captureConsoleIntegration } from "@sentry/integrations";
import {
  defaultEndAtLabelText,
  langToEndAtStringMap,
  syncSleepTime,
} from "./constants/extension.js";
import { endAtContainerID } from "./constants/utils/queries.js";
import {
  getCurrentURL,
  logElementNotFoundError,
  logElementsNotFoundError,
  logError,
  logNotFoundError,
  sleep,
  timeToSeconds,
} from "./utils/other.js";
import {
  getStartAtInputElement,
  getEndAtInputElement,
  getStartAtCheckboxElement,
  getEndAtCheckboxElement,
  getShareURLElement,
  getStartAtContainer,
  getShareButton,
  getShareDialog,
  getEndAtLabelElement,
  getBody,
  getEndAtLabelWrapperElement,
  getEndAtInputWrapperElement,
  getEndAtCheckboxContainerElements,
  getPlayedProgressBarRangeElement,
  getVideoDurationElement,
} from "./utils/queries.js";

/**
 * @typedef {import("./types/extension.js").URLs} URLs
 * @typedef {import("./types/utils/queries.js").InputElementGetter} InputElementGetter
 * @typedef {import("./types/utils/queries.js").CheckboxElementGetter} CheckboxElementGetter
 * @typedef {import("./types/extension.js").IsAtCheckboxChecked} IsAtCheckboxChecked
 * @typedef {import("./types/extension.js").OnStateChange} OnStateChange
 * @typedef {import("./types/extension.js").StateElements} StateElements
 */

/**
 * @returns {URLs?}
 */
const getURLs = () => {
  let queryString = window.location.search;
  let urlParams = new URLSearchParams(queryString);
  let videoID = urlParams.get("v");
  if (!videoID) return logNotFoundError("videoID (v) parameter");
  let url = `https://www.youtube.com/embed/${videoID}`;
  let originalURL = `https://youtu.be/${videoID}`;
  return { url, originalURL };
};

/**
 * @param {number?} startSeconds
 * @param {number?} endSeconds
 * @returns {string?}
 */
const computeShareURL = (startSeconds, endSeconds) => {
  let urls = getURLs();
  if (!urls) return logNotFoundError("URLs");
  let { url, originalURL } = urls;

  if (startSeconds != null && endSeconds != null) {
    if (startSeconds < endSeconds) {
      url += `?start=${startSeconds}&end=${endSeconds}&autoplay=true`;
    } else {
      url = originalURL;
    }
  } else if (startSeconds != null) {
    url = `${originalURL}?t=${startSeconds}`;
  } else if (endSeconds != null && endSeconds !== 0) {
    url += `?start=0&end=${endSeconds}&autoplay=true`;
  } else {
    url = originalURL;
  }

  return url;
};

/**
 * @param {InputElementGetter} getAtInputElement
 * @returns {Promise<number?>}
 */
const getAtSeconds = async (getAtInputElement) => {
  let atInputEl = await getAtInputElement();
  if (!atInputEl) return logElementNotFoundError("at input");
  return timeToSeconds(atInputEl.value);
};

/**
 * @param {CheckboxElementGetter} getAtCheckboxElement
 * @returns {Promise<boolean?>}
 */
const isAtCheckboxChecked = async (getAtCheckboxElement) => {
  let atCheckbox = await getAtCheckboxElement();
  if (!atCheckbox) return logElementNotFoundError("at checkbox");
  return atCheckbox.hasAttribute("checked");
};

/**
 * @type {IsAtCheckboxChecked}
 */
const isStartAtCheckboxChecked = () =>
  isAtCheckboxChecked(getStartAtCheckboxElement);

/**
 * @type {IsAtCheckboxChecked}
 */
const isEndAtCheckboxChecked = () =>
  isAtCheckboxChecked(getEndAtCheckboxElement);

/**
 * @param {IsAtCheckboxChecked} isAtCheckboxChecked
 * @param {InputElementGetter} getAtInputElement
 * @returns {Promise<number?>}
 */
const getAtSecondsIfChecked = async (
  isAtCheckboxChecked,
  getAtInputElement,
) => {
  if (!(await isAtCheckboxChecked())) return null;
  return getAtSeconds(getAtInputElement);
};

/**
 * @returns {Promise<number?>}
 */
const getStartAtSecondsIfChecked = async () =>
  await getAtSecondsIfChecked(isStartAtCheckboxChecked, getStartAtInputElement);

/**
 * @returns {Promise<number?>}
 */
const getEndAtSecondsIfChecked = () =>
  getAtSecondsIfChecked(isEndAtCheckboxChecked, getEndAtInputElement);

/**
 * @type {OnStateChange}
 */
const onStateChange = async () => {
  let shareURLElement = await getShareURLElement();
  if (!shareURLElement) return logElementNotFoundError("share url");

  let startSeconds = await getStartAtSecondsIfChecked();
  let endSeconds = await getEndAtSecondsIfChecked();

  let shareURL = computeShareURL(startSeconds, endSeconds);
  if (!shareURL) return;

  shareURLElement.value = shareURL;
};

/**
 * @param {OnStateChange} onStateChange
 * @returns {Promise<void?>}
 */
const addOnStateChangeListeners = async (onStateChange) => {
  let stateElements = await getStateElements();
  if (!stateElements) return logElementNotFoundError("at least one state");

  let { startAtInput, startAtCheckbox, endAtInput, endAtCheckbox } =
    stateElements;
  startAtCheckbox.addEventListener("click", onStateChange);
  startAtInput.addEventListener("focusout", onStateChange);
  endAtCheckbox.addEventListener("click", onStateChange);
  endAtInput.addEventListener("focusout", onStateChange);
};

/**
 * @returns {Promise<StateElements?>}
 */
const getStateElements = async () => {
  let startAtInput = await getStartAtInputElement();
  if (!startAtInput) return logElementNotFoundError("start at input");

  let startAtCheckbox = await getStartAtCheckboxElement();
  if (!startAtCheckbox) return logElementNotFoundError("start at checkbox");

  let endAtInput = await getEndAtInputElement();
  if (!endAtInput) return logElementNotFoundError("end at input");

  let endAtCheckbox = await getEndAtCheckboxElement();
  if (!endAtCheckbox) return logElementNotFoundError("end at checkbox");

  return { startAtInput, startAtCheckbox, endAtInput, endAtCheckbox };
};

/**
 * @returns {string}
 */
const getTranslatedEndAtString = () => {
  let language = document.documentElement.lang;
  if (!langToEndAtStringMap.has(language)) return defaultEndAtLabelText;
  // @ts-ignore the language is checked in the previous line
  return langToEndAtStringMap.get(language);
};

/**
 * @param {Element} endAtLabelElement
 */
const createEndAtLabelElement = (endAtLabelElement) => {
  endAtLabelElement.removeAttribute("is-empty");
  endAtLabelElement.textContent = getTranslatedEndAtString();
};

/**
 * @param {Element} endAtInputElement
 */
const createEndAtInputElement = (endAtInputElement) => {
  endAtInputElement.removeAttribute("disabled");
  endAtInputElement.setAttribute("placeholder", "0:00");
};

/**
 * @param {Element} playedProgressBarRangeElement
 * @returns {Element}
 */
const clonePlayedProgressBarRangeElement = (playedProgressBarRangeElement) => {
  return /** @type {Element} */ (playedProgressBarRangeElement.cloneNode(true));
};

/**
 * @param {Element} startAtContainer
 */
const cloneStartAtContainer = (startAtContainer) => {
  let clone = /** @type {Element} */ (startAtContainer.cloneNode(true));
  clone.setAttribute("id", endAtContainerID);
  startAtContainer.after(clone);
};

/**
 * @param {Element} startAtContainer
 * @returns {Promise<void?>}
 */
const addEndAtCheckboxAndInput = async (startAtContainer) => {
  cloneStartAtContainer(startAtContainer);

  let nextElement = startAtContainer.nextElementSibling;
  if (!nextElement) return logElementNotFoundError("next of start");

  let endAtLabelElement = await getEndAtLabelElement(nextElement);
  if (!endAtLabelElement)
    return logElementNotFoundError("start at clone label");
  createEndAtLabelElement(endAtLabelElement);

  let endAtCheckboxContainerElements =
    await getEndAtCheckboxContainerElements(nextElement);
  if (!endAtCheckboxContainerElements)
    return logElementsNotFoundError("start at clone checkbox container");
  if (endAtCheckboxContainerElements.length < 2) return;

  let endAtInputElement = await getEndAtInputWrapperElement(nextElement);
  if (!endAtInputElement)
    return logElementNotFoundError("start at clone input");
  createEndAtInputElement(endAtInputElement);

  let endAtLabelWrapperElement = await getEndAtLabelWrapperElement(nextElement);
  if (!endAtLabelWrapperElement)
    return logElementNotFoundError("start at clone label wrapper");
  endAtLabelWrapperElement.replaceChildren(endAtLabelElement);
};

/**
 * @param {Element} element
 * @returns {boolean}
 */
const isEndAtContainer = (element) =>
  element.getAttribute("id") === endAtContainerID;

/**
 * @param {Element} startAtContainer
 */
const removeEndAtContainer = (startAtContainer) => {
  let nextElement = startAtContainer.nextElementSibling;
  if (!nextElement || !isEndAtContainer(nextElement)) return;
  nextElement.remove();
};

const onShareButtonClick = async () => {
  // This delay is used because this part of the DOM is changed by YouTube as well.
  // Allow some time for Youtube's changes to be applied first.
  await sleep(syncSleepTime);

  let shareDialog = await getShareDialog();
  if (!shareDialog) return logElementNotFoundError("share dialog");

  let startAtContainer = await getStartAtContainer();
  if (!startAtContainer) return logElementNotFoundError("start at container");

  removeEndAtContainer(startAtContainer);

  let startAtChildrenExist = startAtContainer.children.length !== 0;
  if (!startAtChildrenExist) return logNotFoundError("start at children");

  await addEndAtCheckboxAndInput(startAtContainer);
  await addOnStateChangeListeners(onStateChange);
};

const addOnShareButtonClickListener = async () => {
  let shareButton = await getShareButton();
  if (!shareButton) return logElementNotFoundError("share button");

  shareButton.addEventListener("click", onShareButtonClick);
};

/**
 * @param {string} href
 */
const addListenerOnVideoPage = async (href) => {
  let url = new URL(href);
  if (url.pathname === "/watch") {
    await addOnShareButtonClickListener();
  }
};

/**
 * @param {string} paramName
 * @returns {number?}
 */
const getTime = (paramName) => {
  let url = new URL(getCurrentURL());
  let params = url.searchParams;
  let timeParam = params.get(paramName);
  if (!timeParam) return logNotFoundError(`${paramName} param`);
  let time = parseInt(timeParam);
  return time;
};

/**
 * @returns {number?}
 */
const getStartTime = () => getTime("start");

/**
 * @returns {number?}
 */
const getEndTime = () => getTime("end");

/**
 * @param {number} videoDuration
 * @returns {number?}
 */
const calculateLeftStyle = (videoDuration) => {
  let startTime = getStartTime();
  if (startTime == null) return null;
  return (startTime / videoDuration) * 100;
};

/**
 * @param {number} videoDuration
 * @returns {number?}
 */
const calculateScaleXStyle = (videoDuration) => {
  let endTime = getEndTime();
  if (endTime == null) return null;
  let startTime = getStartTime();
  if (startTime == null) return null;
  return (endTime - startTime) / videoDuration;
};

/**
 * @returns {Promise<number?>}
 */
const getVideoDuration = async () => {
  let videoDurationElement = await getVideoDurationElement();
  if (!videoDurationElement) return logElementNotFoundError("video duration");
  let videoDuration = videoDurationElement.textContent;
  if (!videoDuration) return logNotFoundError("duration string");
  return timeToSeconds(videoDuration);
};

/**
 * @returns {Promise<{left: number, scaleX: number}?>}
 */
const calculateSharedProgressBarStartAndEndStyling = async () => {
  let videoDuration = await getVideoDuration();
  if (!videoDuration) return logNotFoundError("duration number");
  let left = calculateLeftStyle(videoDuration);
  if (left == null) return logError("could not calculate left style");
  let scaleX = calculateScaleXStyle(videoDuration);
  if (scaleX == null) return logError("could not calculate scaleX style");
  return { left, scaleX };
};

/**
 * @param {Element} sharedProgressBarRangeElement
 * @returns {Promise<null|undefined>}
 */
const setSharedProgressBarStyle = async (sharedProgressBarRangeElement) => {
  let style = await calculateSharedProgressBarStartAndEndStyling();
  if (!style) return logError("could not calculate shared progress bar style");
  let { left, scaleX } = style;
  sharedProgressBarRangeElement.setAttribute(
    "style",
    `left: ${left}%; transform: scaleX(${scaleX}); z-index:33; background-color: #0f0`,
  );
};

const colorSharedProgressBarSection = async () => {
  let href = getCurrentURL();
  let url = new URL(href);
  if (!url.pathname.startsWith("/embed")) return;
  let playedProgressBarRangeElement = await getPlayedProgressBarRangeElement();
  if (!playedProgressBarRangeElement)
    return logElementNotFoundError("played progress bar range");
  let sharedProgressBarRangeElement = clonePlayedProgressBarRangeElement(
    playedProgressBarRangeElement,
  );
  await setSharedProgressBarStyle(sharedProgressBarRangeElement);
  playedProgressBarRangeElement.after(sharedProgressBarRangeElement);
};

const onPageLoad = async () => {
  await addListenerOnVideoPage(getCurrentURL());
  await colorSharedProgressBarSection();
};

const observeURLChange = async () => {
  let oldURL = getCurrentURL();
  let body = await getBody();
  if (!body) return logElementNotFoundError("body");

  let observer = new MutationObserver((mutations) => {
    mutations.forEach(async () => {
      let newURL = getCurrentURL();
      if (oldURL !== newURL) {
        oldURL = newURL;
        await addListenerOnVideoPage(newURL);
      }
    });
  });

  observer.observe(body, { childList: true, subtree: true });
};

const main = () => {
  observeURLChange();
  window.addEventListener("load", onPageLoad);
};

Sentry.init({
  dsn: "https://ca0cb03d7d29fbb1b09c52fcba66144d@o4507045965660160.ingest.us.sentry.io/4507046846464000",
  attachStacktrace: true,
  release: "0.6.1",
  environment: process.env.NODE_ENV,
  integrations: [captureConsoleIntegration({ levels: ["error"] })],
});
main();
