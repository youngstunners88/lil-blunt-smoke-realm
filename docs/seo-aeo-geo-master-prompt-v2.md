# SEO / AEO / GEO — master prompt (v2, grounded in repo state of 2026-10-01)

Paste everything below the line into a fresh session. It is written to an agent,
not to a human. Every fact in section 2 was read from a file or a live check in
this repo; items I could not verify are labelled **UNVERIFIED**.

---

## 1. Mission

Make an assistant or a search engine that is asked about Lil Blunt: The Smoke
Realm describe it **correctly** and send the person to https://www.smokegame.win/
or the itch.io page — and prove each improvement with a measurement that could
have come out the other way.

The goal is **correct description and referral**, not rank. The project's own
research (`marketing/aeo/LESSONS.md`, 2026-08-29) found the category keyword
niche carries roughly 0–70 searches a month, so category ranking is not the
growth mechanism. Treat any plan that depends on ranking for "free browser
platformer" as suspect until Search Console data says otherwise.

You may propose better methods than the ones below. State the goal you are
serving, and say why the method differs.

## 2. Ground truth (read, do not re-derive)

### 2.1 Live and shipped
- Production is Caffeine Draft 44 plus Version 45 (the www/non-www URL
  consistency round), which the founder says is live. `python3
  marketing/aeo/verify_publish.py` passed **34/34** after that. It checks the
  app view, the crawler view, the JS bundle, and banned names/claims. It does
  **not** specifically sweep for a remaining `https://smokegame.win` (no www).
  Caffeine's source check found none in site files, but nobody has checked the
  served pages for it.
- Canonical entry (live in `marketing/CANONICAL-ENTRY.md`, `claims.json` is an
  older, shorter version): "Lil Blunt: The Smoke Realm is a free 2D
  side-scrolling platformer and arcade score-chaser playable in a web browser on
  desktop or mobile. Built in Godot 4 and exported to HTML5, the Wild West video
  game stars the mascot Lil Blunt, who throws axes and faces Tax Collector
  enemies across three stages, Smoke Realm, Crystal Caverns and Gold Rush, each
  ending in a boss. No download, no account and no crypto wallet, with nothing to
  buy."
- DIAMONDS and DIAMONDS-II (GitHub Pages) link to the game with descriptive
  anchors. A LinkedIn post and an X post mention the game. All are nofollow or
  low-weight: they help entity recognition and referral, not authority.

### 2.2 Measurement — what we actually have
- **Probe** (`marketing/aeo/probe.py`, history in `history.jsonl`): 50 readings,
  one model (Gemini), on **two dates only** (2026-08-29: 19, 2026-09-27: 31).
  We are cited in **3 of 50**, and all 3 are the brand query. Six category
  queries (8 readings each) cite us **0 times**. Six more rows failed with
  **HTTP 402 (OpenRouter credits exhausted)**.
  Consequence: no trend can be claimed. The probe's own rule is that a shift
  counts only when it holds for three consecutive runs.
- **Research benchmark** (`docs/research/2026-09-30-benchmark.md`): Jev scores
  our pages behind the best winning pages on `geo.category_anchored` (+0.65 gap),
  `geo.entity_clarity` (+0.55) and `aeo.evidence_density` (+0.36); ahead on
  `aeo.quotable` and `aeo.answers_question`. Fetched by plain HTTP.
- **Search Console: not connected.** No impressions, clicks or index-coverage
  data exist. The CrawlConsole tracker is on every page; **UNVERIFIED** whether
  anyone reads its referrer data.
- **Backlinks:** `market/refdomains-smokegame.win.json` lists only SEO-spam
  domains (`rankseohub.shop`, `toprankauthority.shop`…), all nofollow. There are
  zero real inbound links in the data.

### 2.3 Known broken or unknown
- **Firecrawl key is dead (401).** Plain HTTP works as a fallback.
- **Prerender cache is inconsistent.** Crawlers get an `x-pre-rendered: 1`
  snapshot (max-age ~14 days); a query string bypasses it. It refreshed on the
  Draft 44 publish but not on Draft 40's. Caffeine exposes no purge. Never
  report "crawler view fixed" from a cache-busted request.
- **Caffeine cannot verify its own deployed output** (password-protected
  preview). "Verified" from Caffeine means source only.
- **Flagged copy left alone by founder choice or deferral:** `Gold.tsx` ("earn
  while the mine works", "audited, on-chain, and binding"), the "On-Chain
  Points" nav label, "Web3" in meta and JSON-LD, image alt "frontier outlaw".
  DIAMONDS and DIAMONDS-II make token/ETH-reward claims that the accuracy gate
  flags (0.61–0.71 on rewards / play-to-earn); the founder owns those.
- Probe cost: ≈$0.115 per Gemini reading's run set, ≈$0.395 on Grok.

### 2.4 Failure modes this project already produced (treat as regression tests)
1. Verified the wrong view (browser, via cache-buster) and called it the crawler
   view.
2. Removed a claim from JSON-LD and declared it gone while the same sentence
   was still visible copy and in the JS bundle.
3. Keyword-grep "phantom page" audit that false-passed.
4. Control and name claims asserted from memory (WASD, touch, "Dustrock Mines",
   "Tax Man") that the game source contradicted.
5. A skill that stated a rule ("reduced motion is permanent") the founder had
   already overruled.
6. Accused a tool of failing when the test itself was flawed.

## 3. Non-negotiables

- Do **not** change game code, portals, or Episode 2 gating. The game is a
  separate repo (GM-GAME), read-only to you.
- Do **not** remove, replace, disable or restyle the background video
  (`SmokeBackground`). Only the founder's explicit words permit that
  (`keep-the-video`, CLAUDE.md §7).
- Blocking claims (AGENTS.md): no on-chain scores, no verifiable leaderboard, no
  token/airdrop/NFT rewards, no play-to-earn. Never fabricate ratings or
  reviews. No contact details; the project is decentralised, no HQ.
- **Nothing ships unattended.** Caffeine work is a draft; the founder presses Go
  live. A chat message to Caffeine may have auto-promoted a draft before (v40):
  treat every dispatch as possibly publishing and say so.
- Dependencies: the Caffeine build installs separately. Prefer dependency-free
  solutions for anything that must run on the deployed site.
- `src/frontend/dist/` is never committed. Run `pnpm fix && pnpm build && pnpm
  test --run` from `src/frontend/` before any frontend commit.
- Pronoun and identity rule: never assume pronouns for anyone named in copy.
- Do not print secret values. Presence-check env vars only.

## 4. Workstreams

Do them in this order. Each has an acceptance test that can fail. Stop and
report if an acceptance test cannot be run, instead of substituting a weaker one.

### W0 — Re-baseline on the live site (30 min, no changes)
Run `python3 marketing/aeo/assess.py` and `verify_publish.py`. Add the missing
non-www sweep: fetch `/`, every sitemap URL, `llms.txt`, `sitemap.xml` and the
JS bundle in both views (crawler UA without a query string; browser UA with a
random cache-buster) and grep for `https://smokegame.win` and `//smokegame.win`.
**Accept:** a table of view × URL × result, each labelled with the view.
Fold the sweep into `verify_publish.py` so it is permanent.

### W1 — Fix measurement before optimising (highest leverage)
Without measurement, W2–W5 are guesses.
1. **Probe is blocked on credits (402).** Report the balance need; do not top up
   yourself. Run the probe only when the founder confirms credits.
2. **Add a trend gate:** `marketing/aeo/probe_trend.py` reads `history.jsonl` and
   reports per entity: readings, cited, Wilson CI, and whether the three-
   consecutive-run rule is met. Today it must say "insufficient: 2 run dates".
3. **Founder items to unblock (ask once, in a single list):** connect Search
   Console (and Bing Webmaster) for smokegame.win; paste a fresh
   `FIRECRAWL_API_KEY`; confirm weekly probe cadence.
4. **Referral proof:** find out whether CrawlConsole records referrers. If it
   does, write `marketing/aeo/referrals.py` to pull visits by source
   (linkedin, x/t.co, itch, github.io, ChatGPT/Perplexity if present). If not,
   say "not measurable today".
**Accept:** `probe_trend.py` runs on current history and prints a verdict; the
founder question list is delivered; referral measurability is answered yes/no
with evidence.

### W2 — Entity and category anchoring (largest measured gap)
Target: `geo.category_anchored`, `geo.entity_clarity`.
1. Build `marketing/aeo/entity_consistency.py`: for every owned surface (home
   head, JSON-LD, noscript, 11 static pages, `llms.txt`, itch page content,
   DIAMONDS and DIAMONDS-II sections, LinkedIn/X post text if provided), check
   that it contains the canonical name exactly once in the title/first
   sentence and the same category phrase ("2D side-scrolling platformer",
   "arcade score-chaser", "Wild West", "free", "browser"). Output a matrix.
2. Close gaps from the matrix, gated by `jev.py --gate` and the deterministic
   proper-noun check in `research_agent.py` (`unverified_names`). Jev cannot
   catch an invented proper noun; the source check does.
3. `geo-representation` per rewrite; do **not** apply it blindly: the research
   agent's top proposals are candidates, not instructions.
**Accept:** the matrix is all-pass; every changed passage passes the accuracy
gate and the name check; re-run the benchmark and report the new gaps next to
the 2026-09-30 numbers.

### W3 — Evidence density
Add only checkable facts: three stage names, enemy name, the input map from
`project.godot`, touch controls (dated), package size (**UNVERIFIED** in this
repo — re-read GM-GAME before stating a number), Episode status. Facts come from
`gm-game-sync`. No claim without a file and line in the game source or a repo
file you can cite. Do not add `aggregateRating` or review markup.
**Accept:** each added fact has a citation entry in a facts file (see W7).

### W4 — Residual claim cleanup (decision list, not action)
Present, do not edit: `Gold.tsx` copy, "On-Chain Points" label, "Web3" in meta
and JSON-LD, "frontier outlaw" alt, DIAMONDS token claims. For each: current
text, the AGENTS.md rule it touches, the Jev gate score, a proposed replacement,
and the cost of leaving it. The founder decides.
**Accept:** one-page decision table.

### W5 — Third-party presence (referral first, authority second)
Read `marketing/backlinks/targets.md` and its readiness gate first. Re-check each
blocker's current state (itch tagline, itch tags, snapshot freshness) before any
submission. Draft, do not post: the LinkedIn rewrite (gated), an X reply with the
www URL, directory submissions that fit the "would a player click through"
test. Do not buy links; the five spam referring domains are a reason to ignore,
not to disavow reflexively. Never link properties you own for authority alone
(`owned-property-links`).
**Accept:** every draft is gated and listed in `marketing/aeo/outbox/` with its
status; nothing is sent.

### W6 — Crawler view
Record `x-pre-rendered`, `age`, and byte size for `/` and 10 pages, once a day
for a week, using a script, to learn the real refresh behaviour. Ask Caffeine
only questions it can answer from docs. Do not assert refresh behaviour you
have not observed more than once.
**Accept:** a table over time and a stated confidence.

### W7 — Facts as a single source (structural fix for the drift problem)
The controls sentence is repeated across about ten files and has been wrong
more than once. Create `marketing/aeo/facts.json` (extend `claims.json` rather
than adding a second file) with each fact, its source file:line in GM-GAME, and
a verified date, plus `facts_lint.py` that fails if any page contradicts or
omits a required fact. Do **not** introduce templating into the Caffeine site.
**Accept:** lint passes on current repo; it fails on a deliberately broken
copy of one page.

### W8 — Learning loop
Every surprise gets an entry via `marketing/aeo/log_lesson.py` the same day. At
the end of the run, update `project-playbook` routing and `docs/morning-report.md`.

## 5. Agent architecture

| Role | Does | Must not |
|---|---|---|
| Orchestrator (main session) | Owns repo writes, plans, reports | Verify its own output |
| Fact checker (`gm-game-sync`) | Reads GM-GAME, returns cited facts | Write copy |
| Researcher (`research-agent`) | Benchmarks, proposes | Apply anything |
| Judge (`jev.py` gate, name check) | Scores, blocks | Generate copy |
| Verifier (`verify_publish.py`, `assess.py`) | Checks live, both views | Be edited by the author in the same change as the thing it checks |
| Dispatcher (Caffeine chat) | Builds a draft | Go live; be believed about its deployed output |
| Founder | Go live, secrets, credits, owned-property claims | — |

Rules: the generator and the judge are different components. Independent
subagents are for fan-out research only; give each a self-contained prompt. Model routing:
Jev for cheap calibrated judgments, the session model for writing, `model-council`
only to stress-test an expensive decision. Parallelise independent probes and
fetches; serialise anything that writes.

**Agent scorecard** (record in the morning report): claims asserted that a later
check contradicted; verifications that named their view; dollars spent; drafts
that went live without founder action (target: zero); time from "built" to
"verified live".

## 6. Abstraction layers

```
L0  Truth        GM-GAME source (read-only), AGENTS.md blocking rules, founder decisions
L1  Facts        facts.json / claims.json, each fact -> source file:line, date
L2  Copy         canonical entry + passage variants (gauntlet generates, never publishes)
L3  Gate         jev.py --gate, unverified_names, banned-claims list, entity_consistency
L4  Surfaces     repo files -> Caffeine draft; off-site drafts in marketing/aeo/outbox
L5  Delivery     draft only; founder Go live; no auto-publish
L6  Verification verify_publish.py, assess.py; both views; JS bundle; non-www sweep
L7  Measurement  probe_trend.py, Search Console, referrals; three-run rule
L8  Learning     LESSONS.md, skills, project-playbook
```

Rules: a layer consumes only the layer beneath it; **changes flow down, evidence
flows up**; a failure at L6/L7 reopens the layer where the fault originates
(L1 for a wrong fact, L3 for a gate that passed a false claim), not L4. Today's
leaks: facts are copied by hand into many L4 surfaces (W7 closes this), and L7
is missing real data (W1).

## 7. Deliverables

New: `marketing/aeo/probe_trend.py`, `entity_consistency.py`, `facts_lint.py`,
`referrals.py` (only if measurable), a non-www sweep in `verify_publish.py`, a
`docs/research/<date>-entity-matrix.md`, a W4 decision table. Skills: update
`project-playbook` (route this workflow), `rapid-assessment` (non-www sweep),
`aeo-measurement` (trend gate); create **at most one** new skill,
`entity-consistency`. Do not create a skill for something a script already
enforces.

## 8. Order, budget, stop conditions
Order W0 → W1 → W2 → W3 → W7 → W6 → W5 → W4 → W8, with W6's daily capture
started at W0 so it has time to accumulate. Stop and report if: credits are
needed, a secret is needed, an accuracy gate blocks a fact you believe is
true, a check cannot be run, or two attempts at a fix fail. Report with:
what changed (files), what each acceptance test returned, what you could not
verify, and the three highest-value decisions for the founder.
