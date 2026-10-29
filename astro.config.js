// SPDX-License-Identifier: MIT
// The site: the landing pages (src/pages) and the user docs through Starlight
// (starlight.astro.build) — justwrite-website's setup, with docgen's docs and look.
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import starlight from "@astrojs/starlight";
import { defineConfig } from "astro/config";

const ROOT = dirname(fileURLToPath(import.meta.url));

// The docs sidebar from docgen's docs/toc.json — the file that orders the in-app Help.
// scripts/sync-docs.js copies it here before dev and build; it is gitignored and may be absent (a
// fresh clone with no app beside it and no release yet), so the sidebar then lists whatever pages
// exist instead of failing the build. The first two entries lead back to the landing pages:
// Starlight replaces the site's chrome on its own routes. A link is written without the base: Starlight
// prepends it (written with it, every page linked /<base>/<base>/).
function docsSidebar() {
  const siteLinks = [
    { label: "← Overview", link: "/" },
    { label: "← Features", link: "/features/" },
  ];
  try {
    const toc = JSON.parse(readFileSync(resolve(ROOT, "src/data/docs-toc.json"), "utf8"));
    return [
      ...siteLinks,
      { label: "User guide", items: [{ slug: "docs" }] },
      ...toc.map((group) => ({
        label: group.group ?? group.section,
        items: group.items.map((item) => ({ slug: `docs/${item.slug}` })),
      })),
    ];
  } catch {
    // a group holding the autogenerate (a group's own `autogenerate` went in Starlight 0.39)
    return [...siteLinks, { label: "Docs", items: [{ autogenerate: { directory: "docs" } }] }];
  }
}

// Keeps the docs' light/dark choice in step with the landing pages, which keep their own under
// `docgen-theme` (Base.astro); Starlight keeps `starlight-theme`. Runs before paint.
const THEME_BRIDGE = `
try {
  var own = localStorage.getItem('docgen-theme');
  var sl = localStorage.getItem('starlight-theme');
  if (own && own !== sl) { localStorage.setItem('starlight-theme', own); document.documentElement.dataset.theme = own; }
  else if (sl && !own) { localStorage.setItem('docgen-theme', sl); }
} catch (e) {}
`.trim();

export default defineConfig({
  // github.io/<repo>/ — a custom domain drops `base` (and sync-docs reads it for the links)
  site: "https://delebash.github.io",
  base: "/just-ai-i18n-docgen-website",
  integrations: [
    starlight({
      title: "Just AI i18n & DocGen",
      description: "Just AI i18n & DocGen — the user guide.",
      logo: { src: "./src/assets/mark.svg", alt: "" },
      customCss: ["./src/styles/starlight-brand.css"],
      sidebar: docsSidebar(),
      head: [{ tag: "script", content: THEME_BRIDGE }],
      social: [{ icon: "github", label: "GitHub", href: "https://github.com/delebash/just_ai_i18n_docgen" }],
      lastUpdated: false,
      credits: false,
    }),
  ],
  build: { inlineStylesheets: "auto" },
  compressHTML: true,
  devToolbar: { enabled: false },
});
