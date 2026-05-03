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
  searchParams.set("autoplay", "true");
  let queryString = searchParams.toString();
  let embedUrl = `https://www.youtube.com/embed/${encodeURIComponent(videoId)}?${queryString}`;

  return embedUrl;
};

/**
 * @returns {void}
 */
const renderHomePage = () => {
  if (!app) {
    return;
  }

  app.replaceChildren();

  let messageElement = document.createElement("div");
  messageElement.className = "clip-message";

  let textElement = document.createElement("p");
  textElement.textContent = "Want to start sharing YouTube clips for free?";
  messageElement.append(textElement);

  let linkElement = document.createElement("a");
  linkElement.href =
    "https://chromewebstore.google.com/detail/youtube-share-clip/jknkoohnhhnlnojgddpjgibniodllhae?hl=en";
  linkElement.textContent = "Get the extension";
  messageElement.append(linkElement);

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

const main = () => {
  let videoId = getVideoId();

  if (!videoId) {
    renderHomePage();
  } else {
    renderPlayer(videoId);
  }
};

main();
