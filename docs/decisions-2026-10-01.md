# Founder Decision Sheet — 2026-10-01

**All decisions below are answerable in one line.** This sheet consolidates findings from Cards 1 and 3.

---

## 1. Itch.io Page: Fix False On-Chain Claims

**Current state (live, as of 2026-10-01):**
- https://itch.io/games/lil-blunt-adventure
- Project name: "Lil Blunt Adventure"
- Body text: "Collect on-chain Blunts and own your character upgrades" + "full experience with on-chain saves and NFT collectibles"

**Rule violated:** AGENTS.md blocking rules:
- ✗ No on-chain saves (false claim)
- ✗ No NFT collectibles (false claim)
- ✗ No token payouts (false claim: "collect on-chain Blunts")

**Why it matters:**
- itch.io is the highest-visibility portal; answer engines quote it over the site's own copy
- The promises don't exist in the game; a player arriving from an AI answer will be disappointed
- It contradicts the site's canonical message ("achievements only, not earnings")

**Proposed replacement text (gated, passes jev.py --gate):**
```
Track your score and climb the leaderboard as you master each stage. Your best 
runs are saved so you can come back and chase a higher score. Play across three 
Wild West stages — Smoke Realm, Crystal Caverns, and Gold Rush — each ending in 
a boss fight. Free, no account needed, no wallet needed.
```

**Detailed form text:** See `marketing/itch/page-content.md` (lines 14–95, titled "COPY-PASTE PACK").

**Founder decision:**
> Approve the replacement text above and edit the itch.io page? (Y/N)

---

## 2. Product Name: Unify "Lil Blunt Adventure" vs "Lil Blunt: The Smoke Realm"

**Current state (split entity signal):**
- itch.io: "Lil Blunt Adventure"
- Site (JSON-LD, og:tags, canonical entry): "Lil Blunt: The Smoke Realm"
- Result: Answer engines see two distinct entities for one game

**Measured cost:**
- Benchmark gap on `geo.entity_clarity`: **+0.55 behind best page** (top-2 measured gap)
- Resolving this could improve AI discoverability when game is mentioned

### Option A: Adopt Canonical Name (Recommended)
- **Itch project title:** Rename to "Lil Blunt: The Smoke Realm"
- **Itch URL slug:** Keep as `lil-blunt-adventure` (changing live slugs breaks 273 existing referrals)
- **Site canonical entry:** Already correct
- **Effect:** All answer engines see one name; entity clarity improves
- **Cost:** One itch edit

### Option B: Keep Both Deliberately
- **Itch project title:** "Lil Blunt Adventure"
- **Site JSON-LD:** Keep "Lil Blunt Adventure" as `alternateName`
- **Effect:** Signals intentional dual-naming; entity clarity gap persists
- **Rationale:** None known; included for completeness

### Option C: Other
- Founder proposes alternative approach

**Founder decision:**
> Which option for the itch project title? (A / B / C)
> If C, describe the approach:

---

## 3. Deferred Claims Status: On-Chain Points, Web3 Meta Tag

**Current state (live, in code):**
- Navbar and Footer carry label: "On-Chain Points" (→ `#points` anchor)
- HTML head meta: "Web3" (likely)
- OnChainPoints.tsx component marked with `doNotBuild` note in AGENTS.md

**Context (from AGENTS.md):**
- "no live on-chain ICP leaderboard with real scores"
- "no NFT minting claims — achievement layer only"
- Demo leaderboard labeled with `DemoBadge` / `DEMO LEADERBOARD`

**AGENTS.md status:** These are listed as deferred items owned by founder.

**Question:** Are these labels and tags still intended scaffolding, or has status changed?

**Founder decision:**
> Current intended state of On-Chain Points, Web3 meta tag, and demo leaderboard labels:
> (a) Scaffolding; hide or remove on next publish
> (b) Keep as-is; final state
> (c) Other (describe):

---

## 4. Product Name Change Impact: Domain / Backlinks

**Related to Decision 2.**

If itch.io project is renamed (Option A), existing inbound links to https://itch.io/games/lil-blunt-adventure will break **unless itch.io provides redirects** (unknown).

**Known referral count:** 273 views from itch as of 2026-09-30.

**Recommendation:** Before renaming, contact itch.io support or test whether a renamed project maintains a 301 redirect from the old slug. If it doesn't, a name change loses referral history.

**Founder decision:**
> Before renaming itch project, verify itch.io preserves old-slug redirects? (Y/N)

---

## 5. OpenRouter Credits Top-Up

**Current balance:** ~$2.28 (85.00 credited, 82.72 spent as of 2026-10-01)

**Required for:**
- Card 2 (correctness probe): ~$0.90
- Card 4 (entity/category rewrite, one Jev run): ~$0.40
- Card 5 (referral measurement): $0

**Recommendation:** Top up to $10 or more. Current balance covers Cards 2 and 4 once but not weekly probes.

**Founder decision:**
> Top up OpenRouter credits? If yes, to what amount? (e.g., $10, $25)

---

## 6. Search Console & Bing Webmaster Connection

**Current state:** Not connected. No impression, click, or coverage data exists.

**Impact:** Cannot measure whether improvements to entity clarity and category anchoring actually improve visibility in Google's AI Overviews or Bing's generative results.

**Setup (one-time, ~10 min):**
- Google Search Console: Verify via DNS TXT record or meta tag
- Bing Webmaster Tools: Verify via DNS TXT or meta tag

**Founder decision:**
> Connect Search Console and Bing Webmaster Tools? Preferred verification method: (DNS / meta tag)

---

## 7. Firecrawl API Key

**Current state:** Key in `research_agent.py` returns 401 (dead/expired).

**Fallback:** Plain HTTP works for live page fetches.

**Impact:** Research agent can still benchmark pages, just slower (no cached crawl data).

**Founder decision:**
> Paste a fresh Firecrawl API key for research_agent.py? (If no, we continue with HTTP fallback.)

---

## 8. X/Twitter Backlink: Demo Video Link

**Current state (from earlier conversation):**
- X post by @smokering25 shows demo video
- Link: https://x.com/smokering25/status/2105394557865374145
- No smokegame.win link in the post

**Recommendation (Card 8 follow-up):** Reply to this post with a link to https://www.smokegame.win/ to create a backlink from a high-authority platform (X).

**Founder decision:**
> Post a reply to the demo video with www.smokegame.win link? (Y/N)
> If yes, suggested text: "Now playable at www.smokegame.win — build your score across the Smoke Realm, Crystal Caverns, and Gold Rush. Free in your browser."

---

## 9. DIAMONDS and DIAMONDS-II Updates

**Current state:** These are founder-owned backlink properties that link to the game.

**Card 8 findings:**
- DIAMONDS: lacks canonical name and category phrases
- DIAMONDS-II: lacks canonical name and category phrases
- Both need: name unified (once Decision 2 is made), category phrases added

**Dependency:** Wait for Decision 2 (itch name) before updating these; otherwise they'll have mismatched names.

**Founder decision:**
> Approve updates to DIAMONDS and DIAMONDS-II READMEs once itch name is decided? (Y/N)

---

## Summary Table

| Decision | Status | Blocker | Approver |
|----------|--------|---------|----------|
| 1. Itch page replacement text | Ready to implement | No | Founder |
| 2. Product name unification | Option A/B/C | No | Founder |
| 3. On-Chain Points / Web3 status | Clarification needed | No | Founder |
| 4. Itch slug redirect verification | Recommended | No | Founder |
| 5. Credits top-up | Needed for Cards 2 & 4 | Yes (to continue) | Founder |
| 6. Search Console / Bing connect | Recommended | No | Founder |
| 7. Firecrawl key refresh | Optional (HTTP works) | No | Founder |
| 8. X demo video backlink | Recommended | No | Founder |
| 9. DIAMONDS updates | Blocked on #2 | Yes (on #2) | Founder |

---

## Next Steps (Post-Decision)

1. **Immediate (no OpenRouter):**
   - Founder approves/rejects Decisions 1, 2, 3
   - If Decision 1 approved: founder edits itch.io page
   - If Decision 2 approved (Option A): founder renames itch project (after verifying redirects)

2. **With credits (Decisions 5, 2):**
   - Once OpenRouter is topped up and itch name is unified, run Card 2 (correctness probe) to measure citation accuracy
   - Run Card 4 (entity/category rewrite) to improve GEO scores

3. **Parallel (no blockers):**
   - Run Card 6 (snapshot watch) to learn prerender cache behavior
   - Run Card 5 (referral measurement) if CrawlConsole connector works

4. **Final (Card 8):**
   - Draft third-party submissions (directory, LinkedIn) once name is decided
   - Implement X demo video reply backlink

---

## Appendix: Card 1 & 3 Artifacts

- **Card 1 Audit:**
  - `marketing/aeo/surfaces.json`: Registry of all 18 game-description surfaces
  - `marketing/aeo/surface_audit.py`: Linter that checks each surface for accuracy
  - `docs/research/2026-10-01-surface-matrix.md`: Full audit results and analysis

- **Card 3 Facts:**
  - `marketing/aeo/claims.json`: Extended fact registry with 14 facts (7 verified, 5 ⚠️ awaiting gm-game-sync)
  - `marketing/aeo/facts_lint.py`: Linter that checks pages for required facts and forbidden contradictions

---

**Ready for founder input. No further work proceeds until Decisions 1, 2, 3, and 5 are answered.**
