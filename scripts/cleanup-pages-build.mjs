import { copyFile, rm } from "node:fs/promises";

const generatedFiles = [
  "dist/_worker.js/wrangler.json",
  "dist/_worker.js/.dev.vars",
  ".wrangler/deploy/config.json"
];

for (const filePath of generatedFiles) {
  try {
    await rm(filePath, { force: true });
  } catch (error) {
    console.warn(`[cleanup-pages-build] Failed to remove ${filePath}:`, error);
  }
}

try {
  await copyFile("dist/_worker.js/entry.mjs", "dist/_worker.js/index.js");
} catch (error) {
  console.warn("[cleanup-pages-build] Failed to create dist/_worker.js/index.js:", error);
}
