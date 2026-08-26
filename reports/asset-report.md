# Asset Report — THE SMOKE FRONTIER

This report documents the source and status of every brand asset used by the four protocol identities (Lil Blunt, BLAZE, DIAMONDS, GOLD). All paths are relative to `src/frontend/public/`.

## LIL BLUNT — Supplied Logo

- **Source:** Supplied logo, copied into the project.
- **File:** `assets/brand/lil-blunt/lil-blunt-logo.jpeg`
- **Referenced from:** `src/frontend/src/lib/brand.ts` → `LIL_BLUNT_LOGO_SRC` = `/assets/brand/lil-blunt/lil-blunt-logo.jpeg`
- **Status:** ✅ Live. Rendered in the Hero and Economy sections.
- **Description:** Bright green muscular character, neon ring, rocket.

## DIAMONDS — Supplied Logo

- **Source:** Supplied logo, copied into the project.
- **File:** `assets/brand/diamonds/diamonds-logo.png`
- **Referenced from:** `src/frontend/src/lib/brand.ts` → `DIAMONDS_LOGO_SRC` = `/assets/brand/diamonds/diamonds-logo.png`
- **Status:** ✅ Live. Rendered in the Diamonds and Economy sections.
- **Description:** Luminous green ring, crystalline blue diamond, metallic wordmark.

## BLAZE — Placeholder Slot (No Official Asset Supplied)

- **Source:** None supplied. **Not fabricated.**
- **Placeholder slot:** `assets/brand/blaze/blaze-logo.png` (folder contains a `README.md` noting the required asset).
- **Referenced from:** `src/frontend/src/lib/brand.ts` → `BLAZE_LOGO_SRC` = `/assets/brand/blaze/blaze-logo.png`
- **Status label:** `BLAZE_LOGO_ASSET_REQUIRED` = "BLAZE logo asset required — official logo not yet supplied"
- **Status:** ⏳ Awaiting official asset. The section renders the `BLAZE_LOGO_ASSET_REQUIRED` label until the real logo is dropped in.
- **Activation:** Drop the official asset at `src/frontend/public/assets/brand/blaze/blaze-logo.png`. No code change required — the path is already wired through `BLAZE_LOGO_SRC`.

## GOLD / Gold Mine — Placeholder Slot (No Official Asset Supplied)

- **Source:** None supplied. **Not fabricated.**
- **Placeholder slot:** `assets/brand/gold/gold-mine-logo.png` (folder contains a `README.md` noting the required asset).
- **Referenced from:** `src/frontend/src/lib/brand.ts` → `GOLD_MINE_LOGO_SRC` = `/assets/brand/gold/gold-mine-logo.png`
- **Status label:** `GOLD_MINE_LOGO_ASSET_REQUIRED` = "GOLD MINE logo asset required — official logo not yet supplied"
- **Status:** ⏳ Awaiting official asset. The section renders the `GOLD_MINE_LOGO_ASSET_REQUIRED` label until the real logo is dropped in.
- **Activation:** Drop the official asset at `src/frontend/public/assets/brand/gold/gold-mine-logo.png`. No code change required — the path is already wired through `GOLD_MINE_LOGO_SRC`.

## Supporting Assets

- **Gameplay screenshot:** `assets/generated/lil-blunt-gameplay.dim_1200x675.png` — generated gameplay screenshot used in the Play Game section (gameplay is prominent as required).
- **Fonts:** `assets/fonts/Fraunces.woff2`, `DMSans.woff2`, `GeistMono.woff2`, `SpaceGrotesk.woff2`.
- **Placeholder:** `assets/images/placeholder.svg` (fallback).

## Brand Directory Structure

```
assets/brand/
├── lil-blunt/   → lil-blunt-logo.jpeg (supplied, live)
├── diamonds/    → diamonds-logo.png (supplied, live)
├── blaze/       → README.md + blaze-logo.png slot (placeholder, not fabricated)
├── gold/        → README.md + gold-mine-logo.png slot (placeholder, not fabricated)
├── backgrounds/ (empty)
├── game/        (empty)
├── icons/       (empty)
├── textures/    (empty)
└── ui/          (empty)
```

## Summary

| Identity | Source | Status |
| -------- | ------ | ------ |
| Lil Blunt | Supplied logo | ✅ Live |
| DIAMONDS | Supplied logo | ✅ Live |
| BLAZE | None supplied | ⏳ Placeholder slot (`BLAZE_LOGO_ASSET_REQUIRED`) |
| GOLD | None supplied | ⏳ Placeholder slot (`GOLD_MINE_LOGO_ASSET_REQUIRED`) |

No BLAZE or GOLD logos were fabricated. Both remain labeled replaceable placeholder slots awaiting official assets.
