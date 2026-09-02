# Night-shift work queue

Ordered, bounded task list for the autonomous overnight routine. Each firing of
the routine does **the next unchecked task**, top to bottom, then stops. State
lives in the checkboxes: `[ ]` = to do, `[~]` = claimed/in progress, `[x]` =
done. When every box is `[x]`, a firing does nothing and says so.

Every task here is **repo-local and reviewable**. Nothing in this queue ships to
production, posts anywhere, or spends money — those need the human (see the
`night-shift` skill's hard rules). The morning report lists what needs you.

Rules for editing this file: add tasks only as fully-specified units of work
with their own acceptance check. Never add a task whose "done" cannot be
verified before committing.

---

## Tasks

- [x] **T1 — Three AEO question pages.** (partial, 2026-09-02: /faq/controls/ shipped & gated; free+wallet held as drafts in marketing/aeo/drafts/faq/ — gzip gate ambiguous against thin corpus, see T5)
  Author three static HTML pages under `src/frontend/public/`, one real
  question each, in the exact style of `src/frontend/public/about/index.html`.
  Questions must be things a real person asks and that the game can answer
  truthfully — draw from `marketing/aeo/questions.json` and `claims.json`; do
  not invent gameplay. The question wording goes in the `<title>`, the single
  `<h1>`, and the first sentence. Suggested set (pick the three most defensible):
  "Is Lil Blunt: The Smoke Realm free to play?", "Do you need a crypto wallet to
  play Lil Blunt?", "What are the controls for Lil Blunt: The Smoke Realm?",
  "Is Lil Blunt the game related to the music artist?", "Is Lil Blunt play-to-earn?"
  (answer: honestly no).
  **Acceptance:** each page passes `python3 marketing/aeo/quality_gate.py <file>`
  as documentation-grade; add each to `sitemap.xml`; wire each into the footer's
  content-page list AND `src/frontend/src/lib/contentPages.ts` so none is
  orphaned; `pnpm fix && pnpm build && pnpm test --run` clean; revert `dist/`.

- [x] **T2 — Devlog article draft.** (2026-09-02: marketing/devlog/godot-html5-on-icp.md, quality_gate documentation-grade, gap 0.059)
  Write `marketing/devlog/godot-html5-on-icp.md` — "Exporting a Godot 4.3 game
  to HTML5 and hosting it on the Internet Computer." First-hand and accurate,
  drawn from GM-GAME's real export setup (COOP/COEP headers, the
  SharedArrayBuffer requirement, the asset-canister Range-request issue in the
  `web-audio-playback` skill). This is a genuine, uncommon dev post that earns
  links (`backlink-building` #4). It is a DRAFT for the human to publish to
  dev.to / Hashnode — do not post it anywhere.
  **Acceptance:** passes `quality_gate.py` as documentation-grade; committed
  under `marketing/devlog/`.

- [x] **T3 — Measurement refresh + delta.** (2026-09-02: no change vs baseline; draft still not live)
  Run `python3 marketing/aeo/crawl_gate.py` (UA-aware) and record the current
  live state. Compare against `docs/seo-audit-baseline.md` and write the delta:
  did the Caffeine draft go live, did the snapshot refresh, are the claims now
  in the crawler variant, is `llms.txt` restored. Quote measurements; infer
  nothing.
  **Acceptance:** findings appended to the morning report; if something changed
  materially, note it as a headline.

- [x] **T4 — itch.io paste-pack finalisation.** (2026-09-02: field-by-field COPY-PASTE PACK added at top of page-content.md)
  Make `marketing/itch/page-content.md` a clean copy-paste job: final tagline,
  final "what makes it different" bullets (no on-chain-reward claims), a tag
  set, and the exact text for each itch field. The human pastes it; the itch API
  is read-only so nothing here is automatable.
  **Acceptance:** a reviewer could fill the itch form from this file without
  writing a word themselves.

- [x] **T5 — Rescue the two held FAQ drafts.** (2026-09-02: wallet rewritten to documentation-grade & shipped to /faq/wallet/; free dropped as borderline + duplicative of how-to-play FAQ)
  `marketing/aeo/drafts/faq/{free,wallet}.html` are accurate but the quality
  gate rates them ambiguous against a 3-file corpus. Either rewrite them to
  pass on merit, or expand `corpus/good/` with genuine EXTERNAL documentation
  on "free to play" / "no-wallet Web3" (never seed with these pages). Then move
  the passing ones into `src/frontend/public/faq/<slug>/`, add to sitemap, link
  from a relevant page, build/test, commit.
  **Acceptance:** each shipped page passes `quality_gate.py`; not orphaned.

- [x] **T6 — Disambiguation AEO page (brand collision).** (2026-09-02: shipped /faq/not-the-artist/, quality_gate documentation-grade gap 0.0653; in sitemap; linked from /about/; build + 11 tests clean; dist reverted)
  Author `src/frontend/public/faq/not-the-artist/index.html` answering "Is Lil
  Blunt the game the same as the music artist of a similar name?" — a real query
  (search-ranking-strategy flags the brand-name collision). Answer: it is a free
  browser platformer game, not the musician. Maps to the `not_artist` claim; same
  page style as `/about/`; question in title/H1/first sentence; FAQPage JSON-LD
  matching visible text; www canonical.
  **Acceptance:** passes `quality_gate.py` documentation-grade; in sitemap;
  linked from a relevant page (not orphaned); build + tests clean; dist reverted.

- [ ] **T7 — Corrected SEO head-package, ready to dispatch.**
  Per `seo-smokegame-ship` P3: write `docs/seo-head-package.md` containing the
  exact `<head>` block (title, meta description, canonical on www, OG/Twitter,
  VideoGame JSON-LD) to dispatch to Caffeine — with the masterplan's accuracy
  violations removed (no "on-chain proof-of-play", no Organization author with a
  URL, no aggregateRating). A prepared draft only; do NOT dispatch it.
  **Acceptance:** every value is accuracy-clean vs AGENTS.md; canonical is www;
  committed under docs/.

- [ ] **T8 — Google Search Console founder checklist.**
  Per masterplan P2: write `docs/seo-gsc-checklist.md` — the exact steps for the
  founder to verify the property, submit the sitemap, and request indexing, with
  the honest note that indexation is not claimed without evidence.
  **Acceptance:** a non-technical founder could follow it end to end; committed.

## Morning report

Each firing appends to `docs/morning-report.md` (create if missing): the date,
which task it did, what it committed (with the short SHA), measured deltas, and
anything that needs the human. The LAST line of the report is always a ranked
"do first when you wake" list.
