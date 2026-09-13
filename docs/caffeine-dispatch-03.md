# Caffeine dispatch #3 — tracker, privacy, phantom pages, schema fixes

**Status: repo-ready. Not yet dispatched.**

This dispatch has four parts. Parts A and B are a third attempt at items that
failed in dispatches #1 and #2 — the CrawlConsole tracker and the privacy
page disclosure. They failed silently both times; the dispatch message below is
more explicit about *where* and *what* to change. Parts C and D are new.

---

## Why the tracker keeps failing

Both previous dispatches used loose language ("add this to the site head"). The
likely failure mode: Caffeine's composer adds the tag to a template or layout
that the ICP canister does not serve as HTML — or it lands somewhere a crawler
UA doesn't fetch. The verification step (curl against the live URL) still shows
0 references. **This dispatch names the exact file and exact insertion point.**

---

## Part A — CrawlConsole tracker script (third attempt)

**File:** the homepage HTML file (the one that produces `https://www.smokegame.win/`).

**Where:** inside the `<head>` element, after the existing `<link rel="icon">` tag.

**Add exactly this, nothing else:**

```html
<script
  src="https://analytics.crawlconsole.com/tracker.js"
  data-project-key="cc_8bef21d8a5ed46279848dd84"
  defer
></script>
```

Do not change any attribute. Do not move it to `<body>`. Do not add any wrapper.

**Verification:** After "Go live," run:

```
curl -s https://www.smokegame.win/ | grep crawlconsole
```

It must return the script tag. If it returns nothing, the tag did not land in
the served HTML — stop and raise with Caffeine, do not declare it done.

---

## Part B — privacy page disclosure

**File:** the page that serves `https://www.smokegame.win/privacy/`.

**Add one new section** to the existing privacy page. Insert it after the last
existing paragraph and before the closing content (footer or end of page):

```
Analytics

This site uses CrawlConsole to measure how AI crawlers (such as Googlebot,
GPTBot, and ClaudeBot) access and index the site. CrawlConsole receives the
pages those crawlers request, the user-agent strings they send, and the timing
of their visits. It does not collect personal data about human visitors and
does not set cookies. No personally identifiable information is sent to
CrawlConsole.

CrawlConsole is operated by Crawl Console Inc. Its privacy policy is at
https://crawlconsole.com/privacy.
```

Do not add any company name, postal address, or contact details for this
project. Do not change the existing sections; add only.

**Verification:**

```
curl -s https://www.smokegame.win/privacy/ | grep -i crawlconsole
```

Must return the disclosure text.

---

## Part C — two phantom sitemap URLs: ship the real pages

The production sitemap advertises `/accessibility/` and `/troubleshooting/`
but both currently serve the homepage (soft-404 / duplicate-content signal).
Both pages exist fully in the repo and just need to be shipped.

**Ship these two files to Caffeine** (content is already in the repo and does
not need editing):

- `src/frontend/public/accessibility/index.html` → serves `/accessibility/`
- `src/frontend/public/troubleshooting/index.html` → serves `/troubleshooting/`

**Verification** for each (substitute your own meaningful phrase from the page):

```
# Accessibility page — look for a phrase only that page contains
curl -s https://www.smokegame.win/accessibility/ | grep "ContentOverlay"

# Troubleshooting page — look for a phrase only that page contains
curl -s https://www.smokegame.win/troubleshooting/ | grep "black screen"
```

Both must return content. If either returns nothing, the page is still serving
the homepage fallback.

---

## Part D — homepage JSON-LD corrections

Two fixes to the structured data block in the homepage `<head>`. Both are in
`src/frontend/index.html` (already committed — Caffeine just needs to sync).

**Fix 1 — remove on-chain claim from VideoGame description.**

The current live description field (inside the `<script type="application/ld+json">`
block on the homepage) says:

```
"description": "A Wild West Web3 2D platformer. Dig through the Dustrock Mines,
dodge the carts and the Tax Man, and chase a high score signed on the Internet
Computer.",
```

Replace with:

```
"description": "A Wild West 2D platformer. Dig through the Dustrock Mines,
dodge the carts and the Tax Man, and chase a high score. Free to play in the
browser, no wallet and no download.",
```

("signed on the Internet Computer" is inaccurate — scores are not written
on-chain. The site is *served* from the Internet Computer, which is already
stated in the page body.)

**Fix 2 — correct `applicationCategory`.**

Change:

```
"applicationCategory": "Game",
```

To:

```
"applicationCategory": "GameApplication",
```

(`"Game"` is not a valid schema.org value for this property; `"GameApplication"`
is the correct term.)

**Verification:**

```
curl -s https://www.smokegame.win/ | grep -A2 "applicationCategory"
```

Must return `"GameApplication"`.

---

## Dispatch message — paste into Caffeine chat

```
Four changes to the site. Please confirm each one is live after the build.

CHANGE 1 — Add this script tag to the homepage <head> (after the favicon link):

<script
  src="https://analytics.crawlconsole.com/tracker.js"
  data-project-key="cc_8bef21d8a5ed46279848dd84"
  defer
></script>

CHANGE 2 — Add this section to /privacy/ (at the end of the page content,
before any footer):

Analytics

This site uses CrawlConsole to measure how AI crawlers (such as Googlebot,
GPTBot, and ClaudeBot) access and index the site. CrawlConsole receives the
pages those crawlers request, the user-agent strings they send, and the timing
of their visits. It does not collect personal data about human visitors and
does not set cookies. No personally identifiable information is sent to
CrawlConsole.

CrawlConsole is operated by Crawl Console Inc. Its privacy policy is at
https://crawlconsole.com/privacy.

CHANGE 3 — Ship two static pages (files exist in the repo; they just need to
appear at their URLs):
- /accessibility/ → src/frontend/public/accessibility/index.html
- /troubleshooting/ → src/frontend/public/troubleshooting/index.html

CHANGE 4 — In the homepage JSON-LD (<script type="application/ld+json">):
a) In the VideoGame description, remove "signed on the Internet Computer."
   New description: "A Wild West 2D platformer. Dig through the Dustrock Mines,
   dodge the carts and the Tax Man, and chase a high score. Free to play in the
   browser, no wallet and no download."
b) Change "applicationCategory": "Game" to "applicationCategory": "GameApplication"
```

---

## After "Go live" — verification checklist

Run each line. Record the result in `docs/morning-report.md`.

```sh
# Tracker
curl -s https://www.smokegame.win/ | grep -c crawlconsole
# Expected: 1 (or more). Fail: 0

# Privacy disclosure
curl -s https://www.smokegame.win/privacy/ | grep -i crawlconsole
# Expected: the disclosure text. Fail: empty

# Accessibility page content
curl -s https://www.smokegame.win/accessibility/ | grep -i "ContentOverlay"
# Expected: a match. Fail: empty (still serving homepage)

# Troubleshooting page content
curl -s https://www.smokegame.win/troubleshooting/ | grep -i "black screen"
# Expected: a match. Fail: empty (still serving homepage)

# JSON-LD schema
curl -s https://www.smokegame.win/ | grep "applicationCategory"
# Expected: "GameApplication". Fail: "Game" or absent

# On-chain claim removed
curl -s https://www.smokegame.win/ | grep "signed on the Internet Computer"
# Expected: empty. Fail: still present
```

Do not report any change as done until its verification command confirms it.
Caffeine's own build-success message is not evidence — dispatches #1 and #2
both reported build success while changes did not land.
