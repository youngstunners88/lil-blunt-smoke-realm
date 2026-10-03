---
name: research-agent
description: Benchmark pages that already win in this niche, measure the gap to ours with Jev, fact-check proposals against the game source, and produce a report of fixes — fetching through Firecrawl when its key works and plain HTTP when it does not. Use when asked what we are lacking to rank or be cited, how a successful site does it, to run a research or gauntlet loop, or before planning SEO, AEO or GEO work. Not for measuring whether anything was actually cited (aeo-measurement) or for gating finished copy (jev-gauntlet).
---

# Research agent

```bash
python3 marketing/aeo/research_agent.py \
  --urls https://www.crazygames.com/game/gunblood https://poki.com/en/g/gunblood
python3 marketing/aeo/research_agent.py --urls ... --no-gauntlet     # measure only
```

Writes `docs/research/<date>-benchmark.md`. **Nothing is applied automatically.**

## The loop

```
FETCH    Firecrawl if its key is valid, plain HTTP if not. Probed once; reported.
MEASURE  facts in code (words, h2, schema types, FAQ, rating markup)
         judgement in Jev, per passage, on the aeo + geo batteries
COMPARE  the same numbers for our pages, rubric by rubric
GAUNTLET generate variants of our list entry for the weakest rubrics,
         accuracy-gate them (blocking), score survivors
CHECK    every proper noun against the GM-GAME source (deterministic)
```

Code owns what grep can answer; Jev owns the rest. That split is the point.

## What the 2026-09-30 run found

| Finding | Detail |
|---|---|
| **Both benchmarks ship `BreadcrumbList` schema; we ship none** | A documented, honest type. We already have visible breadcrumb nav on every static page. Cheap to add. |
| **Word count is not the lever** | CrazyGames' page is **225 words**, Poki's 1,091, ours 1,626. Matches the case study in `query-expansion`. |
| **Our gaps** | `category_anchored` +0.61 (1.20 vs 1.81), `entity_clarity` +0.50, `evidence_density` +0.42 |
| **We beat them on** | `quotable` and `answers_question` — they are not written to answer questions |
| **Do not copy** | CrazyGames carries `AggregateRating`. We have no real ratings; fabricating them is a blocking violation |

## The flaw this skill exists to remember

The first run's proposals all repeated "Dustrock Mines", "Tax Man" and "outlaw
prospector", and invented mechanics ("trap-filled", "axe-throwing destroys mine
obstacles"). The generator had been **told** those names were true. Jev's gate
passed every one, because it judges claims about tokens and rewards and cannot
know a place does not exist.

**A generator is only as honest as the facts it is fed, and a model judge cannot
catch a fabricated proper noun.** The fix is the deterministic fact-check and a
generation brief limited to names verified in the game source. After it, all five
top proposals came back with every name found in the game.

## Firecrawl

`FIRECRAWL_API_KEY` in this environment is **dead** (`401 Invalid token`;
`STATUS.md` in GM-GAME reported the same). The agent falls back to plain HTTP
and says so in the report header. What that costs: bot-walled pages such as
**IGDB return a Cloudflare challenge (403)** and itch.io rate-limits (429), both
of which Firecrawl exists to get past. **To enable it, paste the new key as
`FIRECRAWL_API_KEY` in the environment variables; a new session is needed.**

## Honest limits

- **A benchmark shows what a winner looks like, not what caused the win.**
  CrazyGames and Poki rank on authority we do not have. Brand-owned pages are
  ~8% of AI-engine sources; `docs/gemini-aeo-research-2026-09-09.md`.
- **Jev ranks passages; it does not predict citation.** Only `probe.py` does.
- **The agent proposes; a human disposes.** The fact-check catches names, not
  invented behaviour. Read every proposal.

## When this hands off

| Situation | Go to |
|---|---|
| Names and facts about the game | `gm-game-sync` |
| Gating what the agent proposes | `jev-gauntlet` |
| Did it get cited | `aeo-measurement` |
| Shipping the result | `seo-smokegame-ship`, Caffeine |
