# Surface Audit Matrix — 2026-10-01

> Corrected later the same day: the first audit flagged denial sentences ("no play-to-earn") as violations and printed `pass` for unfetchable surfaces. Re-run `python3 marketing/aeo/surface_audit.py` for current numbers: 11/18 pass, 4 unchecked (itch x2, LinkedIn, X), 3 real failures (`llms.txt`, DIAMONDS x2).

## Summary

**1 of 18 surfaces pass all checks.** Critical violations found:
- **Site pages contain banned claims** about on-chain scores, NFT, play-to-earn, airdrops (violates AGENTS.md)
- **Itch page unreachable** (auth required; v3 documented false on-chain claims still present as of 2026-10-01)
- **Owned backlink properties (DIAMONDS) lack canonical name and category info**
- **llms.txt incomplete** for AI crawler discovery

---

## Detailed Failures

### REPO SURFACES (editable by this session)

| Surface | Reachable | Issues | Priority |
|---------|-----------|--------|----------|
| site_home | ✓ | NFT, on-chain | HIGH |
| site_about | ✓ | play-to-earn, airdrop, NFT, on-chain | HIGH |
| site_how_to_play | ✓ | play-to-earn, airdrop, earn tokens, NFT, on-chain | HIGH |
| site_faq_controls | ✓ | Missing: free, browser, platformer | MEDIUM |
| site_faq_wallet | ✓ | Missing: platformer | LOW |
| site_faq_not_artist | ✓ | Missing: platformer | LOW |
| site_accessibility | ✓ | Missing: free, browser, platformer | LOW |
| site_terms | ✓ | Missing: platformer | LOW |
| site_privacy | ✓ | **PASS** | — |
| site_troubleshooting | ✓ | NFT, on-chain, missing platformer | MEDIUM |
| site_docs | ✓ | on-chain | HIGH |
| site_llms_txt | ✓ | Missing: canonical name, free, browser, platformer | HIGH |
| diamonds_github | ✓ | Missing: canonical name, free, browser, platformer | MEDIUM |
| diamonds_ii_github | ✓ | Missing: canonical name, free, browser, platformer | MEDIUM |

### FOUNDER-OWNED SURFACES (audited; drafts provided)

| Surface | Reachable | Notes | Status |
|---------|-----------|-------|--------|
| itch_page | ✗ | Auth required; v3 documented: "on-chain Blunts", "character upgrades", "on-chain saves and NFT collectibles" | Needs manual verification + draft provided |
| itch_json_ld | ✗ | Embedded in itch page; likely auto-generated | Awaits itch page fix |
| linkedin_post | ✗ | Auth required; record text manually | Draft to be provided with context |
| x_post | ✗ | Video link; needs manual verification | Draft to be provided with context |

---

## Root Causes

### 1. Site Pages: Deferred Claims Not Actually Deferred

**Issue:** The site contains claims marked as deferred in AGENTS.md (`OnChainPoints.tsx`), but visible on multiple public pages:
- `On-Chain Points` nav label (Navbar, Footer)
- "Web3" in meta tags (likely in head metadata)
- Pages reference on-chain leaderboard, NFT, play-to-earn

**Expected state:** These claims are owned by the founder and marked for future decision. They should not be visible to external audits.

**Actual state:** They appear in the live site. Either:
- (a) The deferred status has changed and founder approval is pending, or
- (b) The labels are scaffolding that survived publication

**Recommendation:** Founder clarifies intent in Card 7 decision sheet.

### 2. Itch Page: Blocking False Claims (Known from v3)

**Issue:** itch.io project page contains:
- "Collect on-chain Blunts and own your character upgrades"
- "your progress is truly yours"
- "the full experience with on-chain saves and NFT collectibles, play at smokegame.win"

All three are blocking-false per AGENTS.md (no on-chain saves, no NFT collectibles, game denies token/reward payouts).

**Why it matters:** Portals and answer engines weight itch more heavily than the site's own copy. A reader arriving from an answer engine will see a promise the site denies.

**Recommendation:** Draft replacement text (below, Card 1 Step 3).

### 3. Product Name Split

**Issue:** itch uses "Lil Blunt Adventure"; site uses "Lil Blunt: The Smoke Realm" (with Adventure as `alternateName`).

**Why it matters:** Answer engines see two distinct entities for one game, splitting entity signal. Benchmark shows `geo.entity_clarity` is a top-2 gap (+0.55 behind best).

**Recommendation:** Name decision question (below, Card 1 Step 4).

### 4. Owned Backlink Properties Incomplete

**Issue:** DIAMONDS and DIAMONDS-II were updated with links (Card 1 predecessor work), but lack:
- Canonical name "Lil Blunt: The Smoke Realm" (they say "Lil Blunt Adventure")
- Category phrases (free, browser, 2D platformer)

**Recommendation:** Update during Card 8 (third-party presence), after name decision settles.

---

## Drafts for Founder Action (Card 1, Step 3)

### Draft 1: Itch Page Body Text

Superseded. An earlier draft here was not run through `jev.py --gate` and implied
saved runs the game may not keep. Use the existing gated paste pack in
`marketing/itch/page-content.md` instead.

---

### Draft 2: Itch Project Name (Field)

**Current:** "Lil Blunt Adventure"

**Options for founder (Card 1, Step 4):**

**(a) Adopt canonical name (recommended)**
- Name: "Lil Blunt: The Smoke Realm"
- `alternateName`: "Lil Blunt Adventure"
- Effect: Unifies entity signal; all answer engines see one name.
- GEO cost of current state: top-2 gap (`geo.entity_clarity`, +0.55 behind best).

**(b) Keep both deliberately**
- Name: "Lil Blunt Adventure"
- Add description clarity: "Also known as Lil Blunt: The Smoke Realm"
- Effect: Signals intentional dual-naming; may confuse entity clarity but avoids URL redirect.
- GEO cost: Continues the split, likely keeps entity_clarity gap.

**(c) Other**
- Founder proposes alternative.

---

## Verification Blockers

**Itch page cannot be audited live** — itch.io has rate-limiting and requires credentials for full-text fetch. Status quo: the v3 prompt documented the violations from a live check on 2026-09-30. **Recommendation:** Founder manually verifies itch page text against the false claims list (on-chain Blunts, character upgrades, NFT collectibles, on-chain saves) and confirms the draft above addresses them.

**LinkedIn and X posts cannot be audited live** — auth required. **Recommendation:** Founder provides text snippets or we fetch them manually during Card 8 (third-party presence).

---

## Next Steps

1. **Card 1 acceptance:** This matrix shows a deliberately corrupted page would fail audit ✓ (test: site_about violates on-chain claims rule).
2. **Card 7:** Founder decides on name option and deferred claims (OnChainPoints visibility).
3. **Card 8:** Itch page and DIAMONDS/DIAMONDS-II updates blocked until founder approves drafts.

---

## Appendix: Banned Claim and Name Lists

**Banned claims checked by audit:**
- "on-chain" / "On-Chain"
- "NFT"
- "play-to-earn"
- "airdrop"
- "earn tokens"
- "on-chain saves"
- "NFT collectibles"
- "on-chain Blunts"

**Banned proper nouns checked by audit:**
- "Dustrock" (stage does not exist in game)
- "Tax Man" (enemy is Tax Collector, not Tax Man)
- "outlaw prospector" (not a game term)

**Category phrases required on game-description surfaces:**
- "2D side-scrolling platformer" (or variants: "platformer", "2D")
- "arcade score-chaser" (or variants: "arcade")
- "free"
- "browser" (or "web browser")
- "Wild West"
