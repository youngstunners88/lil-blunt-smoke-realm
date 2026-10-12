# Security dispositions — secure-build-checklist

How each finding from `.claude/skills/secure-build-checklist` is dispositioned
for **this** stack, with the reasoning. The gate deliberately keeps reporting
raw findings; nothing here suppresses output. Suppressing findings inside a
security tool hides regressions — recording a judgement next to them does not.

Run the gate with:

```sh
bun .claude/skills/secure-build-checklist/scripts/audit.ts .
```

Baseline at last review (2026-09-02): **47 checks — 23 pass, 6 fail, 14 manual,
4 skip. 0 critical, 4 high.**

## The stack these judgements are made against

- **Frontend:** React 19 + Vite + TypeScript SPA, plus static HTML pages.
- **Backend:** a Motoko canister on the Internet Computer. There is no server we
  operate, no Express, and no SQL or NoSQL database.
- **Auth:** Internet Identity only, optional, passwordless. No sessions we manage.
- **Deploy path:** Caffeine, a chat-driven build service holding a separate copy
  of the code. **This repo is not the deploy path**, which is why a pre-deploy
  gate here informs but cannot enforce.

## Fixed

| Check | Was | Action |
|---|---|---|
| DATA001 | No Terms of Service or Privacy Policy, on a live site running analytics | Added `/terms/` and `/privacy/`, linked in the footer and listed in `sitemap.xml`. Verified present in `dist/` after build. |
| DATA002 | No data export / delete route | Documented in the Privacy Policy. Because the identifiers are anonymous and held in the visitor's own `localStorage`, clearing site data is genuine self-service erasure; a contact route covers server-side records. |

## Accepted risk

### DEP001 — `esbuild@0.21.5` (GHSA-67mh-4wv8-2f99), high

**Accepted. Not fixed, deliberately.**

`esbuild` reaches this project only through `vite`, which is a
**devDependency**. It is not in the production bundle. The advisory affects the
esbuild **dev server**, exploitable only while a developer runs `vite dev`
locally, and only from a malicious page open in that same browser.

The fix requires vite 5 → 6, a major-version bump. `CLAUDE.md` records that
dependency changes here can break the Caffeine build, which installs
independently. Taking major-version risk on the deploy path to close a
vulnerability with **no production exposure** is the wrong trade.

**Revisit when:** vite is upgraded for another reason, or a patched release
lands in the 5.x line. Do not run `vite dev` on an untrusted network while
browsing untrusted pages.

## Known false positives in the gate

### DATA001 still reports red — it is satisfied

The check greps for `terms.md`, `terms.html`, `privacy.md`, `privacy.html`, or
`legal/**`. This site serves `/terms/index.html` and `/privacy/index.html`,
which is the correct URL form and matches every other page here
(`/about/`, `/how-to-play/`). The pattern does not recognise the
directory-index layout.

**Deliberately not "fixed" by adding root `terms.md` / `privacy.md`.** Two
copies of a privacy policy drift, and a stale second copy contradicting the
served one is a worse legal position than a red line in a scanner. The served
HTML is the single source of truth.

**Evidence it is satisfied:** `dist/terms/index.html` and
`dist/privacy/index.html` after `pnpm build`; both linked from the footer and
listed in `sitemap.xml`.

**Same class:** GM-GAME fails DATA001 despite genuinely having `terms.md` and
`privacy.md` at its root — the check appears to require several filename
variants rather than any one of them.

## Not applicable to this stack

These are permanent skips unless the architecture changes. Each names the
condition that would make it apply again.

| Check | Why not applicable | Applies again if |
|---|---|---|
| AI002 — Supabase RLS | No Supabase anywhere in the project. | Supabase or any Postgres-with-RLS is adopted. |
| INJ001 — raw SQL concatenation | No SQL database. State lives in Motoko canister memory. | A SQL database is introduced. |
| INJ002 — NoSQL operator injection | No NoSQL database. | A document store is introduced. |
| INFRA003 — database backups | No database to back up. Canister state is replicated by the Internet Computer's own consensus. | A database is introduced, or canister state becomes irreplaceable. |
| API001 — rate limiting | **False positive.** The check greps for npm packages (`express-rate-limit`, `@upstash/ratelimit`). This backend is a Motoko canister; ICP meters ingress and charges cycles per call rather than using Node middleware. | An HTTP server we operate is introduced. Note this check *does* apply to GM-GAME's Cloudflare Worker, which already implements per-IP fixed-window limits. |
| PLAT002, PLAT003, PLAT004, PLAT006 | These target Android control-plane abuse — ADB bridges, silent permission grants, accessibility services, overlays, device admin, remote command channels. A browser page and a web canister cannot request those capabilities. | The Godot **Android** export becomes a shipping target. GM-GAME tracks this in `ANDROID_EXPORT_SECURITY.md`. |

**Correction (2026-09-02):** an earlier draft of this file dismissed *all* of
PLAT001–007 as Android-only. Independent review (see
`marketing/research/2026-09-02-security-council.md`) showed that was too
aggressive, and three of the five models pushed back with concrete browser-native
analogues. PLAT001, PLAT005 and PLAT007 are **open, not N/A** — see below.

## Deferred — not work for today

### DEFI001–DEFI008 (8 checks)

All eight are correctly reported as *manual* and are currently moot: **no
contract is deployed**. `contracts.survivor_badge_erc721` in GM-GAME's
`config.json` is an empty string, so the mint path is inert.

They become **mandatory and blocking** the moment the Prospector Trail badge
contract is deployed. GM-GAME's `DEFI_REVIEW.md` already carries the review
gate, including the rule that a third-party audit is evidence, not proof.

**Do not deploy any contract while a DEFI item is unverified.**

## Manual checks still open — reviewed 2026-09-02

Six non-DeFi checks went to an independent multi-model review (Kimi K3, Grok
4.6, Gemini 3.7 via OpenRouter). Full transcript:
`marketing/research/2026-09-02-security-council.md`. Consensus dispositions:

| Check | Website (A) | GM-GAME (B) |
|---|---|---|
| AUTH003 default-deny | **Open.** Motoko `public shared` functions are world-callable by default; no router enforces default-deny. Evidence needed: the deployed canister's Candid interface, showing every update method is caller-guarded. | **Open.** Evidence needed: the Worker's default branch returns 404, and rate limiting wraps the dispatcher rather than being opt-in per route. |
| API002 bearer auth on writes | N/A — writes are ICP calls authenticated by Internet Identity principal, not HTTP bearer. | **Open, failing by design.** `/score` and `/track` accept unauthenticated writes. Two models flagged that "documented accepted risk" does not close a leaderboard-spoofing finding. Close with signed submissions or a dated, explicit risk acceptance. |
| INFRA003 backups | N/A — no database. | **Open.** KV *is* the datastore, and Cloudflare replication is not a backup: it does not protect against a buggy write or a namespace deletion. |
| PLAT001 privileged interfaces | **Open.** The sharpest finding of the review: **Caffeine is itself a privileged control plane** — an update mechanism holding a separate copy of the code, deploying artifacts this repo cannot verify. Evidence needed: deployed module hash vs. a reproducible build, plus documented access control on the Caffeine account. | Deferred while the browser build is the shipping target; blocks the Android export. |
| PLAT005 hidden persistence | **Open (low).** Declared `localStorage` is fine, but confirm no service worker or IndexedDB re-establishes state. | **Open.** Godot HTML5 persists `user://` to IndexedDB, and PWA export installs a service worker. |
| PLAT007 debug in release | **Open.** Confirm the deployed bundle ships no source maps, React dev build, or HMR client — and note we do not control that build. | **Open.** Confirm the itch.io artifact is a *release* export; debug exports ship verbose logging and a remote inspector. |

### Two findings the six checks would not have caught

1. **Client-bundle drift into a malicious signed transaction** (Grok). The
   deployed bundle is already known not to match this repo. A drifted or
   compromised bundle can rewrite the `to` address and calldata of the
   `eth_sendTransaction` that calls `mint()`; the player signs it willingly.
   Never calling `approve` does **not** prevent this. Nothing in AUTH/API/PLAT
   inspects transaction construction. This is the strongest argument for
   reproducible builds before the badge contract ships.
2. **`/oracle` is an unauthenticated proxy to paid LLM APIs** (Kimi). Rotating
   source IPs defeats a per-IP fixed-window limit; an attacker burns Mistral /
   OpenRouter credit with max-token prompts and can prompt-inject for the system
   prompt. Wants a global daily budget circuit-breaker, not just per-IP limits.

Also raised: user input concatenated into **KV keys** is injection by another
name (cross-player record overwrite) — the NoSQL check was dismissed too
quickly for GM-GAME.

## Standing caveat

A pre-deploy gate in this repo **cannot block a Caffeine deploy**, because
Caffeine builds its own copy from a chat dispatch. Treat this gate as a review
aid for what we author here, not as an enforcement boundary. Enforcement would
require the deploy path and the reviewed source to be the same artifact.
