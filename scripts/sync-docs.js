#!/usr/bin/env node
// SPDX-License-Identifier: MIT
// Pulls docgen's user documentation into Starlight's docs collection — the same mechanics as
// justwrite-website's scripts/sync-docs (the family's site, Astro + Starlight). Three modes:
//
//   node scripts/sync-docs.js --from local
//     Copies from ../just_ai_i18n_docgen/docs/ (the app checked out beside this repo, for local
//     work). Without it, exits quietly when given --silent-if-missing.
//
//   node scripts/sync-docs.js --from release [--tag v0.2.0]
//     Downloads docs.tar.gz from a GitHub release of the app (delebash/just_ai_i18n_docgen) —
//     the latest by default, --tag pins one. The CI mode: the site serves the RELEASED docs, not
//     the app's main branch. Until the app's first release there is none to take, so the docs
//     come from its main branch instead (docs/*.md and docs/toc.json, as a release packs them) —
//     not JustWrite's site, which always has a release (the user's word, 2026-10-28).
//
//   node scripts/sync-docs.js --from main
//     The main branch's docs, release or not.
//
// The pages land in src/content/docs/docs/ (gitignored) — the collection nested one level, so
// they serve at /docs/ and the landing pages keep the root. Each .md gets Starlight's front
// matter (its H1 as the title), and `(foo.md)` links become the site's routes. docgen's
// docs/toc.json (the in-app Help's order: `group` → `items`) is copied to src/data/docs-toc.json
// for the sidebar; docgen has no docs/README.md, so the /docs/ index is written from it.

import { execSync } from "node:child_process";
import { cp, mkdir, readdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const TARGET = resolve(ROOT, "src/content/docs/docs");
const TOC_TARGET = resolve(ROOT, "src/data/docs-toc.json");
const APP_REPO = "delebash/just_ai_i18n_docgen";
const LOCAL_APP = resolve(ROOT, "..", "just_ai_i18n_docgen", "docs");

/** The rewritten links' absolute base — astro.config.js's `base` (a relative `./slug` breaks under
 *  GitHub Pages' trailing slash: ./slug from /docs/foo/ is /docs/foo/slug). */
async function readDocsBase() {
  const conf = await readFile(resolve(ROOT, "astro.config.js"), "utf8");
  const m = conf.match(/base:\s*['"]([^'"]+)['"]/);
  const base = (m ? m[1] : "").replace(/\/$/, "");
  return `${base}/docs`;
}

function arg(name, hasValue = false) {
  const i = process.argv.indexOf(name);
  if (i < 0) return hasValue ? null : false;
  return hasValue ? process.argv[i + 1] : true;
}
const FROM = arg("--from", true);
const TAG = arg("--tag", true);
const SILENT_IF_MISSING = arg("--silent-if-missing");

if (FROM !== "local" && FROM !== "release" && FROM !== "main") {
  console.error("Usage: sync-docs --from <local|release|main> [--tag v0.2.0] [--silent-if-missing]");
  process.exit(1);
}

async function exists(path) {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

const titleOf = (markdown, fallback) => markdown.match(/^#\s+(.+?)\s*$/m)?.[1] ?? fallback;
// enough for a double-quoted YAML string
const escapeYaml = (s) => s.replace(/\\/g, "\\\\").replace(/"/g, '\\"');

/** [text](foo.md) → [text](<base>/docs/foo/), keeping a #anchor — absolute, so a link reads the
 *  same from the index and from every page. */
const rewriteLinks = (markdown, docsBase) =>
  markdown.replace(/\]\(([^)\s]+?)\.md(#[^)]*)?\)/g, (_, file, anchor = "") => {
    const slug = basename(file) === "README" ? "" : basename(file);
    return `](${docsBase}/${slug ? `${slug}/` : ""}${anchor})`;
  });

async function processFile(srcPath, docsBase) {
  const slug = basename(srcPath, ".md");
  const raw = await readFile(srcPath, "utf8");
  const title = titleOf(raw, slug);
  // The H1 goes: Starlight renders the front matter's title. `[^\r\n]*`, not `.+` — `.` stops at a
  // \r, and a CRLF checkout left the H1 in place (every page titled twice, JustWrite's site).
  const body = rewriteLinks(raw.replace(/^#\s+[^\r\n]*\r?\n+/, ""), docsBase);
  await writeFile(join(TARGET, `${slug}.md`), `---\ntitle: "${escapeYaml(title)}"\n---\n\n${body}`);
  return slug;
}

/** The /docs/ index: the toc's groups, each page linked — the in-app Help's own order. */
async function writeIndex(toc, docsBase) {
  const groups = toc
    .map((g) => `## ${g.group ?? g.section}\n\n${g.items.map((i) => `- [${i.title}](${docsBase}/${i.slug}/)`).join("\n")}`)
    .join("\n\n");
  const lede = "The same pages the app's Help shows.";
  await writeFile(join(TARGET, "index.md"), `---\ntitle: "User guide"\n---\n\n${lede}\n\n${groups}\n`);
}

async function syncFromDir(dir) {
  const files = (await readdir(dir)).filter((f) => f.endsWith(".md"));
  if (files.length === 0) throw new Error(`No .md files found in ${dir}`);
  const tocPath = join(dir, "toc.json");
  if (!(await exists(tocPath))) throw new Error(`No toc.json in ${dir} — it is the navigation order, shared with the in-app Help.`);
  const toc = JSON.parse(await readFile(tocPath, "utf8"));

  await mkdir(dirname(TOC_TARGET), { recursive: true });
  await cp(tocPath, TOC_TARGET);
  await rm(TARGET, { recursive: true, force: true });
  await mkdir(TARGET, { recursive: true });

  const docsBase = await readDocsBase();
  const slugs = [];
  for (const f of files) slugs.push(await processFile(join(dir, f), docsBase));
  await writeIndex(toc, docsBase);
  return slugs;
}

async function fromLocal() {
  if (!(await exists(LOCAL_APP))) {
    if (SILENT_IF_MISSING) {
      console.log(`sync-docs: ${LOCAL_APP} not found — skipping (--silent-if-missing).`);
      return [];
    }
    throw new Error(`The app's docs aren't at ${LOCAL_APP}. Clone ${APP_REPO} beside this repo, or use --from release.`);
  }
  console.log(`sync-docs: copying from ${LOCAL_APP}`);
  return syncFromDir(LOCAL_APP);
}

async function fromRelease() {
  let tag = TAG;
  if (!tag) {
    console.log(`sync-docs: looking up the latest release of ${APP_REPO}…`);
    const res = await fetch(`https://api.github.com/repos/${APP_REPO}/releases/latest`, { headers: { Accept: "application/vnd.github+json" } });
    if (!res.ok) {
      if (res.status === 404) {
        console.log("sync-docs: no releases yet — the docs from main until the first release.");
        return fromMain();
      }
      throw new Error(`GitHub API ${res.status} ${res.statusText}`);
    }
    tag = (await res.json()).tag_name;
    if (!tag) throw new Error("The latest release has no tag_name.");
  }
  console.log(`sync-docs: fetching docs.tar.gz from ${APP_REPO}@${tag}`);
  const url = `https://github.com/${APP_REPO}/releases/download/${tag}/docs.tar.gz`;
  const res = await fetch(url);
  if (!res.ok) {
    if (SILENT_IF_MISSING && res.status === 404) {
      console.log(`sync-docs: ${tag} has no docs.tar.gz — skipping (--silent-if-missing).`);
      return [];
    }
    throw new Error(`Download failed: ${res.status} ${res.statusText} from ${url}`);
  }
  // staged in the repo, not os.tmpdir(): on Windows that resolves with a `\\?\` prefix cmd.exe
  // can't use as a cwd (JustWrite's site); .docs-cache/ is gitignored
  const tmpDir = resolve(ROOT, ".docs-cache");
  await rm(tmpDir, { recursive: true, force: true });
  await mkdir(tmpDir, { recursive: true });
  await writeFile(join(tmpDir, "docs.tar.gz"), Buffer.from(await res.arrayBuffer()));
  execSync("tar -xzf docs.tar.gz", { cwd: tmpDir, stdio: "inherit" });
  return syncFromDir(join(tmpDir, "docs"));
}

/** The main branch's user docs — docs/*.md and docs/toc.json, what a release packs (never docs/dev or
 *  docs/plans): the folder listed through GitHub's contents API, each file from its download_url. */
async function fromMain() {
  console.log(`sync-docs: fetching the docs from ${APP_REPO}@main`);
  const res = await fetch(`https://api.github.com/repos/${APP_REPO}/contents/docs?ref=main`, { headers: { Accept: "application/vnd.github+json" } });
  if (!res.ok) throw new Error(`GitHub API ${res.status} ${res.statusText} listing ${APP_REPO}/docs`);
  const wanted = (await res.json()).filter((f) => f.type === "file" && (f.name.endsWith(".md") || f.name === "toc.json"));
  const dir = resolve(ROOT, ".docs-cache", "docs");
  await rm(resolve(ROOT, ".docs-cache"), { recursive: true, force: true });
  await mkdir(dir, { recursive: true });
  for (const f of wanted) {
    const file = await fetch(f.download_url);
    if (!file.ok) throw new Error(`Download failed: ${file.status} ${file.statusText} from ${f.download_url}`);
    await writeFile(join(dir, f.name), Buffer.from(await file.arrayBuffer()));
  }
  return syncFromDir(dir);
}

try {
  const slugs = FROM === "local" ? await fromLocal() : FROM === "main" ? await fromMain() : await fromRelease();
  if (slugs.length) console.log(`sync-docs: wrote ${slugs.length} pages and the index to src/content/docs/docs/\n  ${slugs.join(", ")}`);
} catch (err) {
  console.error("sync-docs failed:", err.message);
  process.exit(1);
}
