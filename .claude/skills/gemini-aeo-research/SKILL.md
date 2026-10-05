---
name: gemini-aeo-research
description: Run a parallel fan-out of specialist research subagents on how Google's AI surfaces (AI Overviews, AI Mode, Gemini grounding) actually select and cite sources, then convert findings into ranked, testable hypotheses measured against marketing/aeo/probe.py. Use when asked to research AEO/GEO, to figure out how to get cited by Gemini or AI Overviews, to go viral in AI answers, or to plan AI-search visibility work. Not for running the probe itself (aeo-measurement) or authoring the pages (aeo-ai-discoverability).
---

# Gemini AEO deep research

Spawns specialist subagents to research how Google's AI surfaces choose what
to cite, grades what they find by evidence quality, and lands on **testable
hypotheses** — not a list of best practices.

## The measured baseline this exists to move

`marketing/aeo/history.jsonl`, run 2026-08-29:

> **Gemini recommended this game 0 out of 14 probes.** `n_cited_ours` zero
> throughout.

That zero is the scoreboard. Any research output that cannot be connected to
moving it is decoration. `probe.py` already probes Gemini
(`google/gemini-3.7-flash:online`, web grounding ON) — **the measurement
instrument already exists**; do not rebuild it.

## The premise this skill deliberately does NOT assume

The common claim is *"Gemini is the best target for AEO because Google data is
abundant."* Treat that as an untested hypothesis:

- Google's surface is plausibly where this audience searches. Prioritising it
  is defensible.
- But **"abundant data about Google" ≠ "abundant evidence about AEO."** Most
  published AEO/GEO guidance is vendor marketing built on small samples by
  firms selling AEO services. A fan-out of naive researchers will return a
  confident consensus that is really just the loudest sales copy.

Subagents are therefore briefed to **grade sources**, and to report an honest
"we don't know" over a synthesised consensus. `blind-spots` calls this exact
failure — building on unverified premises — the one this project repeats.

## Source tiers — every claim gets one

Subagents must tag every finding:

| Tier | What qualifies | Weight |
|---|---|---|
| **A — Primary** | Google's own documentation, Search Central blog/docs, patents, published papers, official statements, live observable behaviour of the surface itself | Actionable |
| **B — Independent empirical** | Studies with disclosed methodology and sample size, from a party not selling AEO services; reproducible experiments | Actionable if methodology holds |
| **C — Vendor/marketing** | Agency blogs, SEO-tool content marketing, "we analysed 1M AI Overviews" with no method, LinkedIn threads | Context only — never the basis of a recommendation |
| **D — Speculation** | Undated posts, no source, AI-generated listicles, restated folklore | Discard, but note if widely repeated (tells us what the market believes) |

**A recommendation supported only by tier C or D is not a recommendation.**
Report it as "widely claimed, unverified."

## The fan-out

Four lanes, non-overlapping, run in parallel. Each subagent gets: the role
brief, the source tiers above, the required output shape, and the standing
project constraints below.

### Lane 1 — Mechanism (how selection actually works)
> You are a search-systems researcher who reads primary sources — Google
> patents, Search Central documentation, published retrieval papers — and
> refuses to infer mechanism from marketing claims.

Question: what is actually documented about how AI Overviews / AI Mode /
Gemini grounding retrieve, select, and cite sources? Query fan-out, passage
selection, grounding chunks, what makes a passage quotable. Distinguish
documented from inferred.

### Lane 2 — Empirical citation patterns
> You are a quantitative analyst who judges a study by its methodology and
> sample, and discards any figure whose method is not disclosed.

Question: what do *credible* studies show about which pages get cited — page
type, structure, freshness, domain authority, brand mentions vs links? Report
sample sizes and who funded each study. Flag where the evidence is thin.

### Lane 3 — Google's own surfaces and levers
> You are a technical SEO who verifies claims against live behaviour and
> official docs, and knows most "AI SEO checklists" are recycled.

Question: what concrete, *verifiable* levers exist — structured data types
Google documents for AI surfaces, Search Console AI-surface reporting,
Merchant/entity signals, indexing prerequisites, `llms.txt` reality check
(is it actually consumed by Google, or aspirational?). Separate "Google says
this matters" from "practitioners believe this matters."

### Lane 4 — This niche specifically
> You are a games-marketing researcher grounded in what actually surfaces for
> free browser game queries, not general B2B SEO advice.

Question: for queries like "free browser platformer no download," what does
Google's AI surface actually cite today — aggregators, itch.io, Reddit,
YouTube, individual game sites? Where does a single small title realistically
appear, and via which intermediary? Run real queries; report observed results.

## Standing constraints every subagent must carry

- **Accuracy rules bind the output.** No recommendation may require claiming
  play-to-earn, token rewards, NFT minting, or on-chain score storage — all
  blocking-false per `AGENTS.md`.
- **This site deploys through Caffeine**, a separate codebase; repo commits do
  not ship. Recommendations must name whether they need a Caffeine dispatch.
- **Search volume here is ~0–70/month** (`search-ranking-strategy`). Do not
  return keyword-volume strategies; the prize is citation, not ranking.
- **Never recommend buying links or placements** (`backlink-building`).
- **Report "no credible evidence" when that is the finding.** A lane that
  honestly returns little is more useful than one that pads.

## Required output shape (each subagent)

```
FINDING:     one sentence
TIER:        A | B | C | D
SOURCE:      URL + date + who published it + funding interest if any
SO WHAT:     what it implies for a small free browser game with zero citations
TESTABLE?:   the specific change, and how probe.py would show it worked
CONFIDENCE:  high | medium | low — and what would change it
```

## Synthesis (the orchestrator's job, not the subagents')

1. **Discard** every tier-C/D-only recommendation into a separate "market
   folklore" section — keep it, labelled, because knowing what everyone
   believes has its own use.
2. **Rank surviving hypotheses** by (expected effect on the measured zero) ÷
   (effort + risk), not by how often they were repeated.
3. **Write each as an experiment**, not advice: the change, the prediction,
   the probe that judges it, and how long before re-probing is meaningful.
4. **Note contradictions between lanes explicitly** — where lanes disagree is
   usually where the real uncertainty lives.
5. Output to `docs/gemini-aeo-research-<date>.md`, and log a lesson via
   `marketing/aeo/log_lesson.py` if a prior project belief turned out wrong.

## Verification loop — the part that makes this real

Research alone changes nothing. The loop:

```
research → ranked hypotheses → ship ONE change → wait → probe → compare
```

```bash
python3 marketing/aeo/probe.py --run --models gemini --report
```

Re-probe against the 0/14 baseline. **Non-determinism is real**: models and
samples vary run to run, so a single changed answer is noise. Look for a
sustained shift across a full question set, and never claim a change "worked"
off one probe.

## When this hands off

| Situation | Go to |
|---|---|
| Running probes / interpreting trend data | `aeo-measurement` |
| Actually authoring the pages, llms.txt, schema | `aeo-ai-discoverability` |
| Whether the live site is even crawlable | `seo-smokegame-ship` (crawl gate first) |
| Getting cited *via* another site | `backlink-building` |
| Pressure-testing a conclusion before acting | `model-gauntlet` |
