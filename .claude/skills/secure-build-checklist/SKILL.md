---
name: secure-build-checklist
description: Universal pre-deploy security gate for games, mobile apps, tools, APIs, platforms, and services. Covers common AI-generated vulnerabilities plus privileged platform, debug-bridge, persistence, remote-control, and release-artifact abuse. Use before every ship, dependency, endpoint, permission, or platform integration.
metadata:
  author: kofi.zo.computer
---

# Secure Build Checklist

A preventative security checklist for any software an agent (or human) is about to ship. Compounded from 9 expert sources on the #1 vulnerabilities that hit AI-generated and vibe-coded apps: leaked secrets, default-public routes, Supabase RLS off, eval/RCE patterns, SQL/NoSQL injection, supply-chain CVEs, missing CORS, missing error tracking, and no ToS/PP.

## When to activate

Activate this skill **automatically** when:

- The agent is about to deploy / ship / publish any app, API, or service
- The agent is adding a new dependency, endpoint, auth flow, or webhook
- The agent is writing a Supabase / Postgres migration
- The agent is generating code that handles secrets, auth, payments, user input, or file uploads
- The agent is wiring any third-party API (Stripe, OpenAI, Twilio, etc.) into a project
- A user asks for a "security check", "pre-deploy review", "audit", or "is this safe to ship"

Do NOT activate for: pure docs edits, single-line fixes, or work explicitly marked as throwaway.

## What it does

Runs `scripts/audit.ts` against the project. The script:

1. Greps source for hardcoded secrets, eval/RCE, SQL injection, NoSQL operator abuse, shell injection, path traversal, dangerous HTML rendering
2. Verifies `.env` is gitignored AND has never been committed
3. Runs `npm`/`pnpm`/`bun` audit and reports high/critical CVEs
4. Confirms lockfile is committed
5. Confirms git remotes are HTTPS
6. Confirms Supabase RLS posture (if migrations exist)
7. Confirms API keys are not bundled into the client (no `VITE_`/`NEXT_PUBLIC_`/`REACT_APP_` for secrets)
8. Confirms error tracking is configured
9. Confirms Terms of Service / Privacy Policy exist before data collection
10. Reports a pass/fail/skip/manual breakdown by 11 categories, blocks on critical+high by default
11. Adds conditional DeFi and smart-contract review when Solidity, Foundry, Hardhat, Truffle, contract, migration, or deployment artefacts are present

## How agents should use it

**Before deploying any project**, the agent should run:

```bash
bun /home/workspace/Skills/secure-build-checklist/scripts/audit.ts /path/to/project
```

Exit code 0 = ship. Exit code 1 = blockers present, do not deploy.

**Before committing any new dep, endpoint, auth flow, or webhook**, the agent should re-run.

**As a CI step**: add `bun audit.ts --fail-on=medium --json` to the pipeline.

**For interactive review**: read `references/checklist.md` — the full human-readable checklist with rationale per item.

## What the agent should do with results

1. **Critical/High failures = block the deploy.** Fix them first. Re-run.
2. **Medium failures = document, fix within 24h, ship with a follow-up issue.**
3. **Manual checks = ask the user explicitly** (e.g. "have you enabled RLS on this Supabase table?", "is the deploy environment using HTTPS?")
4. **Skip = the check doesn't apply to this project type.** No action.

## Why this exists

The 9 source videos (synthesised in `Documents/VibeCoded-App-Security-DeepDive.md`) all converge on the same pattern: AI-assisted code shipping fast = shipping with default-dangerous settings. Every category in this checklist maps to a finding one of those experts called out as a top recurring breach. The goal is to compound their knowledge into a single gate every build must pass.

## Files

- `SKILL.md` — this file
- `scripts/audit.ts` — Bun scanner; greps + runs package-manager audit + git history
- `assets/checklist.json` — machine-readable rules (33+ checks across 11 categories)
- `references/checklist.md` — full human-readable checklist with rationale + 4 pre-launch AI audit prompts
- `Documents/VibeCoded-App-Security-DeepDive.md` (in workspace) — source essay with all 9 citations

## Extending

To add a new check:

1. Add a `Check` object to the relevant category in `assets/checklist.json`
2. Re-run the audit against a test project to confirm it triggers correctly
3. Add a row to `references/checklist.md` with the rationale
4. Bump `version` in `checklist.json`

## Platform-control-plane gate

The RedHook research adds a mandatory abuse-case review for anything that can act beyond its ordinary user-visible function. Before shipping any game, tool, app, or platform, enumerate and justify: accessibility or automation services, overlays, screen capture, device administration, debug bridges, native shells, IPC, boot receivers, foreground services, background workers, package installation, update mechanisms, and remote command channels.

Treat these capabilities as a control plane, not ordinary features. The release must prove least privilege, explicit consent, visible operation, server-side authorisation where applicable, revocation, uninstall cleanup, kill/reboot behaviour, and absence of developer hooks from the production artifact.

For Android specifically, never allow a release build to enable or self-pair Wireless ADB, drive Developer Options, silently grant permissions, or embed a general-purpose privileged shell.

## DeFi and smart-contract gate

The X video reviewed on 19 July 2026 adds a separate, conditional category: public source code and low TVL do not make an EVM protocol safe. The video demonstrates a target-discovery and manual-review workflow, not a verified NarwhalSwap exploit. Whenever a project contains smart-contract artefacts, require explicit review of privileged state changes, economic invariants, oracle manipulation, reentrancy and callbacks, flash-loan and same-transaction attacks, token-standard edge cases, upgrade/admin controls, and static/fuzz/invariant/fork testing with runtime monitoring.

Do not treat a third-party audit, a high audit score, or verified explorer source as proof of safety. No mainnet deployment or material upgrade should pass while a critical DeFi review item remains unverified.
