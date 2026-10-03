---
name: gm-game-sync
description: Refresh what is actually true about the game by reading GM-GAME (read-only) before writing or changing any public copy about it — controls, stages, enemies, platforms, chains, what is public versus gated. Use at the start of any marketing, SEO, AEO, GEO or content work that describes the game, when a page claims something about gameplay, when told the game has changed, or when a name, control or feature on the site cannot be traced to the game.
---

# Sync with GM-GAME before describing the game

The site's copy and the game have drifted before. On 2026-09-30 a fact-check
found **four** claims on our pages that the game contradicts, every one written
without reading the game. The repo is `youngstunners88/GM-GAME`; the website
repo does not contain it.

```bash
GIT_LFS_SKIP_SMUDGE=1 git clone --depth 1 https://github.com/youngstunners88/gm-game /home/user/youngstunners88/gm-game
sed -n '1,30p' /home/user/youngstunners88/gm-game/STATUS.md     # newest entries first
```

**Read-only. Never edit, commit to, or push GM-GAME, and do not change game
code, the Protocol Portals, or Episode 2 unless the founder says so.** The
`GIT_LFS_SKIP_SMUDGE` prefix is required or the clone aborts.

## Then check names with code, not memory

```python
import sys; sys.path.insert(0, "marketing/aeo")
import research_agent as r
r.unverified_names("your draft text")      # proper nouns that occur nowhere in the game
```

A name either occurs in the source or it does not. Jev's accuracy gate cannot
do this: it judges claims about tokens and rewards, and it passed "Dustrock
Mines" happily. Run both.

## Verified facts (2026-09-30 — re-check before relying on them)

| Topic | Fact | Where |
|---|---|---|
| Move | **A / D** or Left / Right | `project.godot` `move_left`, `move_right` |
| Jump | **Space or W** | `jump` |
| Throw axes | **J or Enter** | `attack` |
| Sprint / Dash / Interact | Shift / K / E | `sprint`, `dash`, `interact` |
| Phones | **On-screen touch controls exist** (landed 2026-08-01) | `docs/MOBILE_CONTROLS_SPEC.md`, `mobile_controls.gd` |
| Stages | **Smoke Realm, Crystal Caverns, Gold Rush**, each ending in a boss | `src/level/level_0[1-3]_*.gd`, `stage[1-3]_boss_*` |
| Enemy | **Tax Collector** | `src/enemies/tax_collector.gd` |
| Learning rooms | One per stage: Stage 1 SMOKE, 2 DIAMONDS, 3 GOLD ("Protocol Portals") | `STATUS.md` 2026-09-25 |
| SMOKE token | In-game copy: lives on **five chains — Solana, Robinhood Chain, Ethereum, BASE, BSC** — bridged natively as one omni-chain token. No PulseChain. | `src/protocol_portals/data/portal_copy.json` |
| Web package | ~183 MB (limit 190 MiB) — large first load on mobile | `STATUS.md` 2026-09-28 |

## Do NOT say

| Claim | Why |
|---|---|
| "Dustrock Mines" | In no GM-GAME file. Website-copy invention. |
| "Tax Man" | The enemy is the **Tax Collector**. |
| "green outlaw prospector" | Zero hits for "outlaw" or "prospector". Lil Blunt is a leaf mascot. |
| "digging / mining mechanic" | No such mechanic. |
| "dodge / jump the mine carts" | Carts are boardable platforms (a pool choice), not hazards. |
| "WASD is not bound" | It is. Was wrong when first written. |
| "no touch controls; a phone cannot play" | Touch controls shipped. |
| Anything about **Episode 2** | Access-code gated; not public. Do not advertise, describe or index it. |
| Players earn tokens / NFTs / ETH, or scores are on-chain | Blocking-false, `AGENTS.md`. The token's own mechanics are the founder's to state, not ours. |

"Wild West" is **founder-confirmed framing** (2026-08-30). Keep it.

## Landmines found reading the repo

- **Firecrawl:** `STATUS.md` says the key saved in the environment settings is
  dead (401) and a new one exists. Confirmed: this environment's key returns
  `401 Invalid token`. The fix is the founder pasting the new key as
  `FIRECRAWL_API_KEY`, and only a *new* session sees it.
- **Episode 2's access code only keeps casual players out** — `STATUS.md`
  says so itself. Treat it as unlisted, not secret.
- **The game is a moving target.** STATUS.md gains entries daily. A fact
  verified last week is a hypothesis this week.

## When this hands off

| Situation | Go to |
|---|---|
| Finding what to improve against winning pages | `research-agent` |
| Gating copy once it is written | `jev-gauntlet` |
| The entry used everywhere | `marketing/CANONICAL-ENTRY.md` |
| What is actually live | `rapid-assessment` |
