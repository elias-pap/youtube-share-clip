#!/usr/bin/env node

import { ZipArchive } from "archiver";
import { createWriteStream } from "fs";

/**
 * @param {string} sourceDir /some/folder/to/compress
 * @param {string} outPath /path/to/created.zip
 * @returns {Promise<void>}
 */
const zipDirectory = (sourceDir, outPath) => {
  const archive = new ZipArchive({ zlib: { level: 9 } });
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
