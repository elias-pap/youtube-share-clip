import { rm } from "node:fs/promises";

const clean = async () => {
  const outputDir = new URL("../../build", import.meta.url);
  try {
    await rm(outputDir, { recursive: true, force: true });
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  }
};

clean();
