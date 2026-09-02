# Fable 5.1 — SEO skill design

Run 2026-09-02 via OpenRouter (`anthropic/claude-fable-5.1`, 1M context).
Given the masterplan plus the measured user-agent split, asked to design the
skill, its routing against existing skills, and the corrected phase order.
Output truncated at the token cap after section 3.

## 1. Skill

**Name:** `seo-smokegame-ship`

```yaml
description: Operationalises docs/seo-smokegame-masterplan.md for www.smokegame.win. Use when auditing, fixing, or verifying the live hub's SEO/AEO state — especially UA-split (cloaked) variants, canonical host, head/JSON-LD injection, sitemap/robots, and preparing Caffeine chat dispatches + post-"Go live" verification. Not for generic SEO advice, llms.txt authoring, itch copy, or backlink outreach.
```

## 2. Routing

**Fires when:** the target is smokegame.win specifically AND the task is one of: multi-UA audit, variant parity, canonical/host fix, head package dispatch, sitemap/robots state, phase-status tracking, writing/verifying a Caffeine dispatch, post-deploy verification.

**Defers to:**
- `seo-optimization` — any "is this good SEO practice" question; this skill only asserts the masterplan's fixed decisions.
- `aeo-ai-discoverability` — authoring llms.txt, FAQ text/schema, static crawlable copy. This skill only *verifies both variants carry it*.
- `aeo-measurement` — probe/quality gate execution. This skill supplies the UA matrix and calls `crawl_gate.py`; does not reimplement scoring.
- `search-ranking-strategy` — whether ~0–70/mo terms are worth pursuing (answer already: no; AEO-first).
- `itch-page`, `backlink-building` — Phases 5/6 content. This skill only records "done/not done" and the hub URL to link.
- `blind-spots` / `learning-loop` — retrospective after each Go live.

## 3. Re-ordered workflow

Spec order is wrong: it assumes one page. Two divergent UA variants means Phases 1.1–1.2 as written would patch only the browser variant while Google keeps indexing the bot variant.

**P0 — Multi-UA baseline** (spec's single fetch would have missed the split). Fetch with Googlebot, bingbot, GPTBot, ClaudeBot, PerplexityBot, Chrome. Record per-UA: bytes, title, canonical, H1s, claims present, JSON-LD. Quote only.

**P1 — Variant parity (new, blocks everything).** Decide with founder: (a) kill Caffeine's bot-specific render so all UAs get one page, or (b) make the bot render the source of truth and ship all head/content there. Either way: identical title, canonical `https://www.smokegame.win/`, H1, claims set across UAs. Cloaking exposure ends here.

**P2 — Canonical + host.** Both variants → www. Apex 301 → www. og:url = canonical. Currently browser variant points at apex while served at www — self-contradiction.

**P3 — Head package dispatch.** One verbatim block for Caffeine chat, pre-edited for accuracy: `author` → not an Organization with HQ (use `"@type":"Organization","name":"Lil Blunt project"` with sameAs only, or omit); "on-chain proof-of-play" → flag for founder since scores are *not* on-chain today; no aggregateRating. Include a copy-paste verification command for after Go live.

**P4 — robots/sitemap/GSC checklist.** Root only until routes are real.

**P5 — AEO content parity** (promoted above classic ranking). Content authored by `aeo-ai-discoverability`; this skill verifies it lands in the bot variant, since that is what answer engines fetch.

**Parallel from day 1:** itch page (`itch-page`) — does not depend on