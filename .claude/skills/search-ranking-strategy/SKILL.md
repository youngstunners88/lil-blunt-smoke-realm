---
name: search-ranking-strategy
description: What Lil Blunt can realistically rank for on Google and in what order — indexation first, winnable query tiers, the brand-name collision, and the content that actually earns rankings. Use when asked about ranking, "going #1 on Google", keyword strategy, organic traffic growth, or what content to write for search.
---

# Search Ranking Strategy

`seo-optimization` covers on-page mechanics (titles, JSON-LD, sitemaps) and
`aeo-ai-discoverability` covers answer engines. This skill covers the part
neither does: **what is actually winnable, and in what order.** The mechanics
are already done; they are not what is holding rankings back.

## Start here: is it even indexed?

As of August 2026 the site did not surface for any query — including its own
brand name. A cause was found and fixed: every canonical tag, `og:url` and
sitemap entry pointed at `https://smokegame.win/`, which has **no DNS record**.
Only `www.smokegame.win` resolves. A canonical pointing at an unreachable host
suppresses indexing of the page carrying it.

Before diagnosing anything else about rankings, confirm the basics in order:

1. **Is `www.smokegame.win` the only host that resolves?** If the apex is
   given a record later, add a 301 to www and keep one canonical form. Never
   let both serve content — that splits every ranking signal you earn.
2. **Is Search Console connected?** It was not, which means no index coverage
   data, no query data, and no way to request indexing. This is the single
   highest-value unblocked setup task. Verify the property, submit
   `https://www.smokegame.win/sitemap.xml`, then use URL Inspection → Request
   Indexing on the four real pages.
3. **Only then** ask questions about rankings. "We don't rank" and "we aren't
   indexed" look identical from outside and have completely different fixes.

## The brand-name collision

"Lil Blunt" is an established music artist (releases on Amazon Music, YouTube).
Ranking for the bare name means competing with an entity Google already has a
strong entity graph for. Consequences:

- **Always target `lil blunt smoke realm`**, never `lil blunt` alone. The
  three-word form is winnable and is what an interested person actually types.
- The site should *own* every branded variant: "smoke realm game", "lil blunt
  game", "smokegame". These convert best and are the cheapest to win.
- Do not measure success on "lil blunt" position. It is the wrong target and
  will read as failure forever.

## Query tiers — what to chase, in order

**Tier 1 — branded (win these first, they are yours).**
`lil blunt smoke realm`, `smoke realm game`, `smokegame win`. Near-zero
competition. If you do not rank for these, something is technically broken —
go back to indexation.

**Tier 2 — long-tail intent (the realistic growth engine).**
Specific, low-volume, low-competition, high-intent:
- `free wild west browser game no download`
- `cannabis themed platformer browser game`
- `web3 browser game no wallet needed`
- `internet computer browser game`
Each brings few visitors; twenty of them compound into real traffic. This is
where the effort goes for the first six months.

**Tier 3 — developer/technical (the underrated one).**
Genuinely the most winnable *valuable* content this project has, because the
competition is thin and the authors are few:
- `deploy godot game to internet computer`
- `caffeine ai review`
- `godot 4 html5 export icp`
- `build web3 game without wallet`
Developer queries have far lower domain-authority requirements than consumer
game queries, and the audience is worth more per visitor. You have genuinely
novel first-hand experience here — that is the rarest SEO asset there is.

**Tier 0 — do not chase.**
`free browser game`, `browser games`, `free online games`. Owned by Poki,
CrazyGames and Miniclip with years of authority and enormous link profiles. A
new domain does not win these, and pursuing them burns months. Anyone
promising "#1 for free browser games" is selling something.

## The actual constraint: there is no content

A single-page game site plus three thin static pages cannot rank for much,
because there is nothing on it worth ranking. Google ranks pages that answer
questions; a landing page answers one.

The fix is a content engine, ordered by effort-to-value:

1. **Devlog posts** on building the game — Godot 4.3, the ICP deployment, what
   Caffeine got right and wrong. Real experience, thin competition, and it
   feeds Tier 3.
2. **Guides** that answer the long-tail questions directly — one page per
   query family in Tier 2.
3. **A proper /docs/ expansion** — the page exists; make it genuinely useful.

Each new page needs a sitemap entry, a canonical on the www host, and internal
links from the pages that already exist. Orphan pages do not rank.

## Measuring honestly

- **Rank position is a vanity metric without traffic.** #1 for a query nobody
  searches is worth nothing. Track clicks in Search Console, not positions.
- **SEO compounds on a 3–6 month lag.** Nothing written today shows results
  this week. Judging it weekly guarantees abandoning it right before it works.
- Cross-reference with `marketing/report.py` — organic visitors land with no
  UTMs, so they appear as `(direct)`. To attribute properly, tag outbound
  links you control; anything untagged in that column is a mix of organic and
  true direct.

## The honest ceiling

SEO brings qualified traffic to a free game. Traffic multiplied by a free
product is still zero revenue. Ranking work is worth doing — it is durable and
compounding, unlike ads — but it does not produce income on its own. See
`revenue-paths` for what would have to exist first.
