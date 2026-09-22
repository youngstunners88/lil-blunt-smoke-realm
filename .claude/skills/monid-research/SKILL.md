---
name: monid-research
description: How to use Monid (the pay-per-call data-endpoint marketplace) for Lil Blunt marketing research on a fixed budget — discover, inspect, run, and cost discipline. Use whenever asked to research audience/trend/competitor signal via Monid, or to spend a specific Monid budget toward marketing or ad content.
---

# Monid for Marketing Research

Monid is a marketplace of hundreds of pay-per-call data endpoints (social
scrapers, trend/news feeds, enrichment, some media generation). It is
**not** a video generator for this project's purposes — the one relevant
video endpoint (`ByteDance /v1/video/seedance-2.5`) costs $10.70/call, and
generating the site's own cinematic footage already goes directly through
MuAPI (see `cinematic-video-continuity`), which is cheaper and gives finer
control (first-last-frame, video-extend). Reach for Monid for *research
and signal*, not for producing the actual video assets.

## Setup (already done once; keep for reference)

```bash
npm install -g @monid-ai/cli@latest
monid keys add -k "$MONID_API_KEY" -l main   # key comes from the environment
monid balance                                 # confirm funds before any run
```

## The discover → inspect → run flow

1. `monid discover -q "<natural language>" -l <small number> -j` — **free**,
   searches available endpoints. Always start here; never guess an endpoint
   name.
2. `monid inspect -e <endpoint> -p <provider> -j` — full schema for one
   candidate before running it, so the `run` call's parameters are right the
   first time rather than burning a paid call on a usage error.
3. `monid run -e <endpoint> -p <provider> -j --query '<json>'` (or
   `--input`/`--input-file` for POST bodies) — this is the paid call. Poll
   with `monid runs get -r <runId> -j` until `status: completed`.

Flag name is `--query`, not `-q` (that's `discover`'s flag) — a wrong flag
name fails before hitting the API and costs nothing, but don't rely on that;
read `inspect`'s output first.

## Cost discipline

- Every `run` call reports its own `price` before you commit and its actual
  `cost` in the completed result — read both, don't assume.
- Given a budget (e.g. "$2" or "up to $X"), that is a ceiling, not a target.
  Spend what the task needs; report the actual total against the ceiling
  rather than spending up to it by default.
- `monid balance` before and after a batch shows real spend directly — use
  it to sanity-check rather than summing reported costs by hand.
- Reddit/social feed endpoints (TikHub, Apify) run $0.0015–$0.006/call and
  are usually the right tool for audience/community research. News and
  project-search endpoints (Surf) run $0.006–$0.012/call. Treat anything
  quoted above ~$0.10/call as needing an explicit reason before running it,
  and anything above $1/call as needing to be flagged to the user before
  running it at all, budget headroom or not.

## What this is actually useful for on this project

Per the GM-GAME marketing docs (email-first, X-second, no Facebook/
Instagram/TikTok yet): audience and community discovery (relevant
subreddits, crypto-gaming Twitter accounts, indie/Godot dev communities),
competitor and trend signal to inform X copy and email blurbs, not campaign
execution. Findings feed the existing Kimi-drafts/human-approves content
pipeline — Monid does not post, send, or publish anything itself.

## Building an "ad" from research

Monid can supply signal and copy angles cheaply. It cannot supply real
gameplay footage of this specific game — see `gameplay-capture` for why,
and do not substitute a generic AI-generated "gameplay-style" clip for real
footage in anything presented as showing the game. An ad assembled without
real gameplay should be built from assets that are actually true: the site's
real cinematic background video, real logos, real copy, optionally narration
(ElevenLabs TTS is ~$0.05/call on Monid) — not a fabricated approximation of
play footage.
