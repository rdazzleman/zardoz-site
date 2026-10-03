// @ts-check
import { defineConfig } from "astro/config";

// Custom domain: the site is served from the apex, so no `base` is needed.
// public/CNAME carries the domain through to the published artifact.
export default defineConfig({
  site: "https://zardoz.io",
  // Code blocks in /docs follow the page's light or dark theme (global.css).
  markdown: {
    shikiConfig: { themes: { light: "github-light", dark: "github-dark" }, defaultColor: false },
  },
});
