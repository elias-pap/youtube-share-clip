import {
  secondsPerDay,
  secondsPerHour,
  secondsPerMinute,
} from "../constants/utils/other.js";

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
    console.error("Invalid timestamp.");
    return 0;
  }
  if (digitsArray.some((value) => isNaN(value))) {
    console.error("Invalid digits in timestamp.");
    return 0;
  }
  let secondsPerDigit = [secondsPerDay, secondsPerHour, secondsPerMinute, 1];

  return digitsArray.reduceRight(
    (prev, curr, idx) => prev + curr * secondsPerDigit[idx]
  );
};

/**
 * @param {string} elementName
 * @returns {null}
 */
export const logElementNotFoundError = (elementName) =>
  logNotFoundError(`${elementName} element`);

/**
 * @param {string} name
 * @returns {null}
 */
export const logNotFoundError = (name) => {
  console.error(`${name} not found.`);
  return null;
};
