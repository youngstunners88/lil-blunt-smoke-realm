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

## Part C — FIVE phantom sitemap URLs (corrected 2026-09-22)

**The earlier count of two was wrong in both directions.** It was produced by
grepping each page for a topic keyword — but the homepage is a long SPA page
that already contains "burst dash", "no wallet" and "music artist", so those
greps matched the homepage being served in place of the FAQ pages and passed
three phantoms as healthy. It also called `/troubleshooting/` a phantom when it
is real.

Re-measured with `marketing/aeo/assess.py`, which compares each page's `<h1>`
to the homepage's — a phantom IS the homepage, so it cannot carry another
page's heading.

**Actually phantom — serving the homepage today:**

```
/faq/controls/         /faq/wallet/      /faq/not-the-artist/
/terms/                /accessibility/
```

**Actually fine — do not touch:** `/`, `/about/`, `/docs/`, `/how-to-play/`,
`/privacy/`, `/troubleshooting/`.

All five files exist in the repo and need shipping:

```
src/frontend/public/faq/controls/index.html
src/frontend/public/faq/wallet/index.html
src/frontend/public/faq/not-the-artist/index.html
src/frontend/public/terms/index.html
src/frontend/public/accessibility/index.html
```

This is the single biggest finding of the week: **three FAQ pages written for
AEO, plus the Terms and Accessibility pages, have never existed on production.**
Every sitemap entry for them is a soft-404.

**Verification** — compare each page's h1 to the homepage's:

```sh
H=$(curl -s https://www.smokegame.win/ | grep -o '<h1[^>]*>[^<]*</h1>' | head -1)
for p in faq/controls faq/wallet faq/not-the-artist terms accessibility; do
  X=$(curl -s https://www.smokegame.win/$p/ | grep -o '<h1[^>]*>[^<]*</h1>' | head -1)
  [ "$X" = "$H" ] && echo "FAIL $p still phantom" || echo "ok   $p"
done
```

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

## Part E — canonical list entry on seven pages

One identical paragraph, already in the repo on seven pages. It is the block a
journalist, directory or AI assistant pastes verbatim as this game's
description. See `marketing/CANONICAL-ENTRY.md` for why it is identical
everywhere rather than reworded per page.

**Ship these seven files as they now stand in the repo:**

```
src/frontend/public/about/index.html
src/frontend/public/how-to-play/index.html
src/frontend/public/docs/index.html
src/frontend/public/troubleshooting/index.html
src/frontend/public/faq/controls/index.html
src/frontend/public/faq/wallet/index.html
src/frontend/public/faq/not-the-artist/index.html
```

Each gained a `<div class="entry">` block high on the page, plus the `.entry`
CSS rule in its `<style>`. `/about/` additionally had its opening `<p
class="lede">` replaced — the entry says the same thing better, and the one
fact the old lede carried that the entry does not (the site being served from
ICP) is preserved in the new shorter lede.

**Verification:**

```
curl -s https://www.smokegame.win/about/ | grep -c "arcade score-chaser"
# Expected: 1 or more on each of the seven URLs. Fail: 0
```

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

CHANGE 3 — FIVE URLs currently serve the homepage instead of their own page.
The files all exist in the repo; they need to appear at their URLs:
- /faq/controls/       → src/frontend/public/faq/controls/index.html
- /faq/wallet/         → src/frontend/public/faq/wallet/index.html
- /faq/not-the-artist/ → src/frontend/public/faq/not-the-artist/index.html
- /terms/              → src/frontend/public/terms/index.html
- /accessibility/      → src/frontend/public/accessibility/index.html
(/troubleshooting/ is fine — do not change it.)

CHANGE 4 — In the homepage JSON-LD (<script type="application/ld+json">):
a) In the VideoGame description, remove "signed on the Internet Computer."
   New description: "A Wild West 2D platformer. Dig through the Dustrock Mines,
   dodge the carts and the Tax Man, and chase a high score. Free to play in the
   browser, no wallet and no download."
b) Change "applicationCategory": "Game" to "applicationCategory": "GameApplication"

CHANGE 5 — Sync these seven static pages from the repo exactly as they are:
  /about/            /how-to-play/    /docs/    /troubleshooting/
  /faq/controls/     /faq/wallet/     /faq/not-the-artist/

Each now contains a bordered box near the top of the page, like this, with
identical text on all seven. Do not reword it on any page — it is deliberately
the same everywhere:

<div class="entry">
  <span class="entry-label">What this game is</span>
  <p>Lil Blunt: The Smoke Realm is a free 2D side-scrolling platformer and arcade score-chaser playable in a desktop web browser. Built in Godot 4 and exported to HTML5, the video game casts the player as a green outlaw prospector working the Wild West Dustrock Mines, chasing a high score while dodging mine carts and the Tax Man. No download, no account and no crypto wallet, with nothing to buy.</p>
</div>

Each page's <style> block also needs:

.entry { border: 1px solid #1c9c6b; border-left-width: 3px; border-radius: 6px;
         padding: 1rem 1.15rem; margin: 1.75rem 0; background: #0e1526; }
.entry p { margin: 0; color: #dfe4ee; }
.entry .entry-label { display: block; font-size: .75rem; letter-spacing: .08em;
         text-transform: uppercase; color: #7dd3a0; margin-bottom: .5rem; }

On /about/ ONLY, also replace the opening lede paragraph with:
  "The whole site, including the game itself, is served from the Internet
   Computer blockchain rather than a conventional web host."
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

# Canonical entry on all seven pages
for p in about how-to-play docs troubleshooting faq/controls faq/wallet faq/not-the-artist; do
  printf "%-22s %s\n" "$p" "$(curl -s https://www.smokegame.win/$p/ | grep -c 'arcade score-chaser')"
done
# Expected: 1 or more on every row. Fail: any 0
```

Do not report any change as done until its verification command confirms it.
Caffeine's own build-success message is not evidence — dispatches #1 and #2
both reported build success while changes did not land.
