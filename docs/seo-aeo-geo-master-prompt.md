# SEO / AEO / GEO Master Prompt — Lil Blunt: The Smoke Realm

## Executive Summary
This prompt orchestrates a complete SEO, AEO, and GEO campaign from measurement through publication verification. It stages work through decision gates, routes to specialized skills, and produces a unified roadmap of what to build, measure, and ship.

**Success metric:** Entry point is rapid-assessment; exit is verify_publish.py passing 34/34 after each dispatch.

---

## Phase 1: State Assessment (Entry Point)

**Skill:** `rapid-assessment`

**What it does:**
- Compares repo state to production (Caffeine v44 live, www URLs consistent, Version 45 queued)
- Checks for phantom pages, stale measurement, unshipped work, accuracy violations
- Produces a checklist of what is actually true right now

**Inputs:**
- None (reads the codebase and live site)

**Outputs:**
- "Live production state is X. Repo is Y. Gap: [list]."
- Baseline metrics (probe is 3/50, Search Console not connected, zero backlinks indexed)
- Blocked or off-track items

**Gate:** Proceed to Phase 2 only if the list of gaps is clear and prioritized.

---

## Phase 2: Gap Analysis (Research & Measurement)

### 2a. What Are We Lacking? (Research Loop)

**Skill:** `research-agent`

**What it does:**
- Benchmarks competing/similar pages
- Fetches via Firecrawl (if key is live) or HTTP
- Scores gap to ours using Jev
- Fact-checks proposals against GM-GAME source
- Produces a report: `/docs/research/<date>-benchmark.md`

**Inputs:**
- Query list (e.g., "free browser platformer", "indie game", "Godot HTML5 game")
- Top-3 competitor URLs (from SERP or manual nomination)

**Outputs:**
- Ranked findings: "Page X ranks because it has Y. We lack Z."
- Jev scores on SEO/AEO/GEO fit
- Actionable fixes per page type

**Constraints:**
- Do NOT change game code, portals, or Episode 2 gating
- Check all claims against GM-GAME before proposing

---

### 2b. Are We Being Cited? (Measurement)

**Skill:** `aeo-measurement`

**What it does:**
- Runs the probe (`marketing/aeo/probe.py`)
- Runs the 35-question set in marketing/aeo/questions.json
- Measures share of voice, citation patterns
- Updates `docs/probe-<date>.json`

**Inputs:**
- Probe query list (currently 35 questions)
- Entity name ("Lil Blunt: The Smoke Realm")

**Outputs:**
- Citation rate (currently 3/50)
- Which passages get quoted
- Confidence intervals (Wilson CI)
- Trending direction (up/flat/down)

**Note:** Firecrawl key must be fresh; only a new session sees env updates.

---

### 2c. What Keywords Can We Win? (Search Intelligence)

**Skill:** `search-intelligence`

**What it does:**
- Calls Monid's Ahrefs/Semrush endpoints
- Returns: volume, difficulty, competitor gaps, decay curves
- Identifies "short page, huge traffic" opportunities
- Cost-guard: stops a single call eating budget

**Inputs:**
- Keyword tier list (brand / category / long-tail)
- Competitive landscape (who ranks now?)

**Outputs:**
- Winnable keywords ranked by effort/payoff
- Traffic decay analysis
- Competitor keyword gaps

**Gate:** Proceed to Phase 3 only if you have real data, not guesses.

---

### 2d. What Does Search Console See? (Indexing Audit)

**Skill:** `searchata-seo`

**What it does:**
- Reads Google Search Console (if connected) or Bing via Searchata
- Verifies: pages indexed, crawl status, coverage issues
- Finds impression/click data (if available)
- Detects cloaking, canonicals, AMP/mobile issues

**Inputs:**
- Search Console property (currently NOT connected — this is a blocker)

**Outputs:**
- Indexing coverage report
- Real query impression data (once property is added)
- Technical SEO audit

**Blocker:** Search Console must be connected to get real data. Without it, all indexing claims are guesses.

---

## Phase 3: Accuracy & Entity Clarity

### 3a. Is Our Copy Accurate? (Accuracy Gate)

**Skill:** `jev-gauntlet`

**What it does:**
- Scores ALL public-facing copy against AGENTS.md blocking rules
- Four blocking questions: onchain_scores, verifiable_leaderboard, rewards, play_to_earn
- Per-question thresholds (0.25, 0.30, 0.25, 0.40)
- Flags: "BLOCKED", "PASS", or "PASS: reword for confidence"

**Inputs:**
- Copy to gate (from pages, JSON-LD, og:description, social posts, etc.)

**Outputs:**
- Gating report: which claims fail, which pass
- Jev scores (raw and calibrated)
- Rewrite suggestions (if PASS but shaky)

**Blocking claims (from AGENTS.md):**
- "On-chain leaderboard" — FALSE (demo data only)
- "$SMOKE rewards" — FALSE (no token payout)
- "Play-to-earn" — FALSE (no earning mechanism)
- "NFT airdrops" — FALSE

**Gate:** Nothing ships until it passes.

---

### 3b. Would AI Describe Us Correctly? (Entity Clarity)

**Skill:** `geo-representation`

**What it does:**
- Measures whether generated text would describe the game CORRECTLY
- Checks: entity clarity, disambiguation from the music artist
- List-readiness (can it go into a game directory?)
- Category anchoring (not confused with other genres/tokens)

**Inputs:**
- Copy samples from pages, JSON-LD, og:description

**Outputs:**
- "AI would describe us as: [text]. That is [correct/wrong/ambiguous]."
- Rewrite priority: "Name before genre before mechanics"

---

### 3c. Which Passages Get Quoted? (Quotability)

**Skill:** `aeo-quotability`

**What it does:**
- Per-passage scoring on: quotability, self-containment, question-fit, evidence density
- Measures which specific paragraph an answer engine would actually cite
- Identifies: "this page has gold, but paragraph 3 buries it"

**Inputs:**
- Passage list (from any page)

**Outputs:**
- Scored passages ranked by citation likelihood
- "Rewrite paragraph X to move the key claim to sentence 1"

**Note:** This is NOT "did it get cited" (that's aeo-measurement). This is "IF quoted, which part?"

---

## Phase 4: Content & SEO Optimization

### 4a. What Should We Build? (Workflow Router)

**Skill:** `project-playbook`

**What it does:**
- Routes tasks to the right skill combination
- Decides: is this SEO? AEO? GEO? All three?
- Identifies dependencies and sequencing
- Checks blocking rules (video, Episode 2, game code immutable)

**Inputs:**
- Task description (e.g., "write a FAQ about on-chain play")

**Outputs:**
- Skill chain (e.g., "gm-game-sync → aeo-ai-discoverability → jev-gauntlet → seo-optimization → seo-smokegame-ship")
- Blocking checks (e.g., "Game code read-only, cannot change claim X")

---

### 4b. Intent Match & Rank Potential (SEO Strategy)

**Skill:** `seo-intent-match`

**What it does:**
- Audits whether a page satisfies the intent behind the query it targets
- Scores per passage: intent match, beyond-generic specificity, scannability
- Answers: "Why does this page not rank for [query]?"

**Inputs:**
- Query (e.g., "free browser platformer")
- Page (e.g., `/`)

**Outputs:**
- Intent match score (0-1)
- "Page is about [X]. Query wants [Y]. Gap: [why]."
- Rewrite priority

---

### 4c. Expand Query Coverage (Query Expansion)

**Skill:** `query-expansion`

**What it does:**
- Widens the set of queries a page can match
- Measures modifier and synonym coverage NOW
- Once Search Console data exists, runs the "harvest loop" (position > 3 → add variant)

**Inputs:**
- Page URL
- Core query ("platformer")

**Outputs:**
- Missing modifiers ("free", "browser", "2D", "indie")
- Synonym coverage ("side-scroller" vs "platformer")
- Recommended text additions

---

### 4d. SEO Best Practices (Technical Baseline)

**Skill:** `seo-optimization`

**What it does:**
- Applies Google Search Central checklist
- Audits: titles, meta descriptions, canonical URLs, JSON-LD, robots.txt, sitemap, alt text, link quality
- Catches: duplicate content, cloaking, redirect chains

**Inputs:**
- Pages to audit (homepage + all 11 static pages)

**Outputs:**
- "Title too long (68 chars, max 60)"
- "og:image is broken (404)"
- "JSON-LD @id uses non-www, should be www"

---

### 4e. AI Discoverability (AEO Publishing)

**Skill:** `aeo-ai-discoverability`

**What it does:**
- Makes site crawlable and quotable by ChatGPT, Claude, Perplexity, Gemini, Google AI Overviews
- Ensures: static HTML (no JS-only content), llms.txt exists, FAQ schema
- Sets AI-crawler robots rules

**Inputs:**
- None (reads the codebase and robots.txt)

**Outputs:**
- "llms.txt is stale" or "llms.txt is correct"
- "Add FAQ schema to [pages]"
- "robots.txt allows AI crawlers" (yes/no)

---

## Phase 5: Publication & Verification

### 5a. Dispatch to Production (Caffeine CI/CD)

**Skill:** `seo-smokegame-ship`

**What it does:**
- Drafts a Caffeine dispatch (new version, not live)
- Lists all changed files and URLs
- Does NOT publish (waits for founder click)
- Pre-verifies source (no mixed www/non-www, all canonical tags present)

**Inputs:**
- List of files to change (e.g., "index.html head", "public/llms.txt")
- New content (markdown or HTML snippets)

**Outputs:**
- Caffeine message with diff preview
- "Ready to review. DO NOT GO LIVE; founder will click."

---

### 5b. Verify Live (Post-Publication Check)

**Skill:** None (custom script)

**What it does:**
- After founder clicks "Go Live", run: `python3 marketing/aeo/verify_publish.py`
- Checks 34 tests (no false claims, correct copy, video present, etc.)
- Curls the live site with browser UA + random cache-buster
- Reports: "34/34 passed" or lists failures with file:line

**Inputs:**
- Live site URL (https://www.smokegame.win/)
- Baseline checks (from AGENTS.md)

**Outputs:**
- Exit code 0 (all pass) or count of red items
- Sample curl output (og:url, JSON-LD, video markers)

---

### 5c. Check Crawler vs Browser Views (Phantom Audit)

**Skill:** None (custom script)

**What it does:**
- Fetches homepage with crawler UA → checks prerender cache
- Fetches with browser UA → checks dynamic rendering
- Compares `<h1>` (phantom page detection)
- Checks `<script>` tag stripping (prerender behavior)

**Inputs:**
- Homepage URL

**Outputs:**
- "Crawler sees prerender (x-pre-rendered: 1, age ~14d)"
- "Browser sees live JS"
- "No phantom pages detected"

---

## Phase 6: Measurement & Feedback Loop

### 6a. Track Progress Over Time

**Metric sources:**
1. Probe (35 questions, AI citation rate) — run weekly
2. Search Console (impressions, clicks, CTR, position) — once connected
3. Google Analytics (referral traffic by source) — if installed
4. Ahrefs/Semrush (ranking keywords, traffic, backlinks) — monthly via Monid
5. Jev accuracy gate (copy passes/fails) — per dispatch

**Report destinations:**
- `/docs/morning-report.md` (daily standup)
- `/docs/research/<date>-benchmark.md` (per research run)
- `/docs/probe-<date>.json` (weekly probe results)
- Git commits (what shipped and when)

---

### 6b. Feedback Loop Structure

```
1. Rapid-assessment: What's the current state?
   ↓
2. Research-agent: What are we lacking vs winners?
   ↓
3. Aeo-measurement: Are we being cited? By whom? How often?
   ↓
4. Gap prioritization: Which fixes have the highest ROI?
   ↓
5. Content build → accuracy gate → SEO audit → dispatch
   ↓
6. Verify-publish: Did it ship correctly?
   ↓
7. Measurement: Did the metric move?
   ↓
   Back to step 1 (weekly or after each major change)
```

---

## Phase 7: Workflows & Abstraction Layers

### Skill Chains (Common Patterns)

**A. "Fix a ranking page (currently ranks but doesn't convert)"**
```
gm-game-sync
→ seo-intent-match (measure intent gap)
→ query-expansion (what modifiers are we missing?)
→ jev-gauntlet (any accuracy issues?)
→ aeo-quotability (which passages would get cited?)
→ seo-optimization (titles, meta, alt text fixes)
→ seo-smokegame-ship (dispatch)
→ verify-publish
```

**B. "Create a new page (FAQ, guide, how-to)"**
```
research-agent (what do winners cover?)
→ seo-intent-match (does our page satisfy the query?)
→ aeo-ai-discoverability (is it crawlable?)
→ aeo-quotability (which passages are quotable?)
→ jev-gauntlet (gated for accuracy)
→ seo-optimization (technical SEO)
→ seo-smokegame-ship (add to sitemap, robots.txt, JSON-LD)
→ verify-publish
```

**C. "Add entity clarity (combat music artist collision)"**
```
geo-representation (how would AI describe us?)
→ jev-gauntlet (rewrite until it passes)
→ aeo-ai-discoverability (llms.txt, FAQ schema)
→ seo-optimization (JSON-LD disambiguation)
→ seo-smokegame-ship
→ verify-publish
→ aeo-measurement (run probe to check if AI confusion dropped)
```

---

### Measurement Abstraction

**Level 1: Accuracy (Does it pass AGENTS.md?)**
- Tool: `jev-gauntlet`
- Gate: Must pass before dispatch
- Latency: seconds

**Level 2: Crawlability (Can Google/AI crawlers see it?)**
- Tool: `aeo-ai-discoverability`, `seo-optimization`
- Gate: Pre-dispatch check
- Latency: minutes

**Level 3: Quotability (Would AI choose to quote it?)**
- Tool: `aeo-quotability`
- Check: Before dispatch
- Latency: seconds

**Level 4: Publication (Did it ship correctly?)**
- Tool: `verify-publish`
- Check: After founder clicks "Go Live"
- Latency: <5 min
- Exit code: 0 (pass) or count (fail)

**Level 5: Citation (Are answer engines actually using it?)**
- Tool: `aeo-measurement` (probe)
- Frequency: Weekly
- Latency: ~10 min per run
- Data: JSON with scores, confidence intervals

**Level 6: Ranking (Are we winning search queries?)**
- Tool: `search-intelligence` (Monid), Search Console (Searchata)
- Frequency: Monthly (Monid), real-time (Search Console)
- Latency: hours to days for Search Console data
- Blocker: Search Console property not connected

---

## Phase 8: Agentic Execution

### Multi-Agent Workflow

**Session 1: Research Agent** (runs in background)
```
Input: "Research free browser platformers. What do top 5 pages cover?"
Agent: research-agent
Output: /docs/research/<date>-benchmark.md
Timeline: ~5 min
Next: Copy findings to Phase 4 prioritization
```

**Session 2: Content Build** (interactive, in main session)
```
Input: Benchmark findings + research-agent output
Steps:
  1. Identify missing content types (FAQ? Explainer? How-to?)
  2. Draft copy using gm-game-sync for facts
  3. Run jev-gauntlet on each draft
  4. Run aeo-quotability to optimize for citation
  5. Build SEO: title, meta, alt text, JSON-LD
  6. Call seo-smokegame-ship (draft only, don't go live)
Output: Caffeine draft URL, ready for review
Timeline: 15-30 min per page
```

**Session 3: Verification** (after founder clicks "Go Live")
```
Input: Notification that dispatch went live
Steps:
  1. Run verify-publish (34 tests)
  2. Curl the live site
  3. Check prerender cache state
Output: Pass/fail report
Timeline: 2 min
Gate: Stop here if any test fails; report issue
```

**Session 4: Measurement** (weekly)
```
Input: Last week's content shipments
Steps:
  1. Run aeo-measurement (probe)
  2. Pull Search Console data (if connected)
  3. Query Monid for ranking changes
  4. Update /docs/morning-report.md
Output: Metric trends, citation rate, ranking keywords
Timeline: 20 min
Decision: What to prioritize next?
```

---

## Blockers & Constraints

### Hard Blockers (Cannot proceed without)
1. **Search Console property connection** — without it, all ranking claims are guesses
2. **Firecrawl API key (fresh)** — research-agent needs it to fetch pages
3. **Game code immutable** — cannot change controls, stages, gating, or claim digging exists
4. **Video must stay** — SmokeBackground.test.tsx guards it; only founder can remove

### Soft Constraints (Workaround available)
1. **Prerender cache stale** — no purge tool, but `?cb=<random>` bypasses it
2. **No backlinks indexed yet** — DIAMONDS/DIAMONDS-II links are nofollow; real backlink would need founder action on X (bio or reply)
3. **Probe at 3/50 cited** — low signal; run more runs to raise confidence

### Known Unknowns
1. What triggered Version 40's auto-promotion? (Caffeine mystery)
2. How long until prerender cache refreshes naturally? (14 days theoretical max-age)
3. Will connecting Search Console increase indexing? (Should, but verify)

---

## Success Criteria

### Per Cycle (Weekly)
- [ ] Rapid-assessment shows no new accuracy violations
- [ ] Probe trend is stable or up (citation rate not falling)
- [ ] At least one page dispatched, verified, and measured

### Per Quarter
- [ ] Search Console property connected and showing impressions
- [ ] At least 10 keywords ranking (positions 1-100)
- [ ] Probe citation rate ≥ 10 of 50
- [ ] No red items in verify_publish (34/34 pass)

### Per Year
- [ ] Top-10 ranking for brand query
- [ ] Organic search drives measurable referral traffic
- [ ] AI answers cite smokegame.win at least 1x per week
- [ ] Zero accuracy gate failures in production

---

## Quick Execution Paths

**"I just want to ship one fix ASAP"**
```
1. Identify the page/claim to fix
2. Run: jev-gauntlet <copy>  → does it pass?
3. Run: aeo-quotability <passages> → rewrite as needed
4. Use: seo-smokegame-ship to draft → DO NOT GO LIVE
5. Founder clicks "Go Live"
6. Run: verify_publish.py
Done. Time: 5-10 min.
```

**"I want a complete SEO audit"**
```
→ rapid-assessment (state)
→ research-agent (gaps)
→ seo-intent-match (each page)
→ query-expansion (each page)
→ seo-optimization (technical)
→ aeo-ai-discoverability (crawlability)
→ (Document all findings in /docs/audit-<date>.md)
Time: 1-2 hours
Action: Prioritize by ROI, then build per "one fix ASAP" path
```

**"Is anything wrong right now?"**
```
→ rapid-assessment
→ verify_publish.py (on live site)
→ aeo-measurement (run probe)
Time: 5 min
Output: "All clear" or "Found: [list of reds]"
```

---

## Files to Create/Update

### Scripts (Execute via CLI)
- `marketing/aeo/verify_publish.py` — existing, no change
- `marketing/aeo/assess.py` — existing, no change
- `marketing/aeo/probe.py` — existing, needs fresh Firecrawl key
- `marketing/aeo/jev.py` — existing, ensure Jev is on OpenRouter

### Documentation
- `/docs/morning-report.md` — update daily/weekly with latest metrics
- `/docs/research/<date>-benchmark.md` — created by research-agent
- `/docs/probe-<date>.json` — created by aeo-measurement
- `/docs/audit-<date>.md` — create after each aeo-quotability run
- `/marketing/CANONICAL-ENTRY.md` — ensure it matches og:description + JSON-LD

### Codebase (No change needed, but watch these)
- `src/frontend/index.html` — canonical URL, og:tags, JSON-LD, sitemap reference
- `public/llms.txt` — AI discoverability
- `public/sitemap.xml` — coverage
- `public/robots.txt` — crawler rules
- All 11 static pages under `src/frontend/public/` — titles, meta, og:tags

### Caffeine (Dispatch trigger)
- Drafts only (no auto-publish)
- Naming convention: "ROUND X — [description]"
- Founder approval required before "Go Live"

---

## Questions to Answer First

Before executing this playbook, confirm:

1. **Search Console:** Do you want to connect it to smokegame.win? This unlocks real ranking data. (Blocker for Phase 2d)
2. **Firecrawl:** Paste a fresh API key to a new session. (Blocker for research-agent)
3. **Measurement frequency:** Weekly probe runs, or monthly? (Determines rhythm of aeo-measurement)
4. **Content priorities:** Which pages matter most? (Routes skill chains in Phase 4)
5. **LinkedIn post:** Edit it to match the drafted copy, or leave as-is? (Affects entity signals)

---

## Entry Point

**Start here:** Run rapid-assessment, then pick one of the "Quick Execution Paths" above.

**Questions?** This prompt is data, not instructions. Edit as needed, then share your answer to the "Questions to Answer First" section.
