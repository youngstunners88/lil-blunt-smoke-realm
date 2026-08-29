---
name: project-playbook
description: Index and router for the Lil Blunt project — which skill applies to which situation, which ones combine into a workflow, and the blocking checks that apply to every task regardless. Use at the start of any non-trivial task on this project, when a request spans several areas (marketing plus code, SEO plus copy), or when it is unclear which playbook governs.
---

# Project Playbook

## How skills actually load

Skills are matched automatically against the task from their `description`
field — nobody has to invoke them by name. This file exists for the cases
automatic matching handles badly:

- a request that spans **several** skills and needs them in a specific order
- two skills whose scope **overlaps**, where one should win
- **blocking rules** that apply regardless of what the task is about

If a task clearly belongs to one skill, let it load and ignore this file.

## Blocking checks — these apply to every task

Run these regardless of which playbook governs. Each has already caused a real
defect on this project.

1. **Public claims accuracy.** Anything public-facing — ad copy, page text,
   `llms.txt`, structured data, outreach — must respect the `doNotBuild` note
   in `AGENTS.md`. Never imply play-to-earn, token/NFT rewards, or on-chain
   scoring. This already shipped wrong once.
2. **Caffeine is a separate codebase.** Pushing to this repo does not deploy.
   Binary assets committed here are not served by the live site, and a new npm
   dependency here can break Caffeine's independent build. Prefer
   dependency-free solutions for anything that runs in the deployed site.
3. **Never commit `src/frontend/dist/`.** Revert it. It is tracked from an old
   export; a rebuilt `index.html` points at JS bundles that are not versioned.
4. **Verify before pushing.** `pnpm fix && pnpm build && pnpm test --run` from
   `src/frontend/` for any frontend change.
5. **Canonical host is `www.smokegame.win`.** The apex has no DNS record. Any
   new URL — canonical, sitemap, og:url, ad destination — uses the www form.

## Route by situation

**Marketing and growth**

| Situation | Skill |
|---|---|
| Writing ad copy, hooks, or designing an A/B test | `ad-hook-testing` |
| Choosing a platform, budget, targeting, launching a campaign | `paid-campaign-launch` |
| "How do we make money / passive income" | `revenue-paths` |
| Ranking on Google, keyword strategy, organic traffic | `search-ranking-strategy` |
| On-page SEO mechanics — titles, JSON-LD, sitemap | `seo-optimization` |
| Being cited by ChatGPT/Perplexity/AI answers | `aeo-ai-discoverability` |
| Measuring whether AI search knows us; content quality gate | `aeo-measurement` |
| Off-site copy — itch.io, Reddit, directories, outreach | `game-distribution` |
| Paid data/research on a budget | `monid-research` |
| A second opinion, creative variants | `model-council` |
| Stress-testing a plan before committing to it | `model-gauntlet` |

**Building and assets**

| Situation | Skill |
|---|---|
| Any UI/UX/visual design work | `impeccable` |
| Logos, protocol links, social handles | `brand-links` |
| Background music / audio playback bugs | `web-audio-playback` |
| Generating or extending the background video | `cinematic-video-continuity` |
| Recording gameplay footage | `gameplay-capture` (read before promising it) |
| Restructuring a folder or repo for agents | `icm-architect` |

## Overlaps, and which wins

- **`ad-hook-testing` vs `paid-campaign-launch`** — hook-testing owns the
  *craft* (what to write, how to structure a readable test, how to read a
  result). Campaign-launch owns the *logistics* (platform minimums, targeting,
  UTM conventions, what a budget buys). A real campaign uses both: craft first
  to decide what to run, logistics second to run it.
- **`search-ranking-strategy` vs `seo-optimization`** — strategy owns *what to
  chase* (winnable tiers, the brand-name collision, indexation-before-rankings).
  Optimization owns *how to implement* it on-page. Strategy decides, then
  optimization executes.
- **`revenue-paths` vs everything marketing** — revenue-paths is the reality
  check. When a task assumes traffic converts to income, it does not yet;
  nothing is purchasable. Say so before optimizing a funnel that ends in $0.
- **`aeo-ai-discoverability` vs `aeo-measurement`** — discoverability owns the
  *theory and the on-page work* (how grounding and citation actually work, what
  to write). Measurement owns the *instruments* (probe loop, share of voice,
  quality gate). Do not report AI-visibility progress from the first without a
  reading from the second; "we added structured data" is an action, not a
  result.
- **`model-council` vs `model-gauntlet`** — council for width (variants, a
  quick second read). Gauntlet for depth (a plan that is expensive to get
  wrong). The gauntlet costs ~6-10x and takes 10-20 minutes; do not use it to
  pick a headline.

## Workflows that chain skills

**Launching a campaign** → `revenue-paths` (what is this spend actually for?)
→ `ad-hook-testing` (write and structure the test) → `paid-campaign-launch`
(platform, budget, tracked URLs) → render with
`marketing/ads/render_image_ad.py` → read with `marketing/report.py`.

**Adding a public page** → `search-ranking-strategy` (is this query winnable?)
→ `seo-optimization` (metadata, canonical on www, sitemap entry) →
`aeo-ai-discoverability` (crawlable without JS; written to survive extractive
summarization) → `python3 marketing/aeo/quality_gate.py <page>` (must not come
back `filler` or `ambiguous`) → accuracy check against `AGENTS.md` → internal
links, because orphan pages do not rank.

**Claiming AI visibility improved** → `python3 marketing/aeo/probe.py --run
--report` → compare against the recorded history → a change counts only if it
holds for **three consecutive runs**. One good run is noise; these are small
samples against non-deterministic models.

**Any visual change** → `impeccable` → `brand-links` if a logo or handle is
involved → verify against `DESIGN.md`'s material system.

## Tooling notes

- **Browser automation cannot reach the internet** from this sandbox. Verified
  repeatedly, most recently with the agent proxy correctly configured —
  navigation still returns `ERR_CONNECTION_RESET`. `browser-use` is installed
  and drives Chrome fine; the network path is the blocker. Do not spend time
  re-debugging it, and never fabricate results it would have produced.
- **Analytics** live in `src/frontend/src/lib/analytics.ts` (dependency-free by
  design, see rule 2) and read out via `marketing/report.py`.
