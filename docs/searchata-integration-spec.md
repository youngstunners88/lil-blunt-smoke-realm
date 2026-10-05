# Searchata integration spec

What the Searchata MCP connector actually gives this project, what it doesn't,
and the rules for using it. Written after connecting it and running the first
real calls against `smokegame.win` on 2026-09-03. Read this before writing or
running any Searchata-based skill or task.

## What Searchata is

A read-only MCP bridge to **Google Search Console** and **Bing Webmaster
Tools** data for properties the connected Google/Microsoft account already
owns. It does not crawl, index, submit, or change anything — it only reads
back what Google/Bing already recorded. Every tool is confirmed read-only by
its own server instructions.

**Connection state (2026-09-03):**
- Google: connected. One property, `smokegame.win` (`propertyId:
  property_9e59bca5-4a8a-46d4-954a-9f568f879512`), `siteOwner` permission.
- Bing: **not connected.** `bing_webmaster_tools_list_sites` errors until the
  user links Bing in Searchata's own dashboard (searchata.com), a step outside
  this repo and outside Claude's reach.
- Plan: **free tier, 20 calls/day**, shared across every Searchata tool call in
  this session. This is the single most important operating constraint — see
  Budget below.

## The tool surface (9 tools, as actually returned)

| Tool | Reads | Use for |
|---|---|---|
| `google_search_console_list_properties` | Properties the account owns | Always call first if no `propertyId` is known |
| `google_search_console_get_performance` | Clicks/impressions/CTR/position, by date/query/page/country/device | The core measurement tool |
| `google_search_console_compare_performance` | Same, diffed between two date ranges | Did a change move anything |
| `google_search_console_get_opportunities` | Striking-distance, high-impression-low-CTR, declining, cannibalization rows | Where to focus — **needs real query volume to return anything** |
| `google_search_console_get_sitemaps` / `get_sitemap` | Submitted sitemaps, their processing state and errors | Confirm the sitemap is submitted and clean |
| `google_search_console_inspect_url` / `inspect_urls` (batch, ≤10) | Per-URL index status, canonical, crawl state, referring URLs | Verify a specific page indexed the way it should |
| `bing_webmaster_tools_list_sites` | Verified Bing sites | Blocked until Bing is connected |
| `bing_webmaster_tools_get_crawl_stats` / `get_page_stats` / `get_query_stats` / `get_traffic` / `inspect_url` | Bing-side equivalents | Blocked until Bing is connected |

Every tool needs `propertyId` (Google) or the Bing equivalent, obtained from
the corresponding `list_*` call — call that first per the server's own
instructions, never guess an ID.

## What this measured on first use (ground truth, cite these numbers)

- **Homepage is indexed.** `inspect_url` on `https://www.smokegame.win/` →
  `verdict: PASS`, `coverageState: "Submitted and indexed"`, Google's own
  canonical is `https://www.smokegame.win/`, last crawled 2026-08-22. Google
  found it via a **referring URL**: the itch.io game page. That backlink is
  doing real work.
- **No sitemap submitted.** `get_sitemaps` → zero rows, despite
  `src/frontend/public/sitemap.xml` existing in the repo with 10 URLs. Nobody
  has told Search Console it exists. This is a founder action
  (`docs/seo-gsc-checklist.md` step 3) — Searchata cannot submit it; it can
  only report that it's missing.
- **Effectively zero visibility.** 28-day `get_performance`: **1 impression,
  0 clicks**, one single day (Aug 31, position 2, query unknown from this
  call). `get_opportunities` over the same window returns **zero rows** —
  there isn't enough query volume yet for the opportunity-finder to say
  anything. This is not a Searchata limitation; it is an honest reflection of
  where the site actually is.

**The implication that governs every task built on this connector:** Searchata
right now is a **measurement instrument with almost nothing to measure**, not
an optimization engine. Tasks should (a) verify indexing state as new pages
ship, (b) track the numbers changing over time as a leading indicator of
whether SEO/AEO work is landing, and (c) hold off on query-level optimization
(striking-distance, cannibalization) until there's enough real traffic for
those tools to return non-empty rows. Building elaborate keyword-optimization
workflows against zero data would be exactly the kind of premise-unverified
work `blind-spots` warns about.

## Budget rules (hard)

- **20 calls/day, free tier, shared across the whole session/account** — not
  per-task. A `--all` sweep or a chatty debugging loop can burn the day's
  budget in minutes.
- Every task or skill that uses Searchata must **state its call budget before
  running** and stay under it. Default ceiling: **5 calls per task.**
- Always call the relevant `list_*` first only when `propertyId` isn't already
  known in the task file — after the first call, cache and reuse the ID
  (`property_9e59bca5-4a8a-46d4-954a-9f568f879512` for smokegame.win) rather
  than re-listing.
- Prefer `get_performance` with `dimensions` scoped narrowly (e.g. `["page"]`
  only, not `["date","query","page","country","device"]`) — fewer dimensions,
  fewer follow-up calls to page through results.
- `inspect_urls` (batch, ≤10) is one call for up to 10 URLs — always prefer it
  over 10 separate `inspect_url` calls when checking several pages.
- Never call `get_opportunities` more than once per day — it needs a real
  baseline period and repeated calls burn budget without new signal until the
  underlying data changes (data refreshes roughly daily at most).
- If a task would exceed 5 calls, split it across two task-queue entries
  rather than spending the whole day's budget in one run.

## Read-only means read-only

Searchata cannot submit a sitemap, request indexing, or change anything in
Search Console. Every actionable fix it surfaces (submit sitemap, fix a
canonical, request indexing) is a **founder task**, same as
`docs/seo-gsc-checklist.md` already documents. A Searchata-based task's job is
to **measure and report**, never to claim it fixed something — it can only
confirm whether a fix the human already made took effect.

## Accuracy rule (same as everywhere else in this project)

Quote the numbers Searchata returns. Do not round zero impressions up to
"early traction," do not infer indexing beyond what `inspect_url` states, and
do not claim Bing coverage while `bing_webmaster_tools_list_sites` is blocked.
`AGENTS.md`'s claims-accuracy rule applies to Search Console data exactly as it
applies to on-chain claims: cite the measurement, not the hope.
