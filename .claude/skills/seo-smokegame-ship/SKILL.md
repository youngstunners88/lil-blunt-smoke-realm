---
name: seo-smokegame-ship
description: Operationalises the smokegame.win SEO masterplan — multi-user-agent variant parity, canonical host, head/JSON-LD packages, sitemap and robots state, Caffeine dispatch drafting, and post-"Go live" verification. Use when auditing, fixing, or verifying the live hub's SEO state, or when asked about indexing, cloaking, canonical, or whether SEO work actually reached production. Not for generic SEO advice, llms.txt authoring, itch.io copy, or backlink outreach.
---

# Shipping SEO to smokegame.win

Executes `docs/seo-smokegame-masterplan.md`. Current measured state, with
evidence, is `docs/seo-audit-baseline.md` — **read that before acting**, and
refresh it if it is stale.

## The one thing that makes this project different

**The live host serves two different documents depending on User-Agent.**
Googlebot receives a 128 KB page; a browser receives a 5.8 KB page. They
disagree on title, on canonical, and on content. Measured 2026-09-02.

Every instinct about "fix the head tag and you're done" is wrong here, because
there are two heads and you are probably editing neither. Before any SEO change
is called complete, prove which variant it landed in.

**Second constraint:** this repo is not the deploy path. Caffeine builds from a
separate copy and ships on a chat dispatch plus a manual "Go live" click.
Committing is not shipping. Always re-measure production after a deploy.

## When this skill defers

It asserts the masterplan's fixed decisions; it does not re-derive strategy.

| Hand off to | For |
|---|---|
| `seo-optimization` | Whether something is good SEO practice in general. |
| `aeo-ai-discoverability` | Authoring `llms.txt`, FAQ copy, crawlable static content. This skill only verifies it reaches the crawler variant. |
| `aeo-measurement` | Running `probe.py` / `quality_gate.py` and scoring content. |
| `search-ranking-strategy` | Whether a term is worth chasing. Already answered: measured volume is ~0–70/month, so AEO beats classic ranking. |
| `itch-page`, `backlink-building` | Masterplan Phases 5 and 6. |
| `blind-spots`, `learning-loop` | Retrospective after each Go live. |

## Workflow — reordered from the masterplan

The spec's order assumes one page. It does not survive the UA split, so parity
comes first: patching the head only fixes the variant you touched, while Google
keeps indexing the other one.

### P0 — Multi-UA baseline

```sh
python3 marketing/aeo/crawl_gate.py
```

It now fetches with both a crawler and a browser UA and prints a
`USER-AGENT SPLIT` banner plus per-variant claim columns. **A claim that is
`yes` for browser and `NO` for crawler is still a failure** — search and answer
engines read the crawler variant.

When auditing by hand, cover the answer-engine crawlers too, not just
Googlebot: `GPTBot`, `OAI-SearchBot`, `ClaudeBot`, `PerplexityBot`, `Bingbot`.
AEO is the higher-value channel here, so those user agents matter more than
Googlebot does.

Record findings in `docs/seo-audit-baseline.md`. Quote responses. Do not infer.

### P1 — Variant parity (blocks everything downstream)

Needs a founder decision, then a Caffeine dispatch. Either:

- **(a)** stop serving a bot-specific render, so every UA gets one document; or
- **(b)** make the crawler variant the source of truth and ship all head and
  body content into it.

Done when title, canonical, H1 and the full claim set are identical across UAs.
Until then the site carries cloaking risk — non-equivalent content by UA is a
spam signal, not a cosmetic bug.

### P2 — Canonical and host

One host: `https://www.smokegame.win/`. Apex 301s to www. `og:url` matches the
canonical. Today the crawler variant has **no** canonical and the browser
variant points at the apex while being served from www.

### P3 — Head package

Dispatch the masterplan §1.2 block to Caffeine **with these corrections** — the
spec violates its own accuracy rule:

- Strip "on-chain proof-of-play" and "earn proof-of-play badges". `AGENTS.md`
  records as blocking that scores are not on-chain today and no NFT is minted.
- Do not set `author` to an `Organization` with a URL. The project is
  decentralised, with no company and no HQ, which the Terms now state.
- Never add `aggregateRating` without real reviews.

### P4 — robots, sitemap, GSC

Root and genuinely-live URLs only; never placeholder routes. GSC verification
is a founder task — write the checklist, and never report "indexed" without
evidence.

### P5 — AEO content parity

Content is authored under `aeo-ai-discoverability`. This skill's job is to
verify it lands in the crawler variant, because that is what answer engines
fetch.

Phase 5 (itch.io) runs in parallel from day one — it depends on none of this.

## Verification after every Go live

Committing is not shipping, and a passing local build says nothing about
production. After each deploy:

1. `python3 marketing/aeo/crawl_gate.py` — expect no split banner, and every
   claim `yes` in the crawler column.
2. Confirm one canonical, on www, identical across UAs.
3. Confirm `/troubleshooting/` returns a real document, not the app shell.
4. Confirm `llms.txt` is the authored file, not Caffeine's boilerplate — it has
   been silently overwritten by the platform before.

## Standing rules

- Never invent gameplay, stages, ratings, or token claims to win a keyword.
- Never add a sitemap entry for a page that does not exist.
- Never claim play-to-earn, token rewards, NFT minting, or on-chain scoring.
  Leaderboard figures on the site are demo data and labelled as such.
- Output exact diffs or HTML blocks plus a verification command — not prose
  describing what someone should do.
