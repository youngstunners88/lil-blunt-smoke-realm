# SEO / AEO / GEO program — v3

**How to use this file.** It is a program, not one request. Part A is shared
context; paste it into every session. Part B holds the work cards, and each one
is a self-contained prompt. **Run one card per session**: paste Part A, then
the single card you want done. A session that tries several cards does each of
them shallowly. Part C is for whoever runs the program: order, budget, roles,
layers and deliverables.

Facts marked ✅ were checked live on 2026-10-01 by the method named. Facts marked
⚠️ are unverified and must be checked before anything relies on them.

---

## PART A — Shared context (paste into every session)

### A1. Mission

When a person asks an assistant or a search engine about Lil Blunt: The Smoke
Realm, the answer should **describe the game correctly** and **send them to
https://www.smokegame.win/** (or the itch page). Prove every improvement with a
measurement that could have come out the other way.

Rank is not the goal. Measured category search volume is about 0–70 searches a
month (`marketing/aeo/LESSONS.md`, 2026-08-29). A plan that only pays off by
ranking for "free browser platformer" needs Search Console data before anyone
builds it.

If you see a better method for a card, propose it. Name the goal it serves and
say why it beats the method written here.

### A2. Ground truth

**Production**
- ✅ Live is Caffeine Version 45 (www URLs consistent). `verify_publish.py` returned 34/34 after the publish.
- ✅ The non-www sweep is clean for 13 URLs in both views (method: crawler UA with no query string, and browser UA with a random cache-buster): `/`, the 10 static pages, `llms.txt` and `sitemap.xml`. All 11 HTML pages are served prerendered to crawlers. ⚠️ The JS bundle was not swept.
- ✅ The canonical entry is in `marketing/CANONICAL-ENTRY.md`. `marketing/aeo/claims.json` is an older and narrower copy. Its controls sentence omits A/D, W, J and touch, so it is stale.

**Third-party surfaces**
- ✅ **itch.io page body (live, founder-edit only):**
  - It still says "Collect on-chain Blunts and own your character upgrades", "your progress is truly yours" and "the full experience with on-chain saves and NFT collectibles, play at smokegame.win".
  - Those are blocking-false under AGENTS.md. This is the most visible live accuracy violation the project has.
  - Portals and answer engines quote itch, and the page sends readers to smokegame.win with a promise the site denies.
- ✅ **itch tags:** 2d, arcade, free, high-score, html5, pixel-art, singleplayer, western. The "tags empty" blocker in `marketing/backlinks/targets.md` is closed. Update that file.
- ✅ **Name split:** itch's product name is **"Lil Blunt Adventure"**, and the site's JSON-LD carries "Lil Blunt Adventure" as `alternateName`. One game is presented under two names.
- ✅ **Links from owned sites:**
  - DIAMONDS and DIAMONDS-II link to the site and to itch with anchors that use the canonical name.
  - A LinkedIn post links `https://www.smokegame.win/`.
  - An X post (@smokering25) shows a demo video with no site link.
  - All of these are nofollow or near-zero weight. Their value is entity signal and referral, not authority.

**Measurement**
- ✅ **Probe** (`marketing/aeo/probe.py`, `history.jsonl`):
  - 50 good readings from one model (Gemini), on two dates only: 2026-08-29 and 2026-09-27.
  - We are cited in 3 of 50, and all 3 are the brand query. The six category entities scored 0 of 48.
  - Six more rows failed with HTTP 402 (out of credits).
  - The probe stores whether we were cited, **not the answer text**. It cannot tell whether an assistant described the game *correctly*, which is the mission.
- ✅ **OpenRouter balance is about $2.28** (85.00 credited, 82.72 used; read from `/api/v1/credits`, no key printed). Every Jev call, gauntlet, research run and probe spends from it. One weekly Gemini probe costs about $0.80.
- ✅ **Search Console is not connected.** There is no impression, click or coverage data anywhere.
- ⚠️ **CrawlConsole:**
  - Caffeine reports the tracker tag on all 11 pages.
  - `docs/crawlconsole-integration.md` recorded telemetry as "pending" before that.
  - Whether AI-crawler hits and AI referrals (`get_crawler_analytics`, `get_ai_referral_analytics`) now report data is unverified. The connector is not loaded in this environment.
- ✅ **Referring domains:** the only ones in `marketing/aeo/market/refdomains-smokegame.win.json` are SEO-spam, all nofollow.
- ✅ **Benchmark** (`docs/research/2026-09-30-benchmark.md`):
  - We trail the best winning page on `geo.category_anchored` (+0.65), `geo.entity_clarity` (+0.55) and `aeo.evidence_density` (+0.36).
  - We lead on `aeo.quotable` and `aeo.answers_question`.
  - Firecrawl is dead (401), so pages were fetched over plain HTTP.

**Known open behaviour**
- **Prerender cache:**
  - A crawler UA on a canonical URL gets a snapshot (`x-pre-rendered: 1`). A query string bypasses it.
  - It refreshed on the Draft 44 publish but not on Draft 40's, and Caffeine has no purge.
  - Never report the crawler view from a cache-busted request.
- **Caffeine verification:** Caffeine cannot verify its own deployed output. "Verified" from Caffeine means source only.
- **Deferred items the founder owns:**
  - `Gold.tsx` copy ("earn while the mine works", "audited, on-chain, and binding").
  - The "On-Chain Points" nav label, "Web3" in meta and JSON-LD, and the "frontier outlaw" alt text.
  - The DIAMONDS token claims.

### A3. Non-negotiables

1. **Game code is read-only.** No changes to game code, portals or Episode 2. GM-GAME is read-only. Every gameplay fact comes from its source, with file:line (`gm-game-sync`).
2. **The background video is protected.** Never remove, replace, disable or restyle `SmokeBackground` without the founder's explicit words (`keep-the-video`, CLAUDE.md §7).
3. **Blocking claims (AGENTS.md):** none of on-chain scores, a verifiable leaderboard, token/airdrop/NFT rewards, play-to-earn, or fabricated ratings and reviews. The canonical entry has no contact details and no HQ.
4. **Nothing ships, posts or spends unattended.** Caffeine work is a draft, and the founder presses Go live. Treat any Caffeine chat message as possibly publishing, because v40 promoted without a clear trigger. The itch page, X, LinkedIn and Search Console are founder actions: draft for them, never act for them.
5. **Budget.** Before any OpenRouter-spending step, state its estimated cost against the remaining balance. Stop if it would leave less than $0.50. Never top up.
6. **Repo hygiene.**
   - From `src/frontend/`, run `pnpm fix && pnpm build && pnpm test --run` before any frontend commit.
   - Never commit `src/frontend/dist/`.
   - Prefer dependency-free code, because Caffeine installs separately.
7. **Secrets:** presence checks only. Never print secret values.

### A4. Regression list (failures this project already produced)

A card is not done until its verification could have caught each of these:

1. Verifying the browser view and calling it the crawler view.
2. Removing a claim from one place (JSON-LD) while it survives in visible copy or the JS bundle.
3. A check whose pass condition the failure itself satisfies, such as a keyword grep against a phantom page that repeats the keyword.
4. Gameplay facts written from memory (WASD, "Dustrock Mines", "Tax Man") that the source contradicts.
5. A skill stating a rule the founder had already overruled.
6. Blaming a tool when the test was wrong.
7. *New, found today:* auditing only the surfaces we can edit. The worst live violation sits on itch, which nobody re-checked after 2026-09-02.

### A5. Report format (every card)

```
CARD: <id>      RESULT: done | blocked | partial
Changed:        <files, with one line each>
Acceptance:     <each test, its command, and what it returned>
Could not verify: <list, with why>
Spend:          <$ OpenRouter, before → after>
Founder decisions needed: <numbered, each answerable in one line>
Lessons logged: <LESSONS.md entry titles, or "none">
```

---

## PART B — Work cards (paste one per session)

### Card 1 — Third-party truth audit (do first, cost $0)

**Goal.** Every surface that describes the game says the same true thing, under one name.

**Why.** itch.io carries live NFT and on-chain claims, and it uses a second product name. Answer engines weigh third-party pages more than a site's own claims, so a contradiction there competes with the hub.

**Steps.**
1. Build `marketing/aeo/surfaces.json`. For each surface record: id, URL, owner (`repo` / `caffeine` / `founder` / `third-party`), how to fetch it, and who can edit it.
   - The surfaces: the site's 11 pages plus `llms.txt`, the itch page, the itch JSON-LD, DIAMONDS, DIAMONDS-II, the LinkedIn post and the X post.
   - For LinkedIn and X, record the public text as fetched, or mark the surface unfetchable.
2. Build `marketing/aeo/surface_audit.py`. It fetches each surface and runs four checks:
   - the banned-claim list from `verify_publish.py`, imported rather than copied;
   - the `unverified_names` proper-noun check from `research_agent.py`;
   - a name check (canonical name present; any other name flagged);
   - a category-phrase check (free, browser, 2D side-scrolling platformer, Wild West).

   Output a surface × check matrix. Make it dependency-free.
3. For each failing surface the founder owns, draft paste-ready replacement text into `marketing/itch/page-content.md` and `marketing/aeo/outbox/`. Run every draft through `jev.py --gate` and the name check.
4. Write the **name decision** as one founder question with a recommendation:
   - (a) rename itch to the canonical name, keeping "Lil Blunt Adventure" as `alternateName`;
   - (b) keep both deliberately;
   - (c) other.

   State the GEO cost of each option.

**Acceptance.**
- The matrix shows itch failing on "on-chain"/"NFT" today. If it doesn't, the audit is broken, so fix the audit.
- A deliberately corrupted copy of `/about/` fails the audit.
- Every draft passes the gate and the name check.

**Stop if:** a surface cannot be fetched. Record it as unfetchable and continue, but never mark it passing.

### Card 2 — Measure correctness, not just citation (cost about $0.90; ask first)

**Goal.** The probe answers both "were we cited?" and "were we described correctly?"

**Steps.**
1. Change `probe.py` to store, for every reading, the answer text (truncated to 2,000 characters), the model, the date and the grounding URLs.
   - Keep the history schema backward compatible.
   - Old rows lack the text. Do not backfill guesses.
2. Add `marketing/aeo/answer_accuracy.py`. It scores each stored answer with the deterministic checks from Card 1 plus the `jev.py --gate` blocking questions. Output per entity: named correctly, category correct, blocking claim present, artist confusion present.
3. Add `marketing/aeo/probe_trend.py`. Per entity, report readings, cited count, a Wilson CI, accuracy rates, and whether the three-consecutive-run rule holds. On today's history it must print "insufficient: 2 run dates".
4. Ask the founder for credits before running. With approval, run one Gemini probe (about $0.80) plus scoring.

**Acceptance.**
- `probe_trend.py` runs on the current history and prints the insufficiency verdict.
- A hand-written fake answer containing "play-to-earn" is flagged.
- The new run's rows include answer text.

### Card 3 — Ground-truth facts in one place (cost $0)

**Goal.** One fact file that every page is linted against, so facts stop drifting. The controls sentence has been wrong in several files more than once.

**Steps.**
1. Extend `marketing/aeo/claims.json` into a fact registry. Do not add a second file. For each fact store:
   - the text;
   - the source as GM-GAME `file:line`, or a repo file;
   - the date verified;
   - the pages required to state it;
   - the pages forbidden to contradict it.

   Re-read GM-GAME for every fact (`gm-game-sync`). Mark package size and Episode status ⚠️ until the source confirms them.
2. Add `marketing/aeo/facts_lint.py`. It fails if a page omits a required fact or contains a known-wrong variant (WASD-only, mouse controls, "no touch controls", "Tax Man", "Dustrock Mines").
3. Wire it into `assess.py` as a check. Do not introduce templating into the Caffeine site.

**Acceptance.**
- Lint passes on the repo.
- It fails on a copy of `/faq/controls/` with the old controls sentence.
- `claims.json` no longer carries the stale controls line.

### Card 4 — Close the entity and category gap (cost about $0.40 in Jev; ask first)

**Goal.** Lift `geo.category_anchored` and `geo.entity_clarity` without adding a single unverified claim.

**Steps.**
1. Take the lowest-scoring passages on our pages from the benchmark rerun (`research_agent.py`, plain HTTP).
2. Rewrite only those passages, using only facts from Card 3. The pattern: name, then category, then platform, then the distinguishing facts.
3. Gate every rewrite (`jev.py --gate`, `unverified_names`, `facts_lint.py`). Score it (`passage.py`).
4. Package the passing rewrites as one Caffeine round in the established format: draft only, files listed, protected items restated, ending "reply with files changed and what you could not verify".

**Acceptance.**
- The before/after table beats the 2026-09-30 numbers on both rubrics.
- Zero gate failures.
- `verify_publish.py` still returns 34/34 after the founder publishes.
- The crawler view is reported only from an uncache-busted request, or reported as stale with its age.

### Card 5 — Is anyone actually arriving? (cost $0)

**Goal.** Answer "does the LinkedIn, X, itch or DIAMONDS traffic exist?" with data, or say it cannot be answered.

**Steps.**
1. Use `connector-onboarding` to check whether the CrawlConsole connector can be loaded. If it can, pull AI-crawler hits and AI referrals for the last 30 days.
2. If the connector cannot be loaded, find another referrer source (Caffeine analytics, a server log) or state "not measurable".
3. Write the founder steps for Search Console and Bing Webmaster verification: the DNS TXT method or the meta tag. The meta tag would be a Caffeine round.

**Acceptance.**
- Either a referrer table with dates, or a written "not measurable, because X, unblocked by Y".

### Card 6 — Crawler-cache behaviour (cost $0, runs for 7 days)

**Goal.** Know how long crawlers see stale pages after a publish.

**Steps.**
1. Write `marketing/aeo/snapshot_watch.py`. For `/` and the 10 static pages, without a cache-buster, record:
   - `x-pre-rendered`, `age`, `cache-control` and `date`;
   - the byte size;
   - the `<h1>`;
   - a hash of the visible text.

   Append each reading to `marketing/aeo/snapshots.jsonl`.
2. Schedule a daily routine (a fresh session per fire, report only) through `create_trigger`, with founder approval.

**Acceptance.**
- Seven days of rows.
- A stated refresh interval with its confidence.
- An entry in `LESSONS.md` if the observed behaviour contradicts what Caffeine says.

### Card 7 — Founder decision sheet (cost $0, no edits)

**Goal.** Put every open decision in one place, each answerable in one line.

**Items.**
- The itch body text (Card 1 draft).
- The product name (Card 1).
- `Gold.tsx`, "On-Chain Points", "Web3" in meta and JSON-LD, the "frontier outlaw" alt text, and the DIAMONDS token claims.

For each item give:
- the current text, with file:line or URL;
- the AGENTS.md rule it touches and its gate score;
- the proposed text;
- the cost of leaving it.

Also include the credits top-up, Search Console, Firecrawl, and the X reply with the link.

**Acceptance.** One page in `docs/decisions-<date>.md`. No item depends on reading anything else.

### Card 8 — Third-party presence (cost $0, drafts only; blocked on Card 1)

**Goal.** More places where a player would click through. Not more authority.

**Steps.**
1. Re-check the readiness gate in `marketing/backlinks/targets.md` against today's state. Card 1 and the founder's itch fix must be done first.
2. Draft submissions and posts that pass the "would a person here click and play" test from `backlink-building`. Gate each one and put it in the outbox. Send nothing.

Do not buy links. Do not disavow the spam domains reflexively. Do not link owned properties for authority alone (`owned-property-links`).

**Acceptance.** Every draft is gated, carries the canonical name, and is listed with its status.

---

## PART C — Running the program

### C1. Order and budget

| # | Card | Cost | Blocked on |
|---|---|---:|---|
| 1 | Third-party truth audit | $0 | — |
| 3 | Fact registry + lint | $0 | — |
| 7 | Founder decision sheet | $0 | Cards 1 and 3 |
| 6 | Snapshot watch (start early, it needs days) | $0 | founder approval for the routine |
| 5 | Referral measurement | $0 | connector availability |
| 2 | Correctness probe | ~$0.90 | **credits** |
| 4 | Entity/category rewrite | ~$0.40 | Card 3, credits |
| 8 | Third-party presence | $0 | Card 1 + founder's itch fix |

At about $2.28, the balance covers Cards 2 and 4 once each. It does not cover a weekly probe. The first founder ask is credits, sized from this table.

### C2. Agent roles

| Role | Component | Does | Must never |
|---|---|---|---|
| Orchestrator | main session | plans, writes repo files, reports | grade its own work |
| Fact source | `gm-game-sync` → GM-GAME | returns facts with file:line | write copy |
| Generator | session model / `gauntlet.py` | drafts copy | publish or gate |
| Judge | `jev.py --gate`, `unverified_names`, `facts_lint.py` | blocks | generate |
| Verifier | `verify_publish.py`, `assess.py`, `surface_audit.py` | checks live, both views, all surfaces | be changed in the same commit as what it verifies |
| Builder | Caffeine chat | builds drafts | go live; be trusted about deployed output |
| Researcher | `research_agent.py` / subagents | benchmarks, proposes | apply anything |
| Founder | — | Go live, credits, secrets, third-party accounts, owned-claim decisions | — |

**Model routing.**
- Jev for calibrated yes/no and scoring. It is cheap per call, but not free at this balance.
- The session model for writing and planning.
- Subagents only for independent fan-out fetches, each with a self-contained prompt.
- `model-council` only for a decision that costs money or reputation.

Parallelise reads and fetches. Serialise every write.

**Agent scorecard.** Append it to `docs/morning-report.md` every session:
- claims that a later check contradicted;
- verifications that named their view, out of the total;
- dollars spent per accepted card;
- drafts that went live without founder action (target: 0);
- regression items (A4) that each verification could have caught.

### C3. Abstraction layers

```
L0  Truth         GM-GAME source · AGENTS.md rules · founder decisions
L1  Facts         claims.json registry (fact → source file:line → date)
L2  Copy          canonical entry · passage variants (gauntlet output; never published directly)
L3  Gates         jev.py --gate · unverified_names · facts_lint · banned claims · name check
L4  Surfaces      surfaces.json: owner + edit path for every place the game is described
L5  Delivery      repo → Caffeine draft → founder Go live · founder-only surfaces get drafts
L6  Verification  verify_publish (both views + bundle) · surface_audit · snapshot_watch
L7  Measurement   probe (citation + correctness) · probe_trend · referrals · Search Console
L8  Learning      LESSONS.md · skills · project-playbook routing
```

**Rules.**
- A layer reads only from the layer below it.
- Changes flow down and evidence flows up.
- A failure at L6 or L7 reopens the layer where it began, not the surface where it showed. A wrong fact is an L1 fix, and a gate that passed a false claim is an L3 fix.

**Leaks today.**
- L1 is copied by hand into about ten L4 surfaces (Card 3).
- L4 has no registry, so third-party surfaces went unaudited (Card 1).
- L7 measures citation but not correctness (Card 2).

### C4. Deliverables registry

**Scripts.** Each is dependency-free and has a self-test or a failing fixture.
- `surface_audit.py` with `surfaces.json`
- `answer_accuracy.py`
- `probe_trend.py`
- `facts_lint.py`
- `snapshot_watch.py`
- changes to `probe.py` (store answer text)
- changes to `assess.py` (call `facts_lint` and `surface_audit`)
- changes to `verify_publish.py` (JS-bundle non-www sweep)

**Markdown.**
- `docs/decisions-<date>.md`
- `docs/research/<date>-surface-matrix.md`
- an update to `marketing/backlinks/targets.md` (tags blocker closed; itch claims added as a blocker)
- `LESSONS.md`: "audited only what we could edit", plus any new surprise
- the morning report scorecard

**Skills.** No new skill. Update:
- `rapid-assessment`: run `surface_audit` and cover third-party surfaces.
- `aeo-measurement`: correctness scoring, the trend gate and the budget guard.
- `itch-page`: the live violations of 2026-10-01 and the name decision.
- `project-playbook`: route this program.

A new skill earns its place only when a script cannot enforce the rule.

**Explicitly not building:**
- new pages for category keywords (no volume);
- rating or review markup;
- link buying;
- a disavow file;
- templating inside Caffeine;
- a second facts file.

### C5. Program-level stop conditions

Stop the program and report to the founder when any of these happens:
- the balance would drop below $0.50;
- a gate blocks a fact the source supports (the L3 gate itself needs fixing);
- two fix attempts fail on the same card;
- a draft goes live without the founder;
- any check in A4 cannot be run.
