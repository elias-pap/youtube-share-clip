import {
  BrowserClient,
  defaultStackParser,
  getDefaultIntegrations,
  makeFetchTransport,
  Scope,
} from "@sentry/browser";
import { secondsPerDay, secondsPerHour, secondsPerMinute } from "../constants/utils/other.js";

/**
 * @param {number} ms sleep time in milliseconds
 * @returns {Promise<void>} a promise that resolves after the given milliseconds
 */
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * @param {string} timestamp video timestamp -- 01:12:13
 * @returns {number} total time in seconds
 */
export const timeToSeconds = (timestamp) => {
  let digitsArray = timestamp.split(":").map((digit) => parseInt(digit));
  if (![2, 3, 4].includes(digitsArray.length)) {
    // Excluding the initial state case for End at input
    if (!(digitsArray.length === 1 && isNaN(digitsArray[0]))) {
      console.warn("Invalid timestamp.");
    }
    return 0;
  }
  if (digitsArray.some((value) => isNaN(value))) {
    console.warn("Invalid digits in timestamp.");
    return 0;
  }
  let secondsPerDigit = [secondsPerDay, secondsPerHour, secondsPerMinute, 1];

  return digitsArray.reduceRight(
    (prev, curr, idx) =>
      prev + curr * secondsPerDigit[idx + secondsPerDigit.length - digitsArray.length],
  );
};

/**
 * @param {string} elementName
 * @returns {null}
 */
export const logElementNotFoundError = (elementName) => logNotFoundError(`${elementName} element`);

/**
 * @param {string} elementsName
 * @returns {null}
 */
export const logElementsNotFoundError = (elementsName) =>
  logNotFoundError(`${elementsName} elements`);

/**
 * @param {string} name
 * @returns {null}
 */
export const logNotFoundError = (name) => logError(`${name} not found.`);

/**
 * @type {Scope}
 */
let sentryScope;

/**
 * Setup according to https://docs.sentry.io/platforms/javascript/best-practices/shared-environments/
 */
export const initSentry = () => {
  const integrations = getDefaultIntegrations({}).filter((defaultIntegration) => {
    return ![
      "BrowserApiErrors",
      "BrowserSession",
      "Breadcrumbs",
      "ConversationId",
      "GlobalHandlers",
      "FunctionToString",
    ].includes(defaultIntegration.name);
  });
  const client = new BrowserClient({
    dsn: "https://ca0cb03d7d29fbb1b09c52fcba66144d@o4507045965660160.ingest.us.sentry.io/4507046846464000",
    attachStacktrace: true,
    enabled: process.env.NODE_ENV === "production",
    release: "0.8.3",
    environment: process.env.NODE_ENV,
    transport: makeFetchTransport,
    stackParser: defaultStackParser,
    integrations,
  });
  sentryScope = new Scope();
  sentryScope.setClient(client);
  client.init();
};

/**
 * @param {string} error
 * @returns {null}
 */
export const logError = (error) => {
  const errorString = `[YSC] ${error}`;
  console.error(errorString);
  sentryScope.captureException(new Error(errorString));
  return null;
};

// export const getCurrentURL = () => window.location.href;
