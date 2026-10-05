import { rm } from "node:fs/promises";

const clean = async () => {
  const nodeModules = new URL("../../node_modules", import.meta.url);
  const lockfile = new URL("../../package-lock.json", import.meta.url);
  try {
    await rm(nodeModules, { recursive: true, force: true });
    await rm(lockfile, { force: true });
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  }
};

clean();
