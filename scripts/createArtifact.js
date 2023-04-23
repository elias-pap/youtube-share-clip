#!/usr/bin/env node

import archiver from "archiver";
import { createWriteStream } from "fs";

/**
 * @param {string} sourceDir /some/folder/to/compress
 * @param {string} outPath /path/to/created.zip
 * @returns {Promise}
 */
const zipDirectory = (sourceDir, outPath) => {
  const archive = archiver("zip", { zlib: { level: 9 } });
  const stream = createWriteStream(outPath);

  return new Promise((resolve, reject) => {
    archive
      .directory(sourceDir, false)
      .on("error", (err) => reject(err))
      .pipe(stream);

    stream.on("close", () => {
      console.info("Created extension.zip successfully.");
      resolve();
    });
    archive.finalize();
  });
};

zipDirectory("build", "extension.zip");
