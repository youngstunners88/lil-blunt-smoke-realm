---
name: seo-optimization
description: Apply Google Search Central SEO best practices to this site — titles, meta descriptions, canonical URLs, structured data (JSON-LD), robots.txt, sitemap.xml, image alt text, and link/anchor quality. Use when asked to improve SEO, search ranking, discoverability, mass adoption, social share previews, or when adding a new page or section that needs to be indexable.
---

# SEO for Lil Blunt: The Smoke Realm

Canonical host: `https://smokegame.win/`. Single-route React SPA — everything
below lives in `src/frontend/index.html` and `src/frontend/public/` unless a
second route is added.

Derived from the Google Search Central SEO Starter Guide. The ordering matters:
the top items move the needle, the bottom ones are hygiene.

## What actually matters, in order

### 1. Useful, unique content

Google's own guidance: compelling, useful content influences ranking more than
any technical tweak here. Write naturally, describe what the game actually is,
keep it free of filler. **Never** keyword-stuff — it violates spam policy and
reads badly to humans.

Anticipate how different people search for the same thing: "Web3 platformer",
"free crypto game", "Wild West 2D game", "ICP game". Cover the real variants in
prose, not in a keyword list.

### 2. Title and meta description

The `<title>` is the headline in search results. Make it unique, clear, concise,
and accurately descriptive — lead with what the thing is, not a slogan.

The meta description feeds the snippet. Short, specific, one or two sentences,
naming the concrete things a searcher cares about (free to play, what you do in
the game, what platform).

### 3. Structured data (JSON-LD)

The page ships an `@graph` with three linked entities:

- `VideoGame` — name, description, genre, platform, and a zero-price `Offer`
  so "free to play" is machine-readable.
- `WebSite` — site-level identity and language.
- `Organization` — logo plus a `sameAs` array listing every official channel
  (X, Telegram, the three protocol sites, itch.io).

When adding a channel or protocol site, **add it to `sameAs`** — that array is
how Google connects the site to its social accounts.

Validate changes against the Rich Results Test before shipping.

### 4. Crawl basics

- `link rel="canonical"` on every page — prevents duplicate-content dilution.
- `public/robots.txt` — allows all, points at the sitemap.
- `public/sitemap.xml` — list every real URL. Update it when routes are added.
- `meta name="robots"` with `max-image-preview:large` so images can appear
  large in results.

### 5. Social share cards

Open Graph and Twitter/X tags, with `twitter:site` and `twitter:creator` set to
the official handle. Every image tag needs a matching `:alt`. Absolute URLs only
— relative paths break in crawlers and share scrapers.

### 6. Images

Every `<img>` needs descriptive `alt` text explaining the image's relationship
to the content — not a filename, not a keyword dump. Decorative images take
`alt=""` plus `aria-hidden="true"`. Place images near text relevant to them.

### 7. Links

Descriptive anchor text — the visible text should tell users and Google what
they'll get. Never "click here". Outbound links to sites outside our control
get `rel="noopener noreferrer"`; official own-channel links may add `me`.

## Explicitly NOT worth effort

Per Google, do not spend time on: the keywords meta tag (unused), keyword
density, keywords in the domain, minimum/maximum word counts, heading count or
strict heading order for ranking, or "E-E-A-T as a ranking factor" (it isn't
one). Semantic heading order is still worth it for screen readers.

## SPA caveat

This is a client-rendered React app. Google renders JavaScript, but anything
critical for indexing — title, description, canonical, structured data — must be
in the static `index.html`, not injected at runtime. Keep it that way.

Most **AI** crawlers do not render JavaScript at all, which is a harder
constraint than Google's. Static crawlable content lives in
`public/about/index.html` and `public/how-to-play/index.html`; see the
`aeo-ai-discoverability` skill for that whole surface.

## Checklist for any new page or section

- [ ] Unique `<title>` and meta description
- [ ] `canonical` pointing at its own URL
- [ ] Added to `sitemap.xml` **and** to the Pages list in `public/llms.txt`
- [ ] One `<h1>`; sections use `<h2>`
- [ ] All images have real `alt` text
- [ ] Descriptive anchor text on every link
- [ ] Structured data extended if it introduces a new entity type
- [ ] `pnpm build` passes and the tags survive the build
