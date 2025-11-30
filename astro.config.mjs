// @ts-check

import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import { defineConfig } from "astro/config";

import tailwindcss from "@tailwindcss/vite";

import node from "@astrojs/node";

export default defineConfig({
  site: "https://weblog.proteus.works",
  integrations: [mdx(), sitemap()],

  vite: {
    plugins: [tailwindcss()],
  },

  adapter: node({
    mode: "standalone",
  }),

  markdown: {
    shikiConfig: {
      // https://shiki.style/themes
      theme: "catppuccin-mocha",
    },
  },
});
