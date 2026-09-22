---
name: brand-links
description: The authoritative registry of official logos, protocol sites, and social channels for the Smoke Realm site, plus the rules for rendering them. Use when wiring up or fixing social icons, protocol links, or any logo — and before adding, changing, or "improving" a brand asset.
---

# Brand Assets and Official Links

Single source of truth: `src/frontend/src/lib/brand.ts`. Never hardcode a logo
path or an external URL in a component — import it from there.

## Official URLs

| Channel   | URL                                              |
|-----------|--------------------------------------------------|
| X         | `https://x.com/smokering25`                      |
| Telegram  | `https://t.me/LilBluntdotWin`                    |
| SMOKE     | `https://lilblunt.win/`                          |
| DIAMONDS  | `https://diamonds1111.win/`                      |
| GOLD      | `https://mine4gold.app/`                         |
| Game      | `https://youngstunners88.itch.io/lil-blunt-adventure` |
| Site      | `https://smokegame.win/`                         |

X and Telegram are the `$SMOKE` token's and the website's official accounts.
There is no official GitHub channel — do not invent one.

## The cardinal rule: never invent or regenerate a logo

The founder supplies logo files. Use the **exact** file, unmodified:

- `LIL_BLUNT_LOGO_SRC` — green outlaw character on a rocket
- `DIAMONDS_LOGO_SRC` — blue faceted diamond inside a bright green ring
- `GOLD_MINE_LOGO_SRC` — gold "GM" medallion in a gold chain ring
- `BLAZE_LOGO_SRC` — diamond-on-fire accent mark

Never generate a replacement, never substitute a similar image, never ask an AI
builder to "create" one of these. If a file is missing, say so and stop.

## Do not add rings or glows to logos

**This has been reported as a bug more than once.** The DIAMONDS and GOLD files
already have ring artwork baked into the image — a green ring around the
diamond, a gold chain around the GM medallion. Adding a CSS `ring-*` class or a
blurred ambient glow behind them produces a visible clash (e.g. a blue CSS ring
wrapping an already-green-ringed logo).

The circular frame renders the image and nothing else:

```tsx
<div className="flex size-32 items-center justify-center overflow-hidden rounded-full">
  <img src={logoSrc} alt={logoAlt} className="size-full object-contain object-center" />
</div>
```

Also do not stretch or crop — `object-contain` preserves aspect ratio.

## Rendering social links

Real anchors, never disabled buttons. Each needs:

- `target="_blank"` and `rel="noopener noreferrer me"` (`me` marks it as our own
  account)
- A descriptive `sr-only` label and `title` — "Follow $SMOKE and Lil Blunt: The
  Smoke Realm on X", not just "X"
- `aria-hidden="true"` on the icon itself, since the label carries the meaning
- Wrapped in a `<nav aria-label="Community channels">`

## When adding a new official channel

1. Add the URL to `SOCIAL_LINKS` in `lib/brand.ts`.
2. Add it to the footer's `SOCIAL_CHANNELS` array.
3. **Add it to the `sameAs` array** in the JSON-LD block in `index.html` — that
   is how Google links the site to its accounts.

## Protocol card contents

Each card contains exactly: protocol name, circular logo, one descriptor line,
and the "Enter" link. No watermark icons, no decorative background glyphs.
This has been explicitly requested — do not reintroduce them.
