import { endAtContainerID } from "./constants/utils/queries.js";
import {
  logElementNotFoundError,
  logNotFoundError,
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
  getStartAtCloneLabelElement,
} from "./utils/queries.js";

/**
 * @typedef {import("./types/extension.js").URLs} URLs
 * @typedef {import("./types/utils/queries.js").InputElementGetter} InputElementGetter
 * @typedef {import("./types/utils/queries.js").CheckboxElementGetter} CheckboxElementGetter
 * @typedef {import("./types/extension.js").IsAtCheckboxChecked} IsAtCheckboxChecked
 * @typedef {import("./types/extension.js").OnStateChange} OnStateChange
 * @typedef {import("./types/extension.js").StateElements} StateElements
 * @typedef {import("./types/extension.js").NavigateEvent} NavigateEvent
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
  getAtInputElement
) => {
  if (await isAtCheckboxChecked()) {
    return getAtSeconds(getAtInputElement);
  }
  return null;
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
  if (!shareURLElement) {
    return logElementNotFoundError("share url");
  }

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
  if (!stateElements) {
    return logElementNotFoundError("at least one state");
  }
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
  if (!startAtInput) {
    return logElementNotFoundError("start at input");
  }
  let startAtCheckbox = await getStartAtCheckboxElement();
  if (!startAtCheckbox) {
    return logElementNotFoundError("start at checkbox");
  }
  let endAtInput = await getEndAtInputElement();
  if (!endAtInput) {
    return logElementNotFoundError("end at input");
  }
  let endAtCheckbox = await getEndAtCheckboxElement();
  if (!endAtCheckbox) {
    return logElementNotFoundError("end at checkbox");
  }

  return { startAtInput, startAtCheckbox, endAtInput, endAtCheckbox };
};

/**
 * @param {Element} startAtCloneLabelElement
 */
const createEndAtElement = (startAtCloneLabelElement) => {
  startAtCloneLabelElement.removeAttribute("is-empty");
  startAtCloneLabelElement.textContent = "End at";
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
  let startAtCloneLabelElement = await getStartAtCloneLabelElement(
    startAtContainer
  );
  if (!startAtCloneLabelElement) {
    return logElementNotFoundError("start at clone label");
  }
  createEndAtElement(startAtCloneLabelElement);
};

const onShareButtonClick = async () => {
  let shareDialog = await getShareDialog();
  if (!shareDialog) {
    return logElementNotFoundError("share dialog");
  }

  let startAtContainer = await getStartAtContainer();
  if (!startAtContainer) {
    return logElementNotFoundError("start at container");
  }

  let nextElement = startAtContainer.nextElementSibling;
  if (nextElement?.getAttribute("id") === endAtContainerID) return;

  await addEndAtCheckboxAndInput(startAtContainer);
  await addOnStateChangeListeners(onStateChange);
};

const addOnShareButtonClickListener = async () => {
  let shareButton = await getShareButton();
  if (!shareButton) {
    return logElementNotFoundError("share button");
  }
  shareButton.addEventListener("click", onShareButtonClick);
};

/**
 * @param {URL} url
 */
const addListenerOnVideoPage = async (url) => {
  if (url.pathname === "/watch") {
    await addOnShareButtonClickListener();
  }
};

/**
 * @param {NavigateEvent} event
 */
const onURLChanged = async (event) => {
  let url = new URL(event.destination.url);
  await addListenerOnVideoPage(url);
};

const onPageLoad = async () => {
  let url = new URL(window.location.href);
  await addListenerOnVideoPage(url);
};

const main = () => {
  // @ts-ignore
  // eslint-disable-next-line no-undef
  navigation.addEventListener("navigate", onURLChanged);
  window.addEventListener("load", onPageLoad);
};

main();
