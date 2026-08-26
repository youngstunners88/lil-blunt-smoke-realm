# Responsive Test Report — THE SMOKE FRONTIER

This report documents responsive verification of the THE SMOKE FRONTIER landing page across the seven required widths, with the specified mobile priority order.

## Test Widths

| Width (px) | Class | Notes |
| ---------- | ----- | ----- |
| 375 | Mobile | Small phone |
| 390 | Mobile | iPhone 12/13/14 |
| 430 | Mobile | iPhone 14 Pro Max |
| 768 | Tablet | iPad portrait |
| 1024 | Tablet / small laptop | Nav switches to desktop links at `lg` |
| 1440 | Desktop | Standard laptop |
| 1920 | Desktop | Large monitor |

## Mobile Priority Order

On mobile the page is ordered to surface the most important content first. The verified order is:

1. **Lil Blunt** — Hero (brand identity + PLAY NOW)
2. **Play Game** — primary game entry with gameplay screenshot
3. **Ecosystem** — the BLAZE → DIAMONDS → GOLD demand cascade
4. **Leaderboard** — the Wanted Board
5. **Gold / Diamonds / Blaze** — protocol identities
6. **NFTs** — NFT gallery / achievements
7. **Vault** — the vault accordion

## Verification Results

### 375 / 390 / 430 (Mobile)

- **Navbar:** Collapses to a hamburger `Sheet` menu (`lg:hidden`); the CONNECT INTERNET IDENTITY button remains visible and persistent. Brand mark + text fit without overflow.
- **Hero:** Logo, headline, and PLAY NOW CTA stack cleanly; no horizontal scroll (`overflow-x-hidden` on the root).
- **Sections:** All sections use `px-4` and stack in single-column grids; `gap-4`/`gap-5` spacing holds.
- **Community:** 2-column grid (`grid-cols-2`) for the four channel tiles.
- **Touch targets:** Interactive controls meet the 44px mobile hit-target guidance.
- **Result:** ✅ Pass — no overflow, no clipped content, priority order correct.

### 768 (Tablet)

- **Navbar:** Still uses the mobile Sheet menu (desktop links appear at `lg` = 1024).
- **Sections:** Two-column grids begin to engage where appropriate; spacing scales via `sm:` breakpoints (`sm:px-6`, `sm:py-32`).
- **Result:** ✅ Pass.

### 1024 (Tablet / small laptop)

- **Navbar:** Desktop link row appears (`lg:flex`); the Sheet menu hides.
- **Sections:** Full multi-column layouts engage; `lg:px-8` and `lg:grid-cols-4` (Community) apply.
- **Result:** ✅ Pass.

### 1440 / 1920 (Desktop)

- **Navbar:** Centered desktop links + right-aligned Connect control within `max-w-7xl`.
- **Sections:** Content constrained to `max-w-7xl` / `max-w-5xl` containers; grids scale to 3–4 columns; hero display type scales to `text-7xl`.
- **Result:** ✅ Pass — no stretched or sparse layouts; content remains centered and readable.

## Responsive Implementation Notes

- Root uses `overflow-x-hidden` to prevent horizontal scroll at any width.
- Breakpoints follow the `sm` (640) / `lg` (1024) Tailwind scale, with `px-4 sm:px-6 lg:px-8` section padding and `py-24 sm:py-32` vertical rhythm.
- Typography scales via `text-4xl sm:text-5xl lg:text-6xl` (headings) and `text-5xl sm:text-7xl` (hero).
- All seven widths verified with no layout breakage, no overflow, and the mobile priority order intact.
