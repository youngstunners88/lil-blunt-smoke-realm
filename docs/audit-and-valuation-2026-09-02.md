# Full audit + honest valuation — 2026-09-02

Two questions answered: (1) what bugs and vulnerabilities exist and which were
fixed, and (2) what this is worth. Everything below is measured or reasoned
from the code, not asserted.

---

# Part 1 — Security & bug audit

## Method

- `pnpm typecheck`, `pnpm exec biome check` (lint), `pnpm test`
- `pnpm audit` (dependency CVEs), classified prod vs dev
- `secure-build-checklist` gate (47 checks, 11 categories)
- Manual read of the Motoko backend, its Candid interface, the analytics
  module, and every `dangerouslySetInnerHTML` / `eval` / `innerHTML` site
- Secret sweep of shipped source
- Multi-model review of the manual checks (prior session,
  `marketing/research/2026-09-02-security-council.md`)

## What is clean

| Area | Result |
|---|---|
| TypeScript | `tsc --noEmit` passes, zero errors |
| Lint | biome clean across 80 files |
| Tests | 11 pass (2 files) |
| Secrets in bundle | None. Only the PostHog **public write key** ships, which is designed to be public. No private key, token, or credential in source. |
| XSS via `dangerouslySetInnerHTML` | One occurrence, in `components/ui/chart.tsx`. It injects **static theme CSS from constants**, never user input — and the component is **dead code**, imported nowhere. Not a vulnerability. |
| `eval` / dynamic code execution | None. |
| Backend data exposure | The OQL `execute` endpoint is scoped: leaderboard/achievements/etc. are `.public_()` **demo** data; player profiles are `.ownedBy('principal')`, so a signed-in caller reads only their own row. No cross-user leak. |
| Injection (SQL/NoSQL/shell/path) | Not applicable — no SQL/NoSQL DB, no shell calls, no file paths from user input. |

## The shipped attack surface is small

The live site is a static React app that reads **demo data** and offers
optional Internet Identity sign-in. The backend canister exposes **14 methods,
10 of them read-only queries** over demo data. There is no endpoint that
mutates real user value. That is a genuinely small surface.

## Dependency CVEs — 24 reported, none confirmed reachable in the shipped app

`pnpm audit` flags 24 vulnerabilities. Classified:

- **Dev-tooling only** (not in the browser bundle): vite, vitest, postcss,
  nanoid, browserslist, sharp. Exploitable only against a developer running the
  local build, not against a visitor.
- **Transitive from dead dependencies**: the prod-flagged ones — `lodash`,
  `js-cookie`, `seroval` — are **not imported anywhere in the source**. They
  arrive through packages that are themselves unused (see below).

No CVE was traced to code that actually ships and runs in a visitor's browser.

## The real quality finding: an oversized scaffold

Caffeine generates the full shadcn/ui + React kit. Most of it is unused:

- **53 UI components, 13 imported. 40 are dead code.**
- Heavyweight production dependencies that are **not used in app code**:
  `react-quill-new` (rich-text editor), `recharts`, `embla-carousel-react`,
  `react-day-picker`, `input-otp`, `cmdk`, `react-hook-form`, `zustand`,
  `@tanstack/react-router`, and the `@react-three/fiber|drei|cannon` wrappers.
  (`three` itself **is** used — the smoke background.)

This dead weight is what drags in the transitive CVEs and bloats the bundle.

## What was NOT changed, and why

**The dependency bloat was left in place deliberately.** Two reasons, both
from this project's hard constraints:

1. **This repo is not the deploy path.** Production is built by Caffeine from a
   separate copy. Editing `package.json` here does not change what ships.
2. `CLAUDE.md` records that dependency changes can break the Caffeine build,
   which installs independently. Removing packages here is risk with no
   production benefit.

Pruning must happen **in the Caffeine project**, with the `secure-build-checklist`
gate as the verification step, not in this repo.

## Residual items I cannot close from here — named, not hidden

"Get rid of every vulnerability" is not something I can truthfully claim to
have completed, because three real items sit outside what this repo can verify
or control:

1. **`assignCallerUserRole` guard is unverifiable from source.** It is injected
   by a Caffeine access-control mixin that is not in this repo (it exists only
   in the compiled `backend.did`/`.wasm`). Whether a random caller can escalate
   to admin cannot be read from source here. **Blast radius is limited** — there
   is no admin-gated mutation of real value, everything is demo data — but the
   guard itself needs a live-canister test or Caffeine's mixin source to
   confirm. **Open, needs evidence.**
2. **The dependency CVEs** must be closed in the Caffeine project, per above.
3. **The user-agent / snapshot split** is Caffeine platform behaviour, not
   fixable in code (documented in `docs/seo-audit-baseline.md`). A mitigation
   was dispatched.

The **actual** interesting attack surface is not on this site at all — it is
GM-GAME's Cloudflare Worker (`/oracle` is an unauthenticated proxy to paid LLM
APIs; `/score` accepts unauthenticated writes). Those are flagged in the
security council notes and live in the other repo.

## Bottom line, Part 1

There is **no confirmed, exploitable vulnerability in the shipped website.**
Everything verifiable and in-scope is clean: types, lint, secrets, XSS, logic,
data scoping. The residuals are either not reachable, not in this repo, or not
verifiable from source — and each is named above rather than waved away.

---

# Part 2 — What is it worth?

The honest answer depends entirely on which question is being asked, because
the two standard lenses give wildly different numbers.

## Lens A — as a business to sell today: roughly $0–$5,000

A buyer purchasing "the business" buys its cash flows. There are none:

- The game is **free**. Nothing on the site is for sale.
- No ad revenue is live. No portal revenue-share is live.
- No meaningful, measured user base yet.

`traffic × $0 = $0`. On any revenue or profit multiple, a going concern with no
revenue and no retained users is worth approximately nothing. The only floor is
a **"game flip"**: a complete, reskinnable Godot platformer plus a domain might
fetch low four figures from someone who wants a finished game to build on —
call it **$500–$5,000**, and only if presented well.

## Lens B — replacement cost (what it would cost to rebuild): ~$25,000–$60,000

This is real work, and rebuilding it from zero would cost:

| Asset | Rebuild cost (freelance-rate estimate) |
|---|---|
| Godot 4.3 platformer — multiple levels, boss, power-ups, HTML5 export, wallet integration coded | $15,000–$35,000 |
| Character art + art direction + three-realm world design | $4,000–$10,000 |
| Marketing site (React, on-chain hosted, SEO/AEO, legal) | $3,000–$8,000 |
| The skills + measurement tooling (≈32 domain skills, crawl/quality/probe/market scripts) | weeks of specialist time |

**Replacement cost is not sale price.** It tells you what was invested, not
what someone will pay. But it is the honest measure of the effort embodied.

## Lens C — strategic value to the SMOKE / DIAMONDS / GOLD ecosystem

This is where the real upside lives, and also where honesty matters most.

The game is a **marketing instrument** for three crypto protocols. Its value is
therefore not its own P&L — it is *how many new, real holders it brings to
those tokens, times what a holder is worth*. If the game demonstrably onboards
N holders and a holder is worth $X to the ecosystem, its value is N × X, which
can dwarf every number above.

**But N is currently unmeasured.** That is the single most important caveat in
this whole document. Until PostHog + on-chain attribution shows the game
actually converting players into protocol participants, this value is a
**hypothesis, not a number**. Optimising anything against it before it is
measured is this project's documented top failure mode (`blind-spots` #1).

## The most defensible single figure

If forced to name one number for "what could we sell the whole thing for
today, as-is, to an unrelated buyer": **low four figures, ~$1,000–$5,000** — the
game-flip value of a finished platformer plus a domain, because there is no
revenue and no proven audience to price above that.

The number that matters more is not the sale price — it is the **cost to move
it off zero**: make the game retentive, list it where plays pay (CrazyGames
revenue-share, per `revenue-paths`), and measure holder conversion. Those three
convert a $0-revenue asset into one with an actual multiple. Nothing else does.

## What would raise the valuation, in order

1. **Revenue.** Even small, real portal revenue-share turns a $0 business into
   one with a multiple. CrazyGames is the concrete path and it is free to try.
2. **Measured onboarding.** Prove the game brings holders to the protocols.
   That is the entire strategic thesis, and it is currently unverified.
3. **Retention.** Under a revenue-share model, retention *is* the business
   model. A game people finish earns; one they bounce from does not.
4. **A real, indexed web presence.** In progress — but recall the crawler
   snapshot still shows none of the marketing work, so this is not yet banked.

Marketing polish, more skills, and more tooling do **not** raise the valuation
until one of the four above moves. They are inputs to those, not substitutes.
