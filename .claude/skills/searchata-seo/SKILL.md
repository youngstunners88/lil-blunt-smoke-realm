---
name: searchata-seo
description: Use real Google Search Console (and, once connected, Bing) data via the Searchata MCP connector to verify indexing, measure whether SEO/AEO work is landing, and find real optimization opportunities once there is enough query volume. Use when asked to check indexing status, pull real search performance numbers, verify a sitemap, or decide what to optimize based on actual data rather than guesses. Not for submitting sitemaps, requesting indexing, or any write action — Searchata is read-only.
---

# Searchata SEO measurement

Executes against `docs/searchata-integration-spec.md` — **read that first**,
it has the full tool table, the connection state, and the hard budget rules.
This skill is the workflow; the spec is the reference.

## The one fact that governs everything here

As of first connection (2026-09-03), `smokegame.win` has **1 impression, 0
clicks over 28 days**, and `get_opportunities` returns zero rows. There is
almost no data yet. **Searchata today is a measurement instrument, not an
optimization engine.** Don't build query-optimization workflows against data
that doesn't exist — verify indexing and track the trend instead. Re-check
`get_opportunities` monthly; the moment it returns real rows, that's the
signal to start using it for its intended purpose.

## Hard rules

- **Read-only.** Never claim to have submitted a sitemap, requested indexing,
  or fixed anything through this connector — it cannot do any of that. Report
  what's true; the fix is always a founder action.
- **20 calls/day, free tier, shared across everything.** Default ceiling per
  task: **5 calls.** State the budget before running. See the spec's Budget
  section for the specific discipline (cache `propertyId`, batch
  `inspect_urls`, narrow `dimensions`, never re-call `get_opportunities` same-day).
- **Cite numbers, never round up.** Zero impressions is zero impressions, not
  "early traction." This is the same accuracy discipline `AGENTS.md` requires
  everywhere else in this project.

## Workflow

### W1 — Property check (once, cache the result)
`google_search_console_list_properties` → confirm `smokegame.win`'s
`propertyId` (currently `property_9e59bca5-4a8a-46d4-954a-9f568f879512`).
Re-list only if this ID ever fails or the account's properties might have
changed — don't call it every task.

### W2 — Verify a shipped page indexed
After any AEO/content page ships to production (post Caffeine "Go live"), use
`google_search_console_inspect_urls` (batch, ≤10 URLs, 1 call) to check
indexing state for every new page at once. Report `coverageState` and
`googleCanonical` for each — don't infer indexing from the sitemap alone.

### W3 — Sitemap health
`google_search_console_get_sitemaps` — confirm whether `sitemap.xml` is
submitted and, if so, its processing state and any errors. If it's still
empty (as of 2026-09-03 it is), that's a founder action from
`docs/seo-gsc-checklist.md` step 3, not something to fix here.

### W4 — Trend check
`google_search_console_get_performance` with `dimensions: ["date"]` over the
last 28 days (1 call) — is the impression/click count moving at all versus the
last recorded baseline in `docs/morning-report.md`? Record the number, don't
editorialize it.

### W5 — Opportunities (monthly, not more)
`google_search_console_get_opportunities` once, only when W4 shows enough
volume to make it plausible non-empty (rule of thumb: consistent double-digit
weekly impressions). Until then this call is a budget-visible no-op — use it
sparingly to confirm the floor, not repeatedly.

## When this hands off

| Situation | Go to |
|---|---|
| Deciding what content to write next | `search-ranking-strategy`, `aeo-ai-discoverability` |
| The head/sitemap/robots state itself, and whether Caffeine is live | `seo-smokegame-ship` |
| Non-Search-Console keyword/competitor research | `search-intelligence` (Monid/Ahrefs) |
| Actually submitting the sitemap or verifying the property | `docs/seo-gsc-checklist.md` — founder action, not this skill |
| Bing data | Blocked until the user connects Bing in Searchata's own dashboard; nothing to do here until then |
