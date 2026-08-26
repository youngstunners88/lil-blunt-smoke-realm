# Design Brief

## Direction

THE SMOKE FRONTIER — an 1800s old-west mining town rendered as a living Web3 game world, layering frontier materials (wood, brass, parchment, iron) with stoner energy and protocol mechanics.

## Tone

Confident frontier language and warm environmental materials — a dusty, lantern-lit mining town, not a neon cyberpunk poster.

## Differentiation

Every section reads as part of one connected town — smoke drifts between sections, embers rise, lanterns flicker, gold shimmers — anchored by the four protocol identities (Lil Blunt, BLAZE, DIAMONDS, GOLD).

## Color Palette

| Token      | OKLCH        | Role                              |
| ---------- | ------------ | --------------------------------- |
| background | 0.13 0.02 45 | FRONTIER dark brown base          |
| foreground | 0.94 0.015 60| warm parchment text               |
| card       | 0.17 0.02 45 | wood plank surface                |
| primary    | 0.72 0.16 150| SMOKE GREEN anchor                |
| accent     | 0.68 0.1 250 | DIAMOND BLUE (navy-leaning)       |
| gold       | 0.78 0.13 75 | warm metallic GOLD                |
| muted      | 0.21 0.02 45 | iron / charcoal                   |

## Typography

- Display: Fraunces — western/frontier serif for titles
- Body: DM Sans — modern sans for body/stats
- Mono: Geist Mono — pixel/retro for game UI
- Scale: hero `font-display text-5xl sm:text-7xl`, h2 `font-display text-3xl sm:text-4xl`, label `font-mono text-[11px] uppercase tracking-[0.2em]`, body `font-body text-base`

## Elevation & Depth

Wood/brass/parchment/iron surfaces with warm edge highlights replace glass and neon; depth comes from layered material surfaces and soft drop shadows, not glow.

## Structural Zones

| Zone    | Background      | Border        | Notes                              |
| ------- | --------------- | ------------- | ---------------------------------- |
| Header  | wood + brass    | border-b gold | sticky frontier nav                |
| Content | background      | —             | sections alternate wood/iron/parchment |
| Footer  | iron            | border-t gold | risk disclaimers + attribution     |

## Spacing & Rhythm

Section gaps `py-24 sm:py-32`; content grouped in `gap-6` grids; micro-spacing `gap-2`/`gap-3` for density and hierarchy.

## Component Patterns

- Buttons: brass/wood with warm edge highlight, uppercase display, hover lift
- Cards: wood/iron surfaces, `rounded-xl`, warm edge shadow
- Badges: status pills with warm material tints

## Motion

- Entrance: Framer Motion fade+rise, `0.6s` ease-out, honors reduced-motion
- Hover: subtle lift + warm edge brighten
- Decorative: smoke-drift, ember-rise, lantern-flicker, gold-shimmer

## Constraints

- No neon purple; hues moved to warm brown (~45) and navy (~250)
- No aggressive zoom or huge text animations
- No fabricated BLAZE/GOLD logos — replaceable asset slots
- No invented token mechanics
- Internet Identity connect only

## Signature Detail

The four protocol identities (Lil Blunt, BLAZE, DIAMONDS, GOLD) each rendered with their own logo as the brand architecture anchor, with smoke as the signature transition between town sections.
