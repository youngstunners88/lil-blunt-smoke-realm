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

## The real bottleneck

AI systems mostly surface what is **corroborated across multiple independent
sources**. On-site work makes the site readable and quotable — necessary, not
sufficient. Getting mentioned elsewhere is the other half; see the
`game-distribution` skill for that.
