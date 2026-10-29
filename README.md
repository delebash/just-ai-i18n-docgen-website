# just-ai-i18n-docgen-website

The site for **Just AI i18n & DocGen** — the landing pages and the user guide, at
<https://delebash.github.io/just-ai-i18n-docgen-website/>. Built with [Astro](https://astro.build/)
and [Starlight](https://starlight.astro.build/), the same setup as `justwrite-website`.

## Develop

```bash
npm install
npm run dev          # http://localhost:4321/just-ai-i18n-docgen-website/
```

`predev` copies the user docs from the app checked out beside this repo
(`../just_ai_i18n_docgen/docs/*.md` and `docs/toc.json`) into `src/content/docs/docs/` — gitignored.

## Build

```bash
npm run build        # the docs of the app's LATEST RELEASE (docs.tar.gz), then dist/
npm run build:local  # the docs of the app checked out beside this repo, then dist/
```

`prebuild` fetches `docs.tar.gz` from the latest release of `delebash/just_ai_i18n_docgen` (the
app's release workflow attaches it). Until the app's first release it takes the docs from the app's
`main` branch instead (`docs/*.md` and `docs/toc.json`, what a release packs) — JustWrite's site
always has a release, this one doesn't yet. `npm run sync-docs:release -- --tag v0.2.0` pins a
release; `npm run sync-docs:main` takes `main`'s docs either way.

## What's where

| Path | What |
|---|---|
| `src/pages/index.astro` | Overview: the hero, the three steps, the promise, the screens |
| `src/pages/features.astro` | Every feature by group, and where to get the app |
| `src/data/features.js` | The feature list — the app README's Features, kept in step with it |
| `public/screenshots/` | Real captures from the app's e2e harness (`npm run screenshots` in the app) |
| `scripts/sync-docs.js` | The docs import (`--from local`, `--from release` or `--from main`) |
| `src/styles/global.css` · `starlight-brand.css` | The look — the app's tokens and its splash plate's palette |

## Deploy

```bash
npm run deploy       # builds and publishes the site on GitHub (gh workflow run deploy.yml)
```

`.github/workflows/deploy.yml` builds and publishes to GitHub Pages only when asked — `npm run deploy`
or the Actions page's *Run workflow* — never on a push, a schedule or another repository's workflow:
after an app release (or a change to the app's docs before its first one), run it. Its build takes the
docs as `npm run build` does. In the repo's **Settings → Pages**, the source is *GitHub Actions*.

## License

MIT — see `LICENSE`.
