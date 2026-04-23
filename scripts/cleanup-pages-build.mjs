import { copyFile, readFile, rm, writeFile } from "node:fs/promises";

const generatedFiles = [
  "dist/_worker.js/wrangler.json",
  "dist/_worker.js/.dev.vars"
];

// Keep build artifacts required by `astro preview` by default.
// Enable pruning only for explicit publish flows that need lean output.
if (process.env.CLEANUP_PAGES_BUILD === "1") {
  for (const filePath of generatedFiles) {
    try {
      await rm(filePath, { force: true });
    } catch (error) {
      console.warn(`[cleanup-pages-build] Failed to remove ${filePath}:`, error);
    }
  }
}

try {
  await copyFile("dist/_worker.js/entry.mjs", "dist/_worker.js/index.js");
} catch (error) {
  console.warn("[cleanup-pages-build] Failed to create dist/_worker.js/index.js:", error);
}

// Astro Cloudflare preview treats configs with `pages_build_output_dir` as Pages projects,
// and then rejects the generated `ASSETS` binding name as reserved.
// Remove only this flag from the generated worker config to keep `astro preview` usable.
try {
  const generatedWranglerPath = "dist/_worker.js/wrangler.json";
  const raw = await readFile(generatedWranglerPath, "utf8");
  const config = JSON.parse(raw);
  if ("pages_build_output_dir" in config) {
    delete config.pages_build_output_dir;
    await writeFile(generatedWranglerPath, JSON.stringify(config), "utf8");
  }
} catch (error) {
  console.warn("[cleanup-pages-build] Failed to normalize dist/_worker.js/wrangler.json:", error);
}
