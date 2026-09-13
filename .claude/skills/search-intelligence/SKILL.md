---
name: search-intelligence
description: Real search-market data via Monid's Ahrefs and Semrush endpoints — keyword volume and difficulty, competitor gaps, traffic and decay analysis — plus the cost guards that stop a single call eating the budget. Use when asked what to rank for, whether a keyword is worth targeting, what competitors rank for, why traffic moved, or for any question needing real SERP data rather than a guess.
---

# Search Market Intelligence

Monid resells **Ahrefs and Semrush per call**, which puts data that normally
costs $129+/month inside a $10 budget. `marketing/aeo/market.py` wraps the
useful endpoints with cost guards.

```bash
python3 marketing/aeo/market.py ours                       # our footprint (free while we rank for nothing)
python3 marketing/aeo/market.py keywords "term one" "term two"
python3 marketing/aeo/market.py their-keywords crazygames.com --limit 10
python3 marketing/aeo/market.py competitors --target somerival.com
```

## The billing trap — read before running anything

**Ahrefs endpoints bill per returned row, and `limit` defaults to 100.**

At $0.072/row for organic-keywords, one unattended default call is **$7.20** —
most of the balance, spent silently, on output nobody read.
`/keywords-explorer/overview` is $0.126/row.

`market.py` therefore prints worst-case cost before every call, refuses to
exceed `--max-spend` (default $1.00), and refuses to spend at all from a
non-terminal unless `--yes` is passed. Both guards are tested. Do not bypass
them by calling `monid run` directly on these endpoints.

**An empty result is free.** That makes "does this term have any volume at all"
a cheap question whenever the answer is no — probe widely, pay only for hits.

| Endpoint | Price/row | Verified |
|---|---|---|
| `/keywords-explorer/overview` | $0.126 | 2026-08-29 |
| `/site-explorer/pages-by-traffic` | $0.168 | 2026-08-29 |
| `/site-explorer/organic-keywords` | $0.072 | 2026-08-29 |
| `/site-explorer/metrics-history` | $0.063 | 2026-08-29 |
| `/site-explorer/organic-competitors` | $0.042 | 2026-08-29 |
| `semrush /domain_rank` (per **call**) | $0.002 | 2026-08-29 |

Re-check with `monid inspect` before trusting these; Monid can reprice, and a
stale number here means a call costs more than the guard predicted.

## The six analyses, and which actually work at zero traffic

This is the part that matters. Most SEO analytics assume you already have
traffic and rankings. Four of these six do, and running them now produces
confident-looking output computed over nothing.

| Analysis | Needs our own data? | Usable now |
|---|---|---|
| Keyword volume / difficulty | No | **Yes** |
| Competitor keyword gaps | No | **Yes** |
| Traffic drop diagnosis | Yes | No — no traffic to drop |
| Keyword cannibalisation | Yes | No — we rank for nothing to compete with |
| Decay alerts | Yes, over time | No — needs a baseline first |
| Report writing | No | Yes, but only over real numbers |

Running a cannibalisation check today returns an empty set, which is not the
same as "no cannibalisation" — it means the question does not apply yet. Say
that rather than reporting a clean bill of health.

The two that do work are the two worth spending on now, and they are exactly
the ones that answer *what should we go after*.

## The finding that reframes the whole SEO effort

Measured 2026-08-29, recorded in `marketing/aeo/LESSONS.md`:

**The category keyword niche has essentially no search volume.** "Wild west
browser game", "western platformer", "godot browser game" and "2d platformer
online free" all return **0**. The best term found was "gold rush game online"
at 70/mo. Control check: "free online games" returns 176,000/mo at KD 93, so
the zeros are real readings and not a broken endpoint.

Ranking #1 for the best available term is roughly **20 visits a month**.

So category SEO is not the growth mechanism here — not because ranking is hard,
but because winning pays almost nothing. The channels that do not depend on
category search volume are where the effort belongs: **brand search** (which
only exists after people meet the name elsewhere), **recommendation surfaces**
(`aeo-measurement` — being named by an assistant needs no search volume), and
**distribution** (`game-distribution` — traffic that never touches a search
box).

**Do not respond to a zero-volume term by writing more content for it.** Check
volume before commissioning a page; a page targeting a 0-volume term is work
that cannot pay off regardless of how good it is.

## Before spending, ask what the answer changes

Per `build-principles`: if you cannot say what you would do differently under
each possible result, the call is curiosity, not research. The keyword volume
check above passed that test — the answer redirected the entire strategy. A
competitor's full keyword list at $7.20 usually does not.
