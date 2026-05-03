import "./web.css";

const app = document.querySelector("#app");

/**
 * @returns {string | null}
 */
const getVideoId = () => {
  let pathParts = window.location.pathname.split("/").filter(Boolean);
  return pathParts[0] ?? null;
};

/**
 * @param {string} videoId
 * @returns {string}
 */
const getEmbedUrl = (videoId) => {
  let searchParams = new URLSearchParams(window.location.search);
  let queryString = searchParams.toString();
  let embedUrl = `https://www.youtube.com/embed/${encodeURIComponent(videoId)}`;

  return queryString ? `${embedUrl}?${queryString}` : embedUrl;
};

/**
 * @param {string} message
 * @returns {void}
 */
const renderMessage = (message) => {
  if (!app) {
    return;
  }

  app.replaceChildren();

  let messageElement = document.createElement("p");
  messageElement.className = "clip-message";
  messageElement.textContent = message;

  app.append(messageElement);
};

/**
 * @param {string} videoId
 * @returns {void}
 */
const renderPlayer = (videoId) => {
  if (!app) {
    return;
  }

  app.replaceChildren();

  let iframe = document.createElement("iframe");
  iframe.className = "clip-player";
  iframe.src = getEmbedUrl(videoId);
  iframe.title = "YouTube video player";
  iframe.allow =
    "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
  iframe.allowFullscreen = true;
  iframe.referrerPolicy = "strict-origin-when-cross-origin";

  app.append(iframe);
};

let videoId = getVideoId();

if (!videoId) {
  renderMessage("Missing YouTube video id.");
} else {
  renderPlayer(videoId);
}
