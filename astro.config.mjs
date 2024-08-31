import { defineConfig } from "astro/config";
import netlify from "@astrojs/netlify";

// https://astro.build/config
export default defineConfig({
  output: "server",
  server: {
    port: 3000,
  },
  adapter: netlify(),
});
