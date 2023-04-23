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
import {
  // @ts-ignore
  URLs,
  // @ts-ignore
  IsAtCheckboxChecked,
  // @ts-ignore
  OnStateChange,
  // @ts-ignore
  StateElements,
  // @ts-ignore
  NavigateEvent,
} from "./types/extension.js";
import {
  // @ts-ignore
  InputElementGetter,
  // @ts-ignore
  CheckboxElementGetter,
} from "./types/utils/queries.js";

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
 * @returns {number?}
 */
const getAtSeconds = (getAtInputElement) => {
  let atInputEl = getAtInputElement();
  if (!atInputEl) return logElementNotFoundError("at input");
  return timeToSeconds(atInputEl.value);
};

/**
 * @param {CheckboxElementGetter} getAtCheckboxElement
 * @returns {boolean?}
 */
const isAtCheckboxChecked = (getAtCheckboxElement) => {
  let atCheckbox = getAtCheckboxElement();
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
 * @returns {number?}
 */
const getAtSecondsIfChecked = (isAtCheckboxChecked, getAtInputElement) => {
  if (isAtCheckboxChecked()) {
    return getAtSeconds(getAtInputElement);
  }
  return null;
};

/**
 * @returns {number?}
 */
const getStartAtSecondsIfChecked = () =>
  getAtSecondsIfChecked(isStartAtCheckboxChecked, getStartAtInputElement);

/**
 * @returns {number?}
 */
const getEndAtSecondsIfChecked = () =>
  getAtSecondsIfChecked(isEndAtCheckboxChecked, getEndAtInputElement);

/**
 * @type {OnStateChange}
 */
const onStateChange = () => {
  let shareURLElement = getShareURLElement();
  if (!shareURLElement) {
    return logElementNotFoundError("share url");
  }

  let startSeconds = getStartAtSecondsIfChecked();
  let endSeconds = getEndAtSecondsIfChecked();

  let shareURL = computeShareURL(startSeconds, endSeconds);
  if (!shareURL) return;

  shareURLElement.value = shareURL;
};

/**
 * @param {OnStateChange} onStateChange
 * @returns {void|null}
 */
const addOnStateChangeListeners = (onStateChange) => {
  let stateElements = getStateElements();
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
 * @returns {StateElements?}
 */
const getStateElements = () => {
  let startAtInput = getStartAtInputElement();
  if (!startAtInput) {
    return logElementNotFoundError("start at input");
  }
  let startAtCheckbox = getStartAtCheckboxElement();
  if (!startAtCheckbox) {
    return logElementNotFoundError("start at checkbox");
  }
  let endAtInput = getEndAtInputElement();
  if (!endAtInput) {
    return logElementNotFoundError("end at input");
  }
  let endAtCheckbox = getEndAtCheckboxElement();
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
 * @returns {void|null}
 */
const addEndAtCheckboxAndInput = (startAtContainer) => {
  cloneStartAtContainer(startAtContainer);
  let startAtCloneLabelElement = getStartAtCloneLabelElement(startAtContainer);
  if (!startAtCloneLabelElement) {
    return logElementNotFoundError("start at clone label");
  }
  createEndAtElement(startAtCloneLabelElement);
};

const onShareButtonClick = async () => {
  let shareDialog = getShareDialog();
  if (!shareDialog) {
    return logElementNotFoundError("share dialog");
  }

  let startAtContainer = await getStartAtContainer();
  if (!startAtContainer) {
    return logElementNotFoundError("start at container");
  }

  let nextElement = startAtContainer.nextElementSibling;
  if (nextElement?.getAttribute("id") === endAtContainerID) return;

  addEndAtCheckboxAndInput(startAtContainer);
  addOnStateChangeListeners(onStateChange);
};

const addOnShareButtonClickListener = async () => {
  let shareButton = await getShareButton();
  if (!shareButton) {
    return logElementNotFoundError("share button");
  }
  shareButton.addEventListener("click", onShareButtonClick);
};

/**
 * @param {NavigateEvent} event
 */
const onURLChanged = (event) => {
  let url = new URL(event.destination.url);
  if (url.pathname === "/watch") {
    addOnShareButtonClickListener();
  }
};

const main = () => {
  // @ts-ignore
  // eslint-disable-next-line no-undef
  navigation.addEventListener("navigate", onURLChanged);
};

main();
