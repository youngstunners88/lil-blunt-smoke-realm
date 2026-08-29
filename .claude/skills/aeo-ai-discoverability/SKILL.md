---
name: aeo-ai-discoverability
description: Make this site discoverable and quotable by AI assistants and answer engines (ChatGPT, Claude, Perplexity, Gemini, Google AI Overviews) — crawlable static content for non-JS crawlers, llms.txt, AI-crawler robots rules, FAQ and entity structured data. Use when asked about AEO, AI search, LLM visibility, getting recommended by AI, or "why doesn't ChatGPT know about my site".
---

# AI Discoverability (AEO) for the Smoke Realm Site

Answer Engine Optimization is a different problem from classic SEO. Google
renders JavaScript; **most AI crawlers do not**. That single fact drives almost
everything below.

## The load-bearing constraint

`src/frontend/index.html` ships `<div id="root"></div>` and nothing else — the
entire site is client-rendered React. A crawler that does not execute JS sees an
empty page.

GPTBot, ClaudeBot, PerplexityBot, CCBot and friends largely fall in that bucket.
So **no amount of meta-tag polish helps if the content only exists in React**.

### The mitigation actually in place

Three layers, in order of how much they carry:

1. **Static HTML pages** at `public/about/index.html` and
   `public/how-to-play/index.html`. Real, self-contained, inline-styled, zero
   JS. This is the primary channel — these are what AI crawlers actually read.
2. **`<noscript>` block** in `index.html` carrying the core description and
   links to those pages, so the home URL itself is not empty.
3. **`public/llms.txt`** — a structured plain-text brief written directly for
   AI agents.

Anything in `public/` is copied to the site root verbatim by Vite, so
`public/about/index.html` is served at `/about/`. No router config needed; the
app has no router.

### When adding content, ask: can a crawler without JS read this?

If the answer is no, it does not exist for AEO purposes. Put substantive
factual content in the static pages, not only in React components.

## llms.txt

`public/llms.txt` is a markdown brief for AI agents. Keep it:

- **Factual and plain.** No marketing voice. AI systems summarize clearly
  written fact better than they summarize copy.
- **Answer-shaped.** Write the sentences you would want quoted back verbatim
  when someone asks "what is this game" or "do I need a wallet".
- **Current.** Stale facts here propagate into answers.

It explicitly tells non-JS agents to read `/about/` and `/how-to-play/` instead
of the JS home page. Keep that note.

## robots.txt — allow AI crawlers by name

`public/robots.txt` explicitly `Allow: /` for GPTBot, OAI-SearchBot,
ChatGPT-User, ClaudeBot, Claude-User, Claude-SearchBot, anthropic-ai,
PerplexityBot, Perplexity-User, Google-Extended, Applebot-Extended, Bytespider,
Amazonbot, meta-externalagent, and CCBot.

A wildcard `Allow: /` already permits them, but naming them is deliberate: it
survives anyone later adding a restrictive wildcard rule, and it documents the
intent. **Do not add `Disallow` rules for these agents** — that is precisely how
a site becomes invisible to AI recommendations.

## Structured data

`index.html` carries a schema.org `@graph`: `VideoGame` (with `author`,
`publisher`, and a zero-price `Offer` so "free" is machine-readable), `WebSite`,
and `Organization` with a `sameAs` array of every official channel.

`public/how-to-play/index.html` carries a **`FAQPage`** with real
question/answer pairs. This is disproportionately valuable for AEO: it hands
answer engines pre-formed Q&A they can lift directly. Questions should mirror
how people actually ask — "do I need a crypto wallet", "is it free", "what is
ICP" — not marketing headings.

When adding an official link anywhere, add it to `sameAs` too.

## Accuracy constraints — read before writing any on-chain claim

AEO text is written specifically to be quoted back by AI assistants. An
overclaim here does not just sit on a page; it gets repeated as fact about a
crypto product. Treat this section as blocking.

`src/frontend/src/components/sections/OnChainPoints.tsx` carries a `doNotBuild`
note. As of this writing it states: **no live on-chain ICP leaderboard with real
scores**, and **no NFT minting claims — achievement layer only**. The UI ships
`DemoBadge` and `DEMO LEADERBOARD` labels on those figures for that reason.

So:

| Safe to state | Not true — do not write |
|---|---|
| The site is served from an ICP canister | Scores are recorded on-chain today |
| Internet Identity sign-in works | The leaderboard is publicly verifiable |
| Proof of Play is an achievement layer | Players earn tokens / airdrops / NFTs |
| Free, no wallet, no fee | Play-to-earn |

The site's supply, staking, and circulating figures are demo placeholders.
**Never write a tokenomics page or a token claim from them.** If asked for one,
say the numbers need founder verification first — fabricating financial detail
about a token people can buy is the worst possible failure mode for this repo.

Re-read the `doNotBuild` note before each pass; if it has changed because the
feature shipped, update the pages *and* this table together.

## Writing content AI will quote correctly

- **Answer the question in the first sentence.** Lead with the direct answer,
  then elaborate. AI extraction favors the opening sentence of a section.
- **Define jargon inline.** "the Internet Computer (ICP), a public blockchain
  that hosts complete web applications" beats a bare "ICP" every time.
- **State negatives explicitly.** "You do not need a crypto wallet" is a
  high-value sentence because it is what people actually ask, and because
  without it an AI will assume the Web3 default and tell people they do.
- **Avoid hype adjectives.** "Revolutionary" and "next-gen" carry zero
  extractable information and make a page read as low-quality.
- **Use plain nouns in headings.** "How to play" outperforms "Enter the Realm."

## Verify after any change

```bash
cd src/frontend && pnpm build
ls dist/about/index.html dist/how-to-play/index.html dist/llms.txt \
   dist/robots.txt dist/sitemap.xml
grep -c noscript dist/index.html
```

Then, to see the site as an AI crawler does:

```bash
curl -sL https://smokegame.win/ | grep -v '<script' | wc -c   # near-empty = bad
curl -sL https://smokegame.win/about/ | wc -c                  # should be substantial
curl -sL https://smokegame.win/llms.txt
```

Validate structured data with Google's Rich Results Test and schema.org's
validator before considering a change done.

## What does not work

- Keyword stuffing, in the page or in `llms.txt`.
- Hidden text or content served only to crawlers (cloaking) — this is a spam
  violation and risks delisting.
- Meta keywords tags. Unused by every major engine.
- Claiming things the product does not do. AI systems cross-reference sources;
  a claim contradicted elsewhere damages the whole page's credibility.

## How AI visibility actually works — the model that explains the rest

Source: Dan Petrovic (Dejan) on the Ahrefs podcast, plus Promptwatch citation
data. This corrects the intuition most AEO advice is built on.

**LLMs do not crawl the web.** They query a conventional search index and
re-rank what comes back. ChatGPT leans on Bing, Gemini on Google, Claude on
Brave. The model never goes looking for you — it re-orders a grounding pool
handed to it by a search engine. **So classic indexation is a precondition, not
a parallel track.** If the site does not rank, it is never in the pool to be
re-ranked, and no amount of `llms.txt` polish changes that.

This is why `search-ranking-strategy`'s "is it even indexed?" question comes
before anything in this skill.

**Three different things, routinely conflated:**

| Term | Meaning | Worth |
|---|---|---|
| Grounding | Your page is handed to the model as candidate context | Entry ticket |
| Citation | The model attributes a sentence to it | Useful |
| Mention | Your brand is actually named | The goal |

A **linked mention** is the win. Being a grounding source that never gets named
earns nothing. Optimise for being nameable, not merely retrievable.

**Two biases decide the outcome.** Primary: what the model absorbed about the
brand during pre-training. Secondary: what search returns at query time. A
model that already thinks well of a brand will promote it from the bottom of
the grounding list; one that does not may omit it even when it ranks well.
Seeding pre-training is out of reach at this budget — that is a
million-dollar exercise. On-page work against the secondary bias is not.

## What changed in 2026: the citation substrate moved

Promptwatch measured a reversal that invalidates a lot of standing advice:

- **Reddit: ~15% of ChatGPT citations → zero.** It is rejected from grounding
  over 90% of the time even when it appears in the pool.
- **G2 / Capterra / Trustpilot: ~7% → zero.**
- **Help centres and documentation: surged to 32%.**

So "post on Reddit for AI visibility" is now wrong as a *citation* strategy.
Reddit still has value for reaching humans — see `game-distribution`, which
scopes it that way — but it is no longer a path into AI answers.

**Documentation-style pages on your own site are what get cited now.** For this
project that means the highest-leverage content is not more marketing copy; it
is genuine reference material: controls, requirements, troubleshooting,
mechanics, "why is the screen black". Pages that answer a specific question
completely and verifiably.

Run every such page through `marketing/aeo/quality_gate.py` before publishing —
see `aeo-measurement`. Filler in documentation clothing is exactly what indexes
filter out.

## Write for extractive summarization

Gemini does not receive your page. It receives an **extractive** summary:
verbatim fragments of your text, cut out and joined by ellipses, selected
against a fan-out query you never see. Abstractive rewriting would destroy
meaning, so Google takes literal excerpts — but the compression still drops
whatever did not get selected.

**What survives that cut is what argues for you.** Practical consequences:

- **Make each claim survive removal from its paragraph.** "It is free" is
  useless as an excerpt. "Lil Blunt: The Smoke Realm is free to play in a
  browser with no wallet, download, or account" survives alone.
- **Front-load the load-bearing sentence** in every section. Selection favours
  openers.
- **Do not spread one fact across three sentences.** Anaphora ("it", "this",
  "the game") breaks when the antecedent is cut away. Repeat the noun.
- **Self-contained beats elegant.** Mild repetition across sections is correct
  here, not sloppy.

## Measure it, do not assume it

`aeo-measurement` covers the probe loop that records whether any of this is
working — entity fan-out questions, share of voice over time, and the
competitor citation-mining list. Two rules from it that matter most:

- **Grounding must stay ON** when probing, or you measure a frozen training
  snapshot rather than the live index.
- **A change counts only when it holds for three consecutive runs.** Models are
  non-deterministic and samples are small.

## The real bottleneck

AI systems mostly surface what is **corroborated across multiple independent
sources**, and they only ever see what a search index already surfaced. On-site
work makes the site readable, quotable and extractable — necessary, not
sufficient. The other half is being in the index at all, and being mentioned
elsewhere: see `search-ranking-strategy` and `game-distribution`.

The fastest documented route into the grounding pool is not building a new page
and waiting: it is **getting listed on a page that is already cited** for your
target query. `marketing/aeo/probe.py --report` prints exactly that list.
