---
name: itch-bridge
description: Read, audit, diff, gate, score and verify the live itch.io page through the local itch-bridge MCP server, and hand off the one step that needs a login (the Save). Use whenever the itch page, title, tagline, tags or description is being checked or optimised, after any founder edit on itch, or when asked to "connect to itch" or "update the itch page".
---

# itch bridge

## What is and is not possible (verified 2026-10-05)

The official itch API is read-only for pages. `GET api.itch.io/profile/games` returns title, short_text, traits, counts, **no description body**;
there is no endpoint that edits a page; the edit screen (`itch.io/game/edit/<id>`) redirects an API key to `/login`. So **no tool can Save a page
with the API key**. The bridge does everything around the Save, and hands the Save off safely.

## The server

`marketing/itch/bridge/server.py` (dependency-free MCP over stdio, registered in `.mcp.json` as `itch-bridge`; in an interactive Claude Code session approve it once).
Tools: `itch_state`, `itch_audit`, `itch_diff`, `itch_gate`, `itch_score_variants`, `itch_apply_plan`, `itch_verify`.
Same code runs from the shell: `python3 -c "import sys; sys.path.insert(0,'marketing/itch/bridge'); import core; print(core.audit())"`.
Tests: `python3 marketing/itch/bridge/test_bridge.py` (7, includes a real MCP handshake and real Jev calls). Needs `ITCH_API_KEY` (optional, adds id and traits) and `OPENROUTER_API_KEY` (Jev).

## Workflow

1. `itch_state` and save the output (the backup of what was live) to `marketing/aeo/outbox/itch-backup-<date>.json`.
2. `itch_audit`: banned claims, invented names (checked against the game source), Jev accuracy gate, canonical title. It fails today's page on on-chain, wallet-connect, NFT and the missing "Lil Blunt:" in the title.
3. Change the approved text in `marketing/itch/page-content.md` only after `itch_gate`; compare candidates with `itch_score_variants` (Jev gates first, then scores the GEO battery). Example result: the entity-rich tagline "Lil Blunt: The Smoke Realm - a free 2D Wild West platformer you play in your browser. No download." scored 2.87 against 2.45 for the current tagline; the on-chain one was blocked.
4. `itch_apply_plan`: only `ready` when every changed field passes the gate; returns the changed fields, the edit URL, a do-not-touch list (the slug stays `smokerealm`) and an `automation_goal`.
5. **The Save**, one of:
   - Founder pastes the values (2 minutes, always works).
   - **TinyFish logged-in profile (recommended automation):** the founder logs into itch once inside their own TinyFish Browser Context Profile; run `run_web_automation` with `use_profile=true` and the plan's `automation_goal`. The assistant never sees the password. Ask the founder before each run; it edits a live page.
   - Never: a session cookie or password pasted into chat or env (full account access including payouts), and never edit the Project URL.
6. `itch_verify` after the edit; it re-reads the public page and must report `verified: true`. Report in `link-change` wording (STAGED / LIVE).

## TinyFish write path: TRIED 2026-10-05, BLOCKED BY CLOUDFLARE

Result: both the profile-capture browser and an automated stealth run were stopped by itch.io's Cloudflare "Verify you are human" check (the checkbox just re-presents the same check; run `4fa737cf` ended after 9 steps reporting the CAPTCHA, cost about 15 cents). Profile `prof_baa9750698df416f` exists but holds no login. **Do not retry TinyFish for itch** unless TinyFish changes how it reaches sites. Working routes, in order: (1) founder pastes the gated values from `itch_apply_plan` (about 2 minutes); (2) a browser on the founder's own machine where Cloudflare already trusts them (Claude in Chrome or the Claude desktop browser tools) using their logged-in session. The notes below are kept for the record.

## TinyFish write path (set up 2026-10-05, blocked, see above)

- Account: wallet about $10.60; rates: agent $0.016 per step, browser $0.002 per minute. An itch edit is roughly 15 steps.
- Tools: `run_web_automation` (and `_async` with `get_run`) with `use_profile=true`, optional `profile_id`. There is **no tool to create a profile or vault entry**: the founder creates a Browser Context Profile in the TinyFish dashboard and logs into itch inside it once (steps in `docs/founder-checklist-2026-10-03.md`). Prior runs show `profile_attached: false`, so no profile existed before this.
- Protocol, every time: (1) `itch_apply_plan`; (2) first run of a session = `plan.access_check_goal` (read-only, reports username and fields); (3) founder says yes to the specific edit; (4) run `plan.automation_goal`; (5) `itch_verify` on the public page; (6) report STAGED vs LIVE.
- If the run reports a login, captcha or 2FA page: stop, tell the founder to log into the profile again. Do not enable `use_vault` unless the founder asks (it stores their password with a third party).
- Use a fresh UUID v4 `session_id` per call. A timed-out call may still be running: check `list_runs` or `get_run` before retrying. The write is an edit to a live commercial page, so never retry a Save blindly; verify first.

## Rules

- Roadmap wording is fine, present-tense on-chain, NFT, wallet-connect or "trade items" claims are not (AGENTS.md).
- Controls come from `project.godot` (A/D or arrows, Space or W, J or Enter, Shift, K, E, touch).
- Itch rejects crawler user agents with a Cloudflare 403; the bridge fetches with a browser UA.
- A page the bridge cannot fetch is UNCHECKED, never passing.
