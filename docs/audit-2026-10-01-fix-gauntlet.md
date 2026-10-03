# Vulnerability and bug audit, fix gauntlet, 2026-10-01

Method: four independent read-only reviewers (backend, frontend logic, static pages and head, build and supply
chain). Every medium-or-higher finding was then checked by me against the code, the live site or the live bundle
before acting; reviewers confused repo and production twice (see LESSONS). Fixes follow `.claude/skills/fix-gauntlet`:
failing test first, smallest change, deterministic gates, independent attacker, then route.

## Result in one line

No critical or high vulnerability anywhere. The backend is a tiny read-only demo canister with no write path. The real
issues are accuracy, accessibility, robustness and weight.

## Backend (Motoko) - clean

Public surface: six `public query` demo-data reads. No score submission, no mint, no transfer, no input-taking function,
no secrets, one self-contained migration. Contradicts nothing on the site. Open, unverifiable from the repo because the
auth and OQL library source is not in it: whether `_initialize_access_control` is first-caller-wins (admin controls only
role assignment today), whether anonymous `execute` can read `playerProfiles`, and `getPlayerProfile(principal)` is an
unauthenticated query that only matters once real profiles exist. Owner: Caffeine or founder; one anonymous-identity test
settles all three.

## Verified findings and what happened

| # | Finding | Verified how | Disposition |
|---|---|---|---|
| F9 | No React error boundary: any render error white-screens the site | grep, none | **Fixed** (ErrorBoundary + test) |
| F4 | Content overlay dialog never moves or returns focus | read code, failing test | **Fixed** (focus in, restore on close + test) |
| F1 | On-Chain Points figures had no DEMO badge though the component exists | read code, failing test | **Fixed** (badge, "demo data" tooltips + test) |
| F10 | `onClick={login}` passes the click event | read code | **Fixed** |
| S1 | Repo `/about/` meta says scores are "recorded on the Internet Computer blockchain" | read, live differs | **Fixed in repo**, Jev PASS; not on live |
| - | Blocked-claims guard across all source | new `accuracy-copy.test.ts` | **Added** (8 cases) |
| F7 | PostHog sends click ids with no consent | live bundle has 0 PostHog | **Not applicable to production**; dropped |
| P1 | Live homepage loads Caffeine's Umami script; `/privacy/` names only CrawlConsole | live HTML and page text | **Decision**: privacy wording |
| T1 | `minify: false` in vite.config.js; bundle 1.87 MB | measured: minified 0.82 MB, gzip 396 to 260 KB | **Decision** (Caffeine build config) |
| F2 | "secured on ICP", "On-Chain Points" label, "Connect Wallet" button | read | **Decision** (deferred founder copy) |
| F8 | Background video autoplays with no pause control (WCAG 2.2.2) | read | **Founder only** (protected file) |
| T2 | First paint uses a 3.4 MB PNG; a 204 KB JPG poster sits unused | read | **Founder only** (touches SmokeBackground) |
| S3-S4 | Repo static pages list incomplete controls / "keyboard only" | read; live is better | Repo-only drift, low; fix when those pages are next dispatched |
| T5-T6 | 10+ unused dependencies; stray tracked `frontend/` folder (36 MB) | grep | **Decision** (Caffeine installs separately) |
| F3 | Gold.tsx has staking and "audited, on-chain, and binding" copy | read; not mounted | Dead code; founder-deferred item |
| F5-F6 | History stacking, audio unlock on any key | read | Low; left alone (behaviour change, no harm reported) |

## Gates run

`pnpm fix`, `pnpm typecheck`, `pnpm test --run` (41 tests, up from 29), production build, `dist/` reverted. Jev accuracy
gate PASS on the changed page copy. Independent attacker review: **SHIP, no blockers.** Its minor points: the copy guard did not cover static HTML
(fixed: it now scans `public/**/*.html` and `index.html`, and was shown to fail when the old wording is reinstated, 42
tests); the overlay still has no full focus trap (not part of the defect, left); the boundary does not catch event-handler
or async errors (by design); DemoBadge test is a source scan, not a render (accepted).

## Delivery route

These are repo fixes. Production is built from Caffeine's copy, and Caffeine's chat agent cannot read the repo or run
tests, so a code round is only safe after Version 47 is published and verified live. Staged as Round 6 (not sent):
error boundary, overlay focus, demo badge. Paste-ready code lives in the staged diff (`git show` on the fix commit).
