# Project Guidance

## User Preferences

[No preferences yet]

## Verified Commands

**Frontend** (run from `src/frontend/`):

- **install**: `pnpm install --prefer-offline`
- **typecheck**: `pnpm typecheck`
- **lint fix**: `pnpm fix`
- **build**: `pnpm build`

**Backend** (run from `src/backend/`):

- **install**: `mops install`
- **typecheck**: `mops check --fix`
- **build**: `mops build`

**Backend and frontend integration** (run from root):

- **generate bindings**: `pnpm bindgen` This step is necessary to ensure the frontend can call the backend methods.

## Head Metadata (SEO and Link Previews)

`src/frontend/index.html` ships with social-sharing meta tags (`description`, `og:title`, `og:description`, `og:type`, `og:image`, `og:image:alt`, `twitter:card`, `twitter:image`). Links shared to this app only render a preview card if these tags are present in the deployed `index.html`.

When editing `index.html` (e.g. changing the title or favicon):

- **Never remove these meta tags.** Update them instead.
- Keep `og:title` identical to `<title>`, and `og:description` identical to the `description` meta tag.
- `og:image` and `twitter:image` must always point to an absolute `https://` URL. Keep the pre-configured default image unless the user explicitly provides or requests a custom share image; a custom image should be 1200×630 pixels.

## Public Claims Accuracy (blocking)

`src/frontend/src/components/sections/OnChainPoints.tsx` carries a `doNotBuild`
note: **no live on-chain ICP leaderboard with real scores**, and **no NFT
minting claims — achievement layer only**. The leaderboard, supply, and staking
figures rendered on the site are demo data and carry `DemoBadge` /
`DEMO LEADERBOARD` labels.

Anything written for public consumption — marketing copy, the static
`/about/` and `/how-to-play/` pages, `llms.txt`, structured data, outreach —
must respect that.

- Safe: the site is served from an ICP canister; Internet Identity sign-in
  works; Proof of Play is an achievement layer; free, no wallet, no fee.
- Not true: scores are recorded on-chain today; the leaderboard is publicly
  verifiable; players earn tokens, airdrops, or NFTs; play-to-earn.
- Never write tokenomics from the on-site figures — they are placeholders.

This bit once already: AEO pages were published claiming scores were written
on-chain. Check the `doNotBuild` note before writing on-chain claims, and if a
feature has since shipped, update the pages and this section together.

## Learnings

[No learnings yet]
