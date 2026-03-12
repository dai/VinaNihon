import { defineConfig } from "astro/config";
import cloudflare from "@astrojs/cloudflare";

export default defineConfig({
  adapter: cloudflare({
    imageService: "passthrough"
  }),
  output: "server",
  build: {
    client: "./",
    server: "./_worker.js"
  }
});
