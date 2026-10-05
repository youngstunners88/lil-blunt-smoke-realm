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

## Rules

- Roadmap wording is fine, present-tense on-chain, NFT, wallet-connect or "trade items" claims are not (AGENTS.md).
- Controls come from `project.godot` (A/D or arrows, Space or W, J or Enter, Shift, K, E, touch).
- Itch rejects crawler user agents with a Cloudflare 403; the bridge fetches with a browser UA.
- A page the bridge cannot fetch is UNCHECKED, never passing.
