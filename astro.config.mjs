import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
  site: "https://poeba.lu",
  base: "/",
  output: "static",
  integrations: [tailwind(), sitemap()],
  image: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.bcbits.com",
      },
    ],
  },
});
