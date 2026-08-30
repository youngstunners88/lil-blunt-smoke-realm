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
