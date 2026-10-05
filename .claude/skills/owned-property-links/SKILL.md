---
name: owned-property-links
description: Decide whether to link two properties the same person owns, and gate the copy on both sides before doing it — accuracy contradiction check, link-scheme risk, and realistic SEO value. Use when asked to build backlinks from your own other sites, repos or GitHub Pages, to cross-link related projects, to leverage an existing site for a new one's rankings, or before publishing anything on a second property that points at the first.
---

# Linking properties you own

```bash
python3 marketing/aeo/jev.py --gate <the other property's index.html>
```

**Gate both sides before linking either.** That is the whole discipline, and it
is not primarily an SEO check — it is a consistency check on what the world is
told about one entity.

## The three questions, in this order

### 1. Do the two properties contradict each other?

This is the blocking one, and it has nothing to do with rankings.

When an answer engine reconciles several sources about one entity, **a
contradiction does not average out — one version wins and you do not choose
which.** Linking a site that makes claims your main site denies actively
installs the wrong description.

Measured on this project, 2026-09-30:

| Property | rewards | play-to-earn | gate |
|---|---|---|---|
| `youngstunners88.github.io/DIAMONDS/` | **0.67** | 0.37 | **BLOCKED** |
| `youngstunners88.github.io/DIAMONDS-II/` | **0.61** | **0.71** | **BLOCKED** |
| smokegame.win (live) | 0.03 | 0.05 | PASS |

Both are live `$DIAMONDS Protocol` pages promising "ETH rewards through
blockchain-powered staking, mining, and diamond rewards". `AGENTS.md` marks
exactly those claims blocking-false for the game, and the game's own pages say
"no token payout, airdrop, NFT". **Linking them would reintroduce, from a second
domain, the precise claim this project spent three weeks removing from its
own** — and would hand an assistant a reason to describe the game as
play-to-earn.

A shared name is not a shared claim set. The game has a DIAMONDS *protocol* in
its fiction; that is not the same entity as a token site called $DIAMONDS.

### 2. Is this a link scheme?

Self-owned properties linking each other primarily to pass authority is a
private blog network. Google's guidelines treat it as spam regardless of who
owns the domains.

The distinguishing test is **editorial justification**: would you place this
link if it passed no authority at all? Would a reader following it be served?

- **Legitimate:** a project page linking its own live demo; a studio site
  listing its games; genuinely related work cross-referenced where a reader
  benefits.
- **A scheme:** publishing pages on dormant properties whose purpose is to
  point at the target; footer links across unrelated sites; anchor text chosen
  for a keyword rather than for the reader.

If the honest answer to "why is this link here" is "for the SEO", it is the
second kind.

### 3. Would it even work?

Usually no, and this is worth saying before the accuracy argument so nobody
feels the accuracy point is the only objection.

- **`github.io` links carry very little weight.** It is one enormous shared
  domain; search engines discount it heavily precisely because anyone can
  publish there.
- **A page with no traffic and no inbound links has nothing to pass.** Authority
  is not created by linking; it is forwarded. Two pages nobody visits forward
  nothing.
- **Same-owner footprints are trivially detectable** — shared account, adjacent
  creation dates, identical hosting, reciprocal pattern.

So the realistic yield is near zero even setting correctness aside. That matters
because it removes the temptation to weigh a real accuracy risk against an
imagined SEO gain.

## What to do instead

Ranked by expected value for this project:

1. **Fix the owned properties' own accuracy first.** Two live pages under the
   same name are making reward claims the main project denies. That is a
   standalone liability — reputational and potentially regulatory — whether or
   not anything ever links to them. This is worth doing purely on its merits.
2. **Once both sides pass the gate, one honest cross-link is fine** — from the
   protocol page to the game as "the game these protocols appear in", placed
   where a reader benefits. Expect no ranking effect. Do it for coherence.
3. **Real links come from third parties.** `docs/gemini-aeo-research-2026-09-09.md`:
   brand-owned pages were **7.9%** of AI-engine sources against **92.1% earned**,
   and across 8 live queries no individual game's own domain was cited at all.
   Aggregators, databases and listicles are the mechanism. See
   `backlink-building` and `game-distribution`.

## The rule

**Never publish on a second property to benefit a first without gating both.**
A link between two properties you own is a claim that they belong together. If
they contradict each other, you have not built a backlink — you have published
a contradiction twice and pointed at it.

## When this hands off

| Situation | Go to |
|---|---|
| Earning links from third parties | `backlink-building`, `game-distribution` |
| Gating copy before it ships | `jev-gauntlet` |
| Whether an entity is described correctly | `geo-representation` |
| The blocking claim rules themselves | `AGENTS.md` § Public Claims Accuracy |
