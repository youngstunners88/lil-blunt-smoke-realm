# Design Brief — THE SMOKE REALM

## Direction

THE SMOKE REALM — a smoky neon Wild West mining town at dusk, fusing cannabis culture (SMOKE), crystal energy (DIAMONDS), and gold ore (GOLD) into one cinematic hybrid world under modern glassmorphism/dark UI.

## Tone

Cinematic high-detail illustrated environment (mining town silhouettes, crystal deposits, gold ore piles) layered under frosted glass + neon UI panels. Premium, cohesive, game-first — not three themes glued together. Dark dusk default.

## Differentiation

The page is one connected town where emerald smoke drifts, sapphire crystals breathe, gold ore shimmers, and neon cyan signs flicker — all four protocol accents visible across every section on a deeper dusk/night base.

## Color Palette

| Token      | OKLCH         | Role                              |
| ---------- | ------------- | --------------------------------- |
| background | 0.11 0.025 280| REALM dusk charcoal (night-blue)  |
| foreground | 0.94 0.015 60 | warm parchment text               |
| card       | 0.15 0.022 270| cool-shifted wood/glass surface   |
| primary    | 0.72 0.16 150 | SMOKE GREEN (cannabis)             |
| accent     | 0.62 0.17 250 | SAPPHIRE BLUE (crystal, brightened)|
| cyan       | 0.82 0.16 195 | NEON CYAN (Smoke site dark UI)     |
| gold       | 0.78 0.13 75  | warm metallic GOLD (gold ore)     |
| muted      | 0.19 0.022 270| iron / charcoal                   |

Four realm accents visibly combine across the hybrid dark UI: emerald green + neon cyan (SMOKE), sapphire blue (DIAMONDS), warm gold (GOLD).

## Typography

- Display: Fraunces — western/frontier serif for titles
- Body: DM Sans — modern sans for body/stats
- Mono: Geist Mono — pixel/retro for game UI
- Scale: hero `font-display text-5xl sm:text-7xl`, h2 `font-display text-3xl sm:text-4xl`, label `font-mono text-[11px] uppercase tracking-[0.2em]`, body `font-body text-base`

## Elevation & Depth

Frontier materials (`.wood`/`.brass`/`.parchment`/`.iron`) remain as the bones; glass + neon layers float on top. `.glass-panel` (frosted dark glass, backdrop-blur, cyan edge) for modern UI overlays. `.glow-cyan`/`.glow-emerald`/`.glow-sapphire`/`.glow-gold` neon glows for active/highlight states. `.crystal-glow` (sapphire breathing) and `.gold-ore` (warm shimmer) complement existing `.ember`/`.smoke-layer`.

## Structural Zones

| Zone    | Background      | Border          | Notes                              |
| ------- | --------------- | --------------- | ---------------------------------- |
| Header  | glass-panel     | border-b cyan   | sticky neon nav over town          |
| Content | background      | —               | sections alternate wood/iron/glass |
| Footer  | iron            | border-t gold   | risk disclaimers + attribution     |

## Spacing & Rhythm

Section gaps `py-24 sm:py-32`; content grouped in `gap-6` grids; micro-spacing `gap-2`/`gap-3` for density and hierarchy.

## Component Patterns

- Buttons: brass/wood with neon edge highlight, uppercase display, hover lift + glow brighten
- Cards: glass-panel or wood/iron surfaces, `rounded-xl`, neon-edge or warm-edge shadow by realm
- Badges: status pills with realm-tinted glass backgrounds
- Realm treatments: `.crystal-glow` (sapphire), `.gold-ore` (gold), `.smoke-layer` (emerald+cyan ambient)
- Environmental particles: `.ember` + `ember-rise`, deterministic positions via `useMemo`

## Motion

- Entrance: Framer Motion fade+rise, `0.6s` ease-out, honors reduced-motion
- Hover: subtle lift + neon edge brighten
- Decorative: smoke-drift, ember-rise, lantern-flicker, gold-shimmer, crystal-pulse, neon-flicker
- Signature: tri-color smoke transition (emerald → sapphire → gold) between town sections
- All decorative animations disabled under `prefers-reduced-motion`

## Constraints

- No neon purple; hues anchored to emerald (~150), cyan (~195), sapphire (~250), gold (~75), dusk (~280)
- No aggressive zoom or huge text animations
- No fabricated BLAZE/GOLD logos — replaceable asset slots
- No invented token mechanics — follow project documentation/contracts
- Internet Identity connect only (no MetaMask/Rabby/WalletConnect)
- Game screenshots/gameplay prominent; game-first, not crypto-first
- Demo data labeled DEMO DATA, never LIVE DATA
- No NFT minting claims — Proof of Play achievement layer only
- Remove all Caffeine branding including 'Built with love using caffeine.ai'

## Signature Detail

The tri-color realm gradient (`.text-gradient-realm`: emerald → sapphire → gold) and the four-realm glow system (`.glow-cyan`/`.glow-emerald`/`.glow-sapphire`/`.glow-gold`) make all three protocol aesthetics visibly coexist on one cohesive dusk base — smoke as the signature transition between town sections.
