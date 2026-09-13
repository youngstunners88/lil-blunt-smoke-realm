# Caffeine dispatch #1 — corrected head + CrawlConsole tracker

One dispatch, one "Go live" click, two outcomes: the homepage `<head>` becomes
accuracy-clean and canonical-correct, and the site starts reporting **verified
AI-crawler traffic** for the first time.

**Status: ready to dispatch. Not yet sent.** Committing this file changes
nothing in production — Caffeine builds from its own copy and ships only on a
manual "Go live" click.

---

## Why these two together

They are unrelated changes that share a bottleneck. Every Caffeine dispatch
costs the same manual click, and that click has been the project's top blocker
for weeks. Bundling means one click buys both.

The tracker is the higher-value half. `docs/crawlconsole-integration.md`
records that all CrawlConsole telemetry is `pending` — so
`get_crawler_analytics` returns nothing, and **every AEO decision this project
has made has been unverifiable**: `llms.txt`, the AI-crawler allowlist in
`robots.txt`, the `/faq/` pages. Once the tracker is live we can see whether
GPTBot, ClaudeBot, OAI-SearchBot and PerplexityBot actually fetch the site,
from request logs rather than inference.

---

## Part A — the tracker script

Add to the site's `<head>` (or immediately before `</body>`; it is deferred
either way):

```html
<script
  src="https://analytics.crawlconsole.com/tracker.js"
  data-project-key="cc_8bef21d8a5ed46279848dd84"
  defer></script>
```

**Verified, not guessed:** this attribute pattern was read off CrawlConsole's
own documentation site, which self-instruments with
`<script src="https://analytics.crawlconsole.com/tracker.js"
data-project-key="cc_…" strategy="afterInteractive">`. The value above is
**this project's own project key**, returned as `projectKey` by
`list_properties` for property `76a3f462-e5ac-4e33-856c-3a4bece7dd39`.

**One thing to confirm before dispatch.** CrawlConsole issues several `cc_`
credentials (see `docs/crawlconsole-integration.md`) and the site tracker key
in the environment has the distinct `cc_stk_…` format. The pattern on
CrawlConsole's own site uses the **project-key** format, which is what is used
above. If the dashboard's install panel shows the `cc_stk_…` value instead,
use that — swap only the attribute value, nothing else. Given how much time
the three-credential confusion already cost, **check the install panel once**
rather than assuming.

Optional, only if WebMCP is wanted later — leave it out of this dispatch:

```html
<script src="https://analytics.crawlconsole.com/webmcp.js"
  data-project-key="cc_8bef21d8a5ed46279848dd84" defer></script>
```

### Privacy note
This adds a third-party analytics script to the site. `/privacy/` currently
describes a site that sets no analytics cookies. **If this ships, `/privacy/`
must be updated in the same dispatch** to disclose CrawlConsole as a
processor. Do not ship Part A without that edit — the project's accuracy rule
applies to its own privacy page as much as to its on-chain claims.

---

## Part B — the corrected `<head>`

Use the block in **`docs/seo-head-package.md`** verbatim. It is masterplan
§1.2 with its three accuracy violations removed:

- no "on-chain proof-of-play" (scores are not on-chain; nothing is minted)
- no `Organization` author with a URL (decentralised, no company)
- no `aggregateRating` (no real reviews)

Canonical is on `https://www.smokegame.win/`, matching the static pages in
this repo.

### The constraint that makes this only half a fix

`docs/seo-audit-baseline.md` records that the live host **serves different
documents to crawlers and browsers** — 128 KB to Googlebot, 5.8 KB to Chrome,
disagreeing on title and canonical. This dispatch edits the source that
produces the **browser** variant.

So after Go-live, do not assume the crawler variant changed. **Re-measure**:

```sh
python3 marketing/aeo/crawl_gate.py
```

If the crawler variant still shows 0/5 claims and no canonical, the head fix
did not reach the variant that search engines actually read, and that is a
separate problem to raise with Caffeine — not something to declare fixed.

---

## Dispatch message (paste into Caffeine chat)

```
Two changes to the site.

1. Add this script tag to the site <head>, exactly as written:

<script src="https://analytics.crawlconsole.com/tracker.js" data-project-key="cc_8bef21d8a5ed46279848dd84" defer></script>

2. Update the /privacy/ page to disclose that the site uses CrawlConsole
   analytics to measure AI crawler and referral traffic, listing CrawlConsole
   as a data processor. Keep the existing decentralised framing and do not add
   any company name, postal address, or contact details.

3. Replace the homepage <head> metadata with the block below. Do not add any
   claim that is not in it — in particular do not add on-chain proof-of-play,
   an Organization author, or an aggregateRating.

[paste the full head block from docs/seo-head-package.md here]
```

---

## After "Go live" — verification, in order

1. `python3 marketing/aeo/crawl_gate.py` — did the head reach the **crawler**
   variant, or only the browser one? Record both.
2. `curl -s https://www.smokegame.win/ | grep -c "analytics.crawlconsole.com"`
   — is the tracker actually in the served HTML?
3. Wait for real crawler traffic, then CrawlConsole
   `get_property_telemetry_status` → `crawler.status` should move off
   `pending`. It will not flip instantly; give it a day of real traffic.
4. Once it is live, `get_crawler_analytics` answers the question this project
   has never been able to answer: **do AI crawlers actually fetch this site?**
5. Append all of it to `docs/morning-report.md` with the measured numbers.

Do not report any of this as done until step 1 and 2 return evidence.
Committing is not shipping; dispatching is not going live.
