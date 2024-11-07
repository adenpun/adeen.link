import { defineConfig } from "astro/config";
import netlify from "@astrojs/netlify";

import tailwind from "@astrojs/tailwind";

// https://astro.build/config
export default defineConfig({
  output: "server",

  server: {
    port: 3000,
  },

  adapter: netlify(),
  integrations: [tailwind()],
});