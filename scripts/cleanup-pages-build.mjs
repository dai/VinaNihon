import { rm } from "node:fs/promises";

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
