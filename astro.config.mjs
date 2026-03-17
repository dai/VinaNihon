import { defineConfig } from "astro/config";
import cloudflare from "@astrojs/cloudflare";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  adapter: cloudflare({
    imageService: "passthrough"
  }),
  output: "server",
  vite: {
    plugins: [tailwindcss()]
  },
  build: {
    client: "./",
    server: "./_worker.js"
  }
});
