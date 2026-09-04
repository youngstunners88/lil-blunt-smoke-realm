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

- [x] **T7 — Corrected SEO head-package, ready to dispatch.** (2026-09-02: docs/seo-head-package.md — masterplan §1.2 with the three accuracy violations removed; www canonical; draft only, not dispatched)
  Per `seo-smokegame-ship` P3: write `docs/seo-head-package.md` containing the
  exact `<head>` block (title, meta description, canonical on www, OG/Twitter,
  VideoGame JSON-LD) to dispatch to Caffeine — with the masterplan's accuracy
  violations removed (no "on-chain proof-of-play", no Organization author with a
  URL, no aggregateRating). A prepared draft only; do NOT dispatch it.
  **Acceptance:** every value is accuracy-clean vs AGENTS.md; canonical is www;
  committed under docs/.

- [x] **T8 — Google Search Console founder checklist.** (2026-09-02: docs/seo-gsc-checklist.md — non-technical, verify→sitemap→request-indexing, with the honest "don't claim indexed without evidence" close)
  Per masterplan P2: write `docs/seo-gsc-checklist.md` — the exact steps for the
  founder to verify the property, submit the sitemap, and request indexing, with
  the honest note that indexation is not claimed without evidence.
  **Acceptance:** a non-technical founder could follow it end to end; committed.

- [ ] **T9 — AEO page: is it play-to-earn?**
  Author `src/frontend/public/faq/play-to-earn/index.html` answering "Is Lil
  Blunt: The Smoke Realm play-to-earn?" — the honest answer is **no**, and that
  honesty is the point: the site's Web3 framing makes this a real query, and
  every other page already states there is no token payout, airdrop, or NFT
  minting. Maps to the `not_onchain` claim. Explain what Proof of Play actually
  is (an achievement layer, still being engineered) versus what play-to-earn
  means, and that the chain here is the web host, not a casino. Same page style
  as `/faq/wallet/`; question in title/H1/first sentence; FAQPage JSON-LD
  matching visible text; www canonical.
  **Acceptance:** passes `python3 marketing/aeo/quality_gate.py <file>` as
  documentation-grade; in `sitemap.xml`; linked from a relevant page (not
  orphaned); `pnpm build && pnpm test --run` clean from `src/frontend/`;
  `dist/` reverted. Must not claim any reward mechanic exists.

- [ ] **T10 — AEO page: does it work on mobile?**
  Author `src/frontend/public/faq/mobile/index.html` answering "Can you play Lil
  Blunt: The Smoke Realm on a phone?" The truthful answer is that it is built
  for a browser with a keyboard, so desktop or laptop is the intended
  experience — there are no touch controls in the current build. This is a real
  pre-click question and answering it honestly prevents a bad first session.
  Cover: why a keyboard is required (the bound keys), that the non-threaded
  HTML5 export does load on mobile browsers but is not playable without a
  keyboard, and what to do instead (play on desktop). Do not promise a mobile
  version or a date.
  **Acceptance:** same as T9 — documentation-grade gate, sitemap, linked, build
  + tests clean, `dist/` reverted.

- [ ] **T11 — Devlog #2: the gzip quality gate.**
  Write `marketing/devlog/gzip-quality-gate.md` — "Filtering AI-generated filler
  with gzip, before you publish it." Document the technique actually implemented
  in `marketing/aeo/quality_gate.py`: normalized compression distance (Cilibrasi
  & Vitanyi) against a hand-written good/spam corpus, why markup is stripped
  first, why a narrow gap is treated as a fail rather than a pass, and the
  honest limitation we hit — a thin 3-file corpus produces ambiguous verdicts on
  genuinely fine pages (what happened to the `free` and `wallet` drafts in T5).
  This is a real, uncommon, first-hand technique post and it earns links
  (`backlink-building` #4). DRAFT ONLY — do not post it anywhere.
  **Acceptance:** passes `quality_gate.py` as documentation-grade; committed
  under `marketing/devlog/`; every claim about the script matches the actual
  code in `marketing/aeo/quality_gate.py`.

- [ ] **T12 — Backlink prospect list.**
  Write `marketing/backlinks/prospects.md` — a researched, ranked list of at
  least 12 concrete places that could plausibly link to smokegame.win or the
  itch page, drawn from what `backlink-building` says is worth chasing for this
  project (Godot/HTML5 dev communities, ICP/Internet Computer ecosystem
  listings, free-browser-game directories, devlog platforms). For each: the
  name, the exact URL to submit or post to, what it wants, which asset we
  already have that fits (the devlogs, the itch page, the press kit), and a
  one-line honest pitch. Rank by realistic chance of acceptance, not by domain
  authority.
  **Acceptance:** every URL is real and reachable (verify each with a fetch, and
  drop any that 404); no prospect requires a claim `AGENTS.md` marks false;
  committed. **Do not contact anyone** — this is a list for the human to work.

- [ ] **T13 — Directory & showcase submission pack.**
  Write `marketing/backlinks/submission-pack.md`: for the top 5 prospects from
  T12, the exact paste-ready submission text for each (title, blurb at whatever
  length that site wants, tags, links, screenshot choice). Reuse the verified
  copy in `marketing/itch/page-content.md` rather than inventing new claims.
  The human pastes these; nothing here is automatable.
  **Acceptance:** a reviewer could submit to all five without writing a word
  themselves; every factual claim traces to `claims.json` or
  `marketing/itch/page-content.md`; T12 must be done first.

- [ ] **T14 — Measurement refresh + delta.**
  Run `python3 marketing/aeo/crawl_gate.py` and record current live state.
  Compare against the last measurement in `docs/morning-report.md` and
  `docs/seo-audit-baseline.md`. Answer specifically: is the user-agent split
  still present, did the Caffeine draft go live, are the claims now in the
  **crawler** variant, is `llms.txt` restored, and are the new `/faq/` pages
  reachable to crawlers. Quote measurements; infer nothing.
  **Acceptance:** findings appended to the morning report with numbers; if the
  draft went live, say so as the headline — that unblocks everything else.
  This task is repeatable: when it is the only one left, re-open it rather than
  leaving the queue empty.

- [ ] **T15 — Searchata indexing check (data-gated).**
  Follow `searchata-seo` workflow W2 + W4 (see `docs/searchata-integration-spec.md`
  for the tool spec, budget rules, and cached `propertyId`
  `property_9e59bca5-4a8a-46d4-954a-9f568f879512`). Budget: 2 calls max —
  `google_search_console_inspect_urls` (batch, all `/faq/*`, `/about/`,
  `/how-to-play/` URLs, 1 call) and `google_search_console_get_performance`
  with `dimensions: ["date"]` over 28 days (1 call). Compare against the
  2026-09-03 baseline in `docs/seo-audit-baseline.md` (1 impression, 0 clicks,
  homepage indexed, sitemap not submitted). Report deltas plainly — do not
  round zero up. If nothing changed, say so; that itself is a finding (still
  waiting on Caffeine Go-live and sitemap submission).
  **Acceptance:** findings appended to `docs/morning-report.md` with the exact
  numbers Searchata returned; total Searchata calls this task ≤2; no claim of
  having fixed or submitted anything (read-only tool). This task is
  repeatable — re-open it after it's done rather than leaving the queue empty,
  same as T14.

## Morning report

Each firing appends to `docs/morning-report.md` (create if missing): the date,
which task it did, what it committed (with the short SHA), measured deltas, and
anything that needs the human. The LAST line of the report is always a ranked
"do first when you wake" list.
