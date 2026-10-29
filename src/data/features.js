// SPDX-License-Identifier: MIT
// The feature list — the app's README "Features" section, kept in step with it; every line is
// what docgen's user docs (docs/*.md) say it does. `doc` is the guide page that explains it.

export const FEATURE_GROUPS = [
  {
    name: "Translate",
    line: "a run that only proposes",
    doc: "translate",
    items: [
      ["A language dashboard", "Home is one row per target language — progress, status, the last run. Tick languages and press Translate; they run one after another."],
      ["Proposals, not writes", "A run stages proposals. Your locale file is byte-identical until you press Apply."],
      ["Shielded strings", "Placeholders, glossary terms and markup are swapped for tokens the model can't break; a string whose shield comes back damaged is never written."],
      ["Your rules ride along", "Per-language conventions and your per-key notes go into every prompt."],
      ["Scopes and history", "Pending is every missing key plus every flagged one; the Runs page adds flagged, unsure and all, and the run history."],
      ["Nothing silently skipped", "Cancel keeps the staged work. A key that fails every retry is named at the end of the run."],
    ],
  },
  {
    name: "Verify",
    line: "every string checked, four ways",
    doc: "verification",
    items: [
      ["Offline checks", "Placeholders, plural halves, glossary, punctuation edges, numbers, brackets, doubled words, whitespace — deterministic, no engine, no network."],
      ["The probe", "Re-translates a sample with the same engine and flags where the two passes disagree. It refuses to run at temperature 0."],
      ["The confirmation pass", "Asks the engine only about targets identical to their source, and pre-ticks the ones it confirms. It never signs anything off."],
      ["Terminology", "A key that renders a term differently from the rest of your catalogue is flagged."],
      ["Escalation", "Re-translate only the stubborn keys with a stronger preset; what the everyday model got right stays untouched."],
    ],
  },
  {
    name: "Review",
    line: "nothing ships unseen",
    doc: "review",
    items: [
      ["A queue that sorts the work", "Buckets with live counts — needs review, unsure, terminology, missing, came back identical, proposed, accepted — a per-check breakdown, and search."],
      ["Everything beside the string", "Why it's flagged in plain words, the source with its placeholders marked, the proposal, a Google Translate second opinion, a back-translation, the namespace siblings."],
      ["Acceptances that expire", "An acceptance covers one exact pair of strings; change either side and the finding comes back. Each is stamped with the reviewer's name, in a file you commit."],
      ["One undo for one click", "Undo reverts the last action — even applying two thousand proposals at once. Any acceptance can be taken back."],
      ["Notes teach the next run", "A note on a key rides into that key's next translation."],
      ["Keyboard first", "j/k to move, a to accept, e to edit, b to back-translate, g for the Google panel, / to search."],
    ],
  },
  {
    name: "Setup",
    line: "one fact about your app",
    doc: "project-setup",
    items: [
      ["Point, then check", "Give it the path to your source locale file. Check path reports the keys, the placeholder syntax, the plural separator, the locale files already there — and writes nothing."],
      ["Languages, context, glossary", "Pick target languages, write one sentence about your app, and list the terms never to translate."],
      ["Your files, in your repo", "Save writes just-ai-i18n-docgen/config.json beside your package.json; config, acceptances and notes are committed, the machine state is gitignored."],
    ],
  },
  {
    name: "Help docs",
    line: "front matter becomes locale keys",
    doc: "docs-authoring",
    items: [
      ["Write once", "A help page's lede and field hints become lede.<page> and hints.<page>.<field> keys that translate and review like any other."],
      ["A CI gate", "extract --check fails when the docs and the keys drift. YAML it doesn't support is refused, never guessed."],
    ],
  },
  {
    name: "Command line",
    line: "the same brain, no window",
    doc: "cli",
    items: [
      ["Five commands", "translate, check, escalate, accept, extract — check exits non-zero on failures, so it gates CI."],
      ["One implementation, two doors", "A CLI run shows up in Review exactly like an app run; the installed app carries the command beside its exe."],
    ],
  },
  {
    name: "AI",
    line: "local or online, your choice",
    doc: "ai-providers",
    items: [
      ["A built-in local engine", "Quick Setup checks your computer, proposes a model that fits, and downloads llama.cpp and the model — private and free."],
      ["Measured models only", "The catalog lists models this tool's checks were run against; a model that writes lovely prose can still mangle placeholders."],
      ["Any provider", "OpenAI, Anthropic and Gemini directly, or any OpenAI-compatible server — Ollama, LM Studio and more."],
      ["Routing by feature", "Translate, review and confirm each point at their own preset; the Lab shows the real prompt the pipeline builds."],
    ],
  },
  {
    name: "Around it",
    line: "desktop, headless, yours",
    doc: "settings",
    items: [
      ["Headless when you want", "The server on port 8742 serves the whole app to a browser, behind access tokens when it's exposed, and can keep running in the tray."],
      ["Your data folder", "App data sits in a data folder inside the install directory; Settings → Storage moves it."],
      ["English and Spanish", "Every screen — and docgen's own Spanish was translated with docgen and reviewed before it shipped."],
    ],
  },
];

/** The screenshots in public/screenshots — real captures of the app (its e2e harness, `npm run
 *  screenshots`), taken on JustWrite's catalog, the project docgen translates, in English. No Setup
 *  shot: Setup shows the project's folder on the computer that took it. */
export const SHOTS = [
  ["home.png", "Home — one row per target language"],
  ["runs.png", "Runs — scopes and the run history"],
  ["review.png", "Review — the queue, the list and the detail pane"],
  ["docs.png", "Docs — help pages' front matter as locale keys"],
];
