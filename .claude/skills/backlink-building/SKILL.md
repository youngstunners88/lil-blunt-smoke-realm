---
name: backlink-building
description: Earn links to smokegame.win — what to chase given that ranking pays almost nothing here, how to find prospects with the Ahrefs data we already have, and why the standard authority-first playbook is the wrong scoring function for this project. Use when asked about backlinks, link building, outreach, guest posts, domain authority, or getting other sites to link here.
---

# Backlinks

## The reframe — read before adopting any standard playbook

Conventional link building optimises for **ranking**. Here that is optimising a
prize we measured and found nearly empty: the best category term available is
70 searches/month, and most are literally zero (`LESSONS.md`,
`search-intelligence`). Ranking first for the best available term is roughly
**20 visits a month**.

So Domain Authority is the wrong scoring function for this project. A DR-70
page nobody reads is worth less than a DR-20 blog whose readers actually click
through to play.

**Links are still worth pursuing, for two other reasons:**

1. **Referral traffic.** A link on a page real people read sends real players.
   This is the main one, and it is measurable — PostHog records the referrer.
2. **Grounding and citation.** Answer engines retrieve pages and quote them. A
   mention on a page that gets retrieved puts the game in the consideration set
   — and that channel needs no search volume at all (`aeo-measurement`).

Score a prospect by **"would a person on this page click through and play?"**
not by authority. That single change reorders the whole target list.

## Current state — measured 2026-08-29

`python3 marketing/aeo/market.py refdomains`

Eight referring domains, **every one SEO spam**: `toprankauthority.shop`,
`backlinkshop.site`, `rankseohub.shop`, `seonix.agency`, `grow-fast.website`,
`seodaro.com`, `seolinkexpress.shop`,
`itxoft-reliable-seo-services.site`. All `dofollow_links: 0`, all first seen
23–27 Aug 2026.

This is the routine spray new domains get from firms hoping the owner notices
and buys their service. **It is noise, not damage.** The links are nofollow so
they pass nothing, and Google ignores the pattern rather than penalising it.

- **Do not disavow.** Unnecessary, and the disavow tool is easy to misuse.
- **Do not buy from any of them.** That is the entire point of the spray.
- **Treat the profile as zero**, because functionally it is.

## Tooling — use what we already pay for

The circulated five-tool stack (Moz free tier, Hunter.io, Screaming Frog,
OpenOutreach, GSC link API) has a problem: **none of it is available here.**
Zero of those credentials are in the environment and none of the tools are
installed. Two further issues worth knowing before anyone signs up:

- **Moz's free tier is 50 rows/month.** Ahrefs via Monid costs $0.018/row with
  no monthly cap, so 50 rows is $0.90 and we already have the account. Signing
  up for Moz adds a credential to manage for strictly less data.
- **Google Search Console has no backlink API.** The `webmasters/v3` endpoint
  in that plan (`links:sampleList`) does not exist. Link data in GSC is
  UI-only, exportable by hand. Any script built on that call fails.

What actually works today:

```bash
python3 marketing/aeo/market.py refdomains                       # our own profile
python3 marketing/aeo/market.py refdomains --target rival.com --limit 20
```

Run against a site whose audience overlaps ours, that list is the prospect
list: those domains already link to something like us.

## Where the links will actually come from

Ordered by likelihood of producing a real click, not by authority:

1. **itch.io itself.** Already indexed, already carries a link, and its
   audience is people looking for browser games. Fixing the store page
   (`itch-page`) does more than any outreach campaign. The cover image alone
   outranks a month of emails.
2. **Browser-game portals and directories.** Their whole purpose is listing
   games like this. Submission is a form, not a pitch.
3. **Communities where the game is on-topic** — r/WebGames, r/playmygame,
   Godot and ICP channels. See `game-distribution`, which scopes these for
   players rather than for citation.
4. **A technical devlog.** "Exporting Godot 4 to HTML5 on the Internet
   Computer" is a genuinely uncommon post with a real audience of developers,
   and it earns links from people who write about the same stack.
5. **Cold outreach to gaming blogs.** Last, deliberately.

## On cold outreach — the timing objection

The circulated plan opens with finding 50 blogs and pitching them. That is
premature and it spends a non-renewable asset.

You get **one** first impression per publication. Right now a reviewer who
clicks through finds an itch page with no cover image and no description, and a
site that is not indexed. The pitch fails, and that publication is now a harder
sell forever.

Fix the destination first. The order is: itch page → indexation → portals and
communities → devlog → cold outreach. By the time outreach happens there is
something worth linking to, and the same email converts far better.

If and when outreach does happen: never spend email-finding credits without
asking, personalise per prospect (a template mail-merge reads as spam and gets
the domain filtered), and never claim a link was acquired without fetching the
page and confirming it is there.

## What not to do

- **Do not buy links.** Beyond the policy violation, at this budget the money
  buys links on exactly the kind of domain already spamming us.
- **Do not chase DA.** Wrong scoring function here, as above.
- **Do not run broken-link building yet.** It is a real technique, but it needs
  a page worth substituting in. We have one page worth linking to; that is not
  a campaign.
- **Do not report a link as earned without verifying it.** Fetch the page and
  confirm the anchor exists.

## Real backlink baseline — 2026-09-04, via CrawlConsole

`domain_authority(smokegame.win)` and `referring_domains(smokegame.win)` both
return **empty** — `found: false`, zero rows. `smokegame.win` does not appear
in Common Crawl's web graph at all (`docs/crawlconsole-integration.md`). This
does not contradict the eight spam domains Ahrefs found above; different
crawlers, different snapshots. Read together: the profile is **effectively
zero either way** — a handful of nofollow spam plus one known, uncrawled link
from the itch.io page. Every prospecting task here is starting from nothing,
not improving something weak.

## Prospecting method — adapted from OpenSEO (MIT), not the paid service

`every-app/open-seo` (github.com/every-app/open-seo, MIT license) is a paid
SEO SaaS ($10/mo hosted, or self-host + your own DataForSEO key) whose data
tools duplicate what this project already has connected — CrawlConsole covers
its backlink/competitor-gap tools, Monid/Ahrefs covers its keyword tools,
Searchata covers its GSC tools. **Do not sign up for it**; there is no
incremental data it would add here. What is worth taking is free: its
`link-prospecting` skill's query-pattern and contact-discovery methodology,
which this project didn't have. Adapted below to use tools we actually have
(web search/fetch, `CrawlConsole`) instead of its paid `get_serp_results` /
`get_backlinks_overview`.

**Prospecting query patterns** — build these from the linkable asset (a devlog
post, the itch page, a specific claim), not from the brand name:

- `<topic> resources`
- `best <category> tools` / `best <category> games`
- `<competitor-or-similar-game> alternatives`
- `<topic> statistics`
- `<topic> guide`
- `<topic> examples`
- `free browser games <year>`

Run these as web searches, batched, before touching outreach. Filter for
**editorial pages that would actually list a free browser platformer**:
resource pages, "best free games" roundups, directories, curated lists — not
generic news sites.

**Contact discovery**, once a prospect page is real: look for an author byline
page, a contact or "submit a game" page, an about/team page, or a public email
in the page HTML — and for a directory, its actual submission form (see
`itch-page` and `game-distribution` for the two that already have submission
flows). **Only record a contact detail that was actually found on the page**,
with the source URL. Never invent or guess an email.

**Verify against CrawlConsole before trusting a competitor comparison.**
`competitor_link_gap` (source domains linking to a named competitor but not to
smokegame.win) is the free equivalent of OpenSEO's paid competitor-gap tool —
use it once a real competitor set exists, not speculatively.

Note on OpenSEO's other eight skills (`seo-audit`, `competitive-landscape`,
`competitor-analysis`, `keyword-clustering`, `seo-coach`,
`seo-project-setup`, `local-seo`, plus the paid MCP tools throughout): all are
sized for a market with real competitors and real search volume. This
project's own measurement is the opposite — best available term ~70
searches/month, most at zero (`search-ranking-strategy`, `LESSONS.md`). Porting
market-level competitive-analysis machinery here would be building tooling for
a market that doesn't exist. `link-prospecting` was the one skill that
transferred; the rest were read and deliberately left out.

### Full prospecting workflow (adapted from OpenSEO's link-prospecting)

1. **State the linkable asset first, out loud.** Not "get backlinks" — name
   the actual thing worth citing: a devlog post
   (`marketing/devlog/godot-html5-on-icp.md`, or the queued gzip-gate one), the
   itch page once its copy pack ships, or a specific verifiable claim (the
   whole front end served from an ICP canister — genuinely unusual, see
   `/about/`). A prospect email with no real asset behind it is spam regardless
   of personalization.
2. **Build 5-10 queries** from the patterns above, scoped to that asset.
3. **Run them as web searches**, in one batch.
4. **Filter hard.** Keep: resource/roundup pages, directories, curated lists,
   comparison pages, statistics/guide pages that could cite the game or the
   ICP-hosting angle. Drop: homepages, login pages, thin affiliate pages,
   unrelated forums, and — per the reframe above — anything that wouldn't send
   a person who'd actually click through and play.
5. **Assign each surviving prospect an outreach angle** (below) — never send
   generic "please link to us."
6. **Contact-discover only the strongest prospects**, per the rules above.
   Never bulk-guess emails across the whole list.
7. **Draft outreach per prospect**, personalized to the page, not a
   mail-merge template with the name swapped.

### Output format — use this table when reporting prospects

| Prospect URL | Domain | Found via | Relevance | Angle | Contact path | Priority |
|---|---|---|---|---|---|---|

Lead the report with: the best outreach angle found, the single
highest-priority prospect, and any real limitation in the search (not enough
relevant pages found, no contact path discoverable, etc.) — stated plainly,
not papered over.

### Outreach angles, with real drafts in the game's actual voice

Pick the angle that's true for the specific prospect; never send the same
draft to two different prospect types.

**1. Resource/list inclusion** — for a "best free browser games" roundup:
> Hey — noticed [page title] and thought Lil Blunt: The Smoke Realm might fit.
> It's a free 2D Wild West platformer, runs straight in the browser with no
> download, no wallet, no account — click and play. The whole site is
> actually served from the Internet Computer, which is the unusual bit if
> that's relevant to your readers. Here's the link if useful:
> https://youngstunners88.itch.io/lil-blunt-adventure — no worries either way,
> just thought it was a fit.

**2. Devlog / technical reference** — for a Godot or ICP-hosting audience:
> Hi — I wrote up two specific traps from shipping a Godot 4.3 HTML5 export on
> the Internet Computer (a threaded-export setting that silently fails to
> boot inside an iframe, and why ICP asset canisters break Range-request
> audio). Thought it might be useful if you cover [their topic]:
> [devlog URL]. Real numbers, no pitch — happy to answer anything about the
> setup.

**3. Comparison/alternative inclusion** — only where the comparison is
honest (see the reframe: never claim ranking or reward mechanics the game
doesn't have):
> Following up because [page] compares [category] — Lil Blunt: The Smoke
> Realm is a free, no-wallet browser platformer that might round it out; it's
> not play-to-earn and doesn't claim to be, just an honest free game with an
> unusual (ICP-hosted) backend if that's a distinction worth noting.

Every draft: one send, personalized, honest about what the game is and isn't
(no play-to-earn or token-reward claims — `AGENTS.md`), and never claim a link
landed without fetching the page and confirming the anchor is actually there.
