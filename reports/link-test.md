# Link Test Report — THE SMOKE FRONTIER

This report documents verification of every link on the THE SMOKE FRONTIER landing page.

## External Link — Play Game

| Link | Target | Status |
| ---- | ------ | ------ |
| PLAY NOW (Hero) | `https://youngstunners88.itch.io/lil-blunt-adventure` | ✅ Verified |
| PLAY NOW (PlayGame section) | `https://youngstunners88.itch.io/lil-blunt-adventure` | ✅ Verified |
| Footer Play link | `https://youngstunners88.itch.io/lil-blunt-adventure` | ✅ Verified |

All Play Game CTAs open the itch.io game in a new tab (`target="_blank"` with `rel="noopener noreferrer"`).

## In-Page Anchor Links (Navbar)

The navbar links smooth-scroll to the following section IDs. Each target was verified to exist in the rendered page:

| Nav label | Anchor | Target section | Status |
| --------- | ------ | -------------- | ------ |
| Game Ecosystem | `#ecosystem` | DemandCascade | ✅ Verified |
| BLAZE | `#blaze` | Blaze | ✅ Verified |
| DIAMONDS | `#diamonds` | Diamonds | ✅ Verified |
| GOLD | `#gold` | Gold | ✅ Verified |
| Leaderboard | `#leaderboard` | Leaderboard | ✅ Verified |
| NFTs | `#nfts` | NFTGallery | ✅ Verified |
| Vault | `#vault` | Vault | ✅ Verified |

Additional anchors present in the page (not in the navbar but used by other controls):

| Anchor | Target section | Status |
| ------ | -------------- | ------ |
| `#play` | Hero (navbar logo scrolls here) | ✅ Verified |
| `#feats` | ProofOfPlay | ✅ Verified |

All anchor targets exist as `id` attributes on their sections, so smooth-scroll navigation resolves correctly.

## Community Channels — Genuine Finding

The Community section ("The Saloon") renders four channel tiles: **X / Twitter, Telegram, GitHub, Discord**.

**Finding:** All four community channels are **disabled "coming soon" tiles**, not live links. No real URLs were supplied, so none were fabricated. Each tile renders as a non-link element (`role="img"` with `aria-label="<name> — coming soon"`) with a "Coming soon" status pill and an `href` of `#` (effectively no navigation). This is intentional and documented in the source: URLs are omitted until a real `href` is provided, at which point the tile automatically becomes a live link.

| Channel | Status |
| ------- | ------ |
| X / Twitter | ⏳ Coming soon (disabled tile) |
| Telegram | ⏳ Coming soon (disabled tile) |
| GitHub | ⏳ Coming soon (disabled tile) |
| Discord | ⏳ Coming soon (disabled tile) |

This is recorded as a **genuine finding**: the community channels are intentionally non-functional placeholders awaiting real URLs, not broken links.

## Summary

- **External Play Game links:** 3 occurrences, all pointing to the correct itch.io URL. ✅
- **Nav anchors:** 7 navbar anchors + 2 additional anchors, all resolving to existing section IDs. ✅
- **Community channels:** 4 disabled "coming soon" tiles (X, Telegram, GitHub, Discord) — no fabricated URLs. ⏳ Genuine finding.
