// SPDX-License-Identifier: MIT
// Starlight's `docs` content collection. Its pages are written into src/content/docs/docs/ by
// scripts/sync-docs.js (gitignored); this file only declares the collection for Astro's loader.
import { docsLoader } from "@astrojs/starlight/loaders";
import { docsSchema } from "@astrojs/starlight/schema";
import { defineCollection } from "astro:content";

export const collections = {
  docs: defineCollection({ loader: docsLoader(), schema: docsSchema() }),
};
