# GOLD / Gold Mine Logo Asset Slot

This folder is the **replaceable placeholder slot** for the GOLD / Gold Mine protocol logo.

- **Required asset:** `gold-mine-logo.png` (official GOLD Mine logo)
- **Referenced from:** `src/frontend/src/lib/brand.ts` → `GOLD_MINE_LOGO_SRC`
- **Status:** No official GOLD asset was supplied. Do NOT fabricate a logo.

To activate the real logo, drop the official asset at:

```
src/frontend/public/assets/brand/gold/gold-mine-logo.png
```

No code change is required — the path is already wired through `GOLD_MINE_LOGO_SRC`. Until then the section renders the `GOLD_MINE_LOGO_ASSET_REQUIRED` label.
