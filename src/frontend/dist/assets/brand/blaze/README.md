# BLAZE Logo Asset Slot

This folder is the **replaceable placeholder slot** for the BLAZE protocol logo.

- **Required asset:** `blaze-logo.png` (official BLAZE logo)
- **Referenced from:** `src/frontend/src/lib/brand.ts` → `BLAZE_LOGO_SRC`
- **Status:** No official BLAZE asset was supplied. Do NOT fabricate a logo.

To activate the real logo, drop the official asset at:

```
src/frontend/public/assets/brand/blaze/blaze-logo.png
```

No code change is required — the path is already wired through `BLAZE_LOGO_SRC`. Until then the section renders the `BLAZE_LOGO_ASSET_REQUIRED` label.
