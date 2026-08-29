# Ad source assets

**Required file for Claude Code render pipeline:**
`marketing/ads/source/hero.png`

Once this file is present, Claude Code will render all five sizes × both variants in ~10 seconds.

## How to add the hero (Lil Blunt cowboy / $GOLD nuggets / $DIAMONDS ice cream)

1. Take the image from the conversation attachment (IMG_2270.jpeg) or from the Grok project artifacts (`hero.png` / `hero_source.jpeg`).
2. Save / convert it to PNG and place it exactly at:
   ```
   marketing/ads/source/hero.png
   ```
3. Commit and push, or let Claude Code pick it up if the working tree already has it.

The directory was created 2026-08-29 so the path is ready. Everything else in the ads pipeline is done and waiting on this single file.
