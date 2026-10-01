# Founder Decision Sheet — 2026-10-01

## START HERE: decisions from the deep-dive audit (`docs/audit-2026-10-01-deep-dive.md`)

1. **Fix the bare domain `smokegame.win` (dead; our own homepage text tells people to type it).** NameSilo: add a 301 URL forward from the apex to `https://www.smokegame.win/`, scoped to the apex only, then tell me and I verify `www` still serves. (Y / do it differently)
2. **Version 46 (draft) is unverified: Caffeine reports failed tests and sent no file list.** (a) You open the draft, check `/llms.txt`, the Play button and `/about/`, then Go live; (b) you consent to me installing the Caffeine CLI (`caffeine_local_setup`) to download and diff the source; (c) discard it. Recommendation: (b).
3. **Send Round 5 (fix the false "not a real recording artist" page)?** Draft and Jev result are in `marketing/aeo/outbox/round5-artist-faq.md`. Held until 46 is resolved, because drafts stack. (Y / edit first)
4. **Edit the itch body now.** Paste block 6 of `marketing/itch/page-content.md` over the description (removes on-chain, NFT, wallet-connect, "trade rare items" and "Neon Spore Forest"; adds the verified controls). (done / not yet)
5. **Search Console:** a `google-site-verification` TXT already exists on smokegame.win, so a property exists under some Google account. Which account, so we can connect it? (account, or "none")
6. **Homepage button "Connect Wallet"** (it opens Internet Identity sign-in; search snippets show the label). Rename to "Sign in"? (Y / keep)
7. **Wording:** use "no wallet required" instead of "no wallet" everywhere, because the game's main menu has an optional wallet button. (Y / keep)
8. **Security headers (CSP etc.)** missing at the platform edge. May I ask Caffeine whether it can set them? (Y / skip)

**Your answers so far:** apex fix "yes, later" (steps below when you are ready), Version 46 option (b) tried but the CLI cannot log in here (needs a keychain; it must run on your own machine), Round 5 sent (draft building), itch body not yet edited.

9. **Privacy wording.** The live site also loads Caffeine's Umami analytics script; `/privacy/` only names CrawlConsole. May I send a round adding one accurate sentence (needs Caffeine to confirm what Umami collects)? (Y / skip)
10. **Turn on minification** (Caffeine build setting `minify: false` in vite.config.js): measured bundle 1.87 MB to 0.82 MB, gzip 396 KB to 260 KB, faster first load. (Y, ask Caffeine / skip)
11. **Autoplay video has no pause button** (an accessibility rule for moving content over 5 seconds) and its first-paint image is a 3.4 MB PNG when a 204 KB one already exists. Both touch the protected background video, so I will not touch them without your words. (leave / change, tell me exactly what)
12. **Round 6 (code fixes)**: error boundary so a crash shows a message not a blank page, focus handling for the About/Docs overlay, a DEMO badge on the figures. Tested in the repo (41 tests). Held until Version 47 is published and verified. (Y after 47 / skip)

**Apex fix, in plain steps (item 1, for later):** log in to NameSilo, open smokegame.win, go to URL Forwarding, add a forward from `smokegame.win` to `https://www.smokegame.win/` (301, permanent), apply it to the main domain only and not to `www`. Then tell me; I check that `www` still works and that `smokegame.win` now lands there.

Done this session without asking (your earlier yes): both DIAMONDS repos now link `youngstunners88.itch.io/smokerealm` (commits 3c0fdf2, d376698 on main).

---


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

**Proposed replacement text:** use the gated pack in `marketing/itch/page-content.md` (blocks 2 and 6). The short draft that used to be here was not gated and is withdrawn.

_Superseded draft:_
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

## 0. Updates from the founder (2026-10-01)

- **Itch renamed** by the founder. Not verified by me: itch.io returns a Cloudflare 403 to this host. To let the audit check it, paste the live page text into `marketing/aeo/surface_text/itch_page.txt`.
- **On-chain wording.** The founder plans on-chain features and NFTs. Position: roadmap wording ("planned", "coming") is allowed; present-tense ownership or save claims stay blocked until they ship, because AGENTS.md rules on what is true today and an answer engine repeats the sentence without the date. When a feature ships, update AGENTS.md and the pages in one commit.
- **New blind spot, needs a decision:** production's `/llms.txt` is generic Caffeine boilerplate, not our brief. Can Caffeine's own settings serve a custom `/llms.txt`? (Y / N / unknown)

- **RESOLVED 2026-10-01 — itch slug is `smokerealm`, kept as is.** Old slug 302-redirects (verified), so nothing broke. Still open for the founder: (1) title should read `Lil Blunt: The Smoke Realm`; (2) the itch BODY still carries on-chain, wallet-connect and WASD claims that Jev blocks (on-chain 0.75, rewards 0.93, play-to-earn 0.60) and the invented stage name "Neon Spore Forest" — paste block 6 of `marketing/itch/page-content.md` over it. Round 4 sent to Caffeine (draft only) to repoint every site link and ship `llms.txt`; needs your Go live.
- _Earlier note, superseded:_ **Itch title and slug (screenshot 2026-10-01):** title reads "The Smoke Realm", slug being changed to `smokerealm`. Two issues. (a) The title drops "Lil Blunt:", so it matches neither the canonical name nor the music-artist disambiguation; use `Lil Blunt: The Smoke Realm`. (b) The slug is the live Play-button target on the site (`Hero.tsx`, `PlayGame.tsx`), in JSON-LD, the noscript link, `llms.txt` and 11 static pages. If itch does not redirect the old slug, saving it breaks the site's main call to action. Recommendation: keep `lil-blunt-adventure`. If you change it anyway: tell me the exact new slug first so one Caffeine round can update every link, and open the old URL in a private window right after saving.
- **Caffeine, read-only probe (index 497-498):** Caffeine's chat agent cannot read files and found nothing in its docs on `llms.txt`, so the cause of the overwrite is unconfirmed. It was already overwritten and fixed once before (index 4851-4886) and came back. Proposed test, which needs a draft and your Go live: publish the brief also as `public/llms-full.txt` and curl it. Held until the slug is settled.

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
