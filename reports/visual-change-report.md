# Visual Change Report — THE SMOKE FRONTIER

## Overview

This report documents the visual/brand revision of the Lil Blunt Web3 game landing page into **THE SMOKE FRONTIER** — an 1800s old-west mining town aesthetic layered with stoner energy and Web3 protocol mechanics. The revision is a **visual and brand-direction change only**. No source logic, business rules, data flow, section composition, or the Internet Identity connect were altered.

## What Changed

### 1. Design System (index.css / tailwind.config.js)

- **Color palette** moved from a glassmorphism + neon-purple scheme to a warm frontier material palette:
  - `background` — FRONTIER dark brown (`oklch(0.13 0.02 45)`)
  - `foreground` — warm parchment text (`oklch(0.94 0.015 60)`)
  - `card` — wood plank surface (`oklch(0.17 0.02 45)`)
  - `primary` — SMOKE GREEN anchor (`oklch(0.72 0.16 150)`)
  - `accent` — DIAMOND BLUE, navy-leaning (`oklch(0.68 0.1 250)`)
  - `gold` — warm metallic GOLD (`oklch(0.78 0.13 75)`)
  - `muted` — iron / charcoal (`oklch(0.21 0.02 45)`)
- **Purple and neon reduced** in favor of warm browns (~45 hue), navy (~250), SMOKE GREEN, DIAMOND BLUE, warm metallic GOLD, and BLAZE fire.
- **Typography** rebalanced: `Fraunces` (western/frontier serif) for display titles, `DM Sans` for body/stats, `Geist Mono` (pixel/retro) for game UI.
- **Material surfaces** replaced the old `glow-*` neon utilities: `.wood`, `.brass`, `.parchment`, `.iron` surfaces with `edge-smoke`, `edge-blue`, `edge-gold` warm edge highlights.
- **Environmental particles**: `.ember` utility + `ember-rise` keyframes (deterministic positions via `useMemo`) replace the old neon particle system.

### 2. Sections

- **Hero** — now a lantern-lit mining town scene anchored by the supplied Lil Blunt logo, with a PLAY NOW CTA to itch.io.
- **Economy** — rendered as the BLAZE → DIAMONDS → GOLD demand cascade (a living ecosystem, not a dashboard).
- **Town** — the living mining town (non-interactive; no clickable buildings).
- **Gold / Diamonds / Blaze** — each protocol identity rendered with its own logo as the brand architecture anchor.
- **Play Game** — primary game entry with the generated gameplay screenshot, prominent as required.
- **Leaderboard** — the "Wanted Board" (structure preserved, see below).
- **NFTGallery / Vault / Community** — restyled in frontier materials; Community channels are disabled "coming soon" tiles.

### 3. Motion

- Framer Motion retained but made **environmental**: fade+rise entrances (`0.6s` ease-out), subtle hover lift, and decorative smoke-drift / ember-rise / lantern-flicker / gold-shimmer.
- **Smoke transition** (`SmokeTransition`) is the signature transition between town sections.
- No aggressive zooming, excessive floating cards, or huge text animations.
- Honors `prefers-reduced-motion`.

## Why

The direction moved from a generic neon cyberpunk crypto poster to a **living game world**: a dusty, lantern-lit mining town. The four protocol identities (Lil Blunt, BLAZE, DIAMONDS, GOLD) are the brand architecture anchors, each rendered with its own logo. Game first, world second, Web3 third. Content tone uses confident frontier language and avoids "ultimate / revolutionary / unstoppable / next generation."

## What Was Preserved (Unchanged)

The following were intentionally preserved to keep existing technical quality, animations, component structure, and Web3-ready architecture:

- **Leaderboard structure** — the Wanted Board keeps its existing table/ranking structure and data flow.
- **Tokenomics data** — the full SMOKE / DIAMONDS / GOLD tokenomics presentation is intentionally consolidated into the **Gold section's "The Ledger" panel**, driven by `useTokenMetrics` (Supply / Circulating / Burned / Locked / Staked). No token mechanics were invented; values come from the repository hook.
- **Vault accordion** — the Vault section keeps its accordion interaction and structure.
- **Internet Identity connect** — unchanged. Internet Identity only; no MetaMask / Rabby / WalletConnect.
- **Framer Motion** — retained as the animation library, restyled to be environmental.
- **Component APIs** — shared components (`GlassCard`, `StatCard`, `LeaderboardTable`, `StatusBadge`, `AchievementCard`, etc.) keep their existing props/APIs; only their visual styling changed.

## Scope Notes

- No interactive clickable mining-town map was built.
- No animated wanted-poster reveal sequence was built.
- No fabricated BLAZE or GOLD logos — those remain labeled replaceable placeholder slots.
- No invented token mechanics — all values follow project documentation/contracts.
