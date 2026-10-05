<!-- Source: founder-supplied Google Doc, imported 2026-09-02.
     Kimi's executable packages merged with accurate constraints.
     Operationalised by the seo-smokegame-ship skill. Deviations from this
     document are recorded in docs/seo-audit-baseline.md with evidence. -->

# SEO Masterplan — smokegame.win (Lil Blunt / Smoke Realm)


**Version:** 1.1 hybrid  
**Canonical host:** https://www.smokegame.win/  
**Play:** https://youngstunners88.itch.io/lil-blunt-adventure  
**Game repo:** https://github.com/youngstunners88/GM-GAME  


## Goal
Make the hub crawlable and indexable for the real product: free browser platformer + claim/points path + accurate SMOKE / DIAMONDS / GOLD context.  
Do **not** invent gameplay, stages, ratings, or token claims for keywords.


## Out of scope (this plan)
- Domain migration away from smokegame.win
- Fabricated Schema aggregate ratings
- Sitemap entries for pages that do not exist yet
- Mass AI blog farms, paid link blasts, Ahrefs as a blocker
- Implementing Lounge 50% recycle NFT rules inside the marketing site SEO copy


---


## Phase 0 — Baseline audit (Claude: do first)


1. Fetch https://www.smokegame.win/ (HTML source, not only rendered guess).
2. Report to `docs/seo-audit-baseline.md`:
   - `<title>`, meta description, canonical
   - All H1/H2 text
   - Whether main copy exists in initial HTML or only after JS
   - img alts (logo, hero, protocol art, gameplay)
   - robots.txt / sitemap.xml status
   - Broken internal links
   - Open Graph / Twitter / JSON-LD if any
3. List URLs that **actually exist** and should be indexed.


Do not invent findings. Quote what is present.


---


## Phase 1 — Technical foundation (P0 — do next)


### 1.1 Host consistency
- Canonical: **https://www.smokegame.win/**
- Apex `smokegame.win` → 301 → `https://www.smokegame.win$request_uri` (or document the reverse if already chosen — pick **one**).
- HTTPS only.


Do **not** block work on buying `.io` / `.game` redirects. Optional later if cheap; not required for ranking.


### 1.2 Head package (homepage)


Inject or merge into layout `<head>` (adjust asset paths to real files):


```html
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />


<title>Lil Blunt: The Smoke Realm | Free Browser Platformer</title>
<meta name="description" content="Play Lil Blunt: The Smoke Realm free in your browser. Skill-based 2D platformer with on-chain proof-of-play on the Internet Computer. Hub for SMOKE, DIAMONDS, and GOLD." />


<link rel="canonical" href="https://www.smokegame.win/" />


<meta property="og:type" content="website" />
<meta property="og:url" content="https://www.smokegame.win/" />
<meta property="og:title" content="Lil Blunt: The Smoke Realm | Free Browser Platformer" />
<meta property="og:description" content="Free browser platformer. Play on itch or the hub. Earn proof-of-play badges. SMOKE · DIAMONDS · GOLD." />
<meta property="og:image" content="https://www.smokegame.win/assets/og-image.png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:site_name" content="Smoke Game" />


<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="Lil Blunt: The Smoke Realm | Free Browser Platformer" />
<meta name="twitter:description" content="Free browser platformer with on-chain proof-of-play. No download required to start." />
<meta name="twitter:image" content="https://www.smokegame.win/assets/og-image.png" />


<!-- VideoGame schema: no fake ratings -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "VideoGame",
  "name": "Lil Blunt: The Smoke Realm",
  "description": "A free 2D browser platformer with on-chain proof-of-play on the Internet Computer.",
  "url": "https://www.smokegame.win/",
  "genre": ["Platformer", "Browser Game", "Indie Game"],
  "gamePlatform": ["Web Browser", "HTML5"],
  "applicationCategory": "Game",
  "operatingSystem": "Any",
  "inLanguage": "en",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD",
    "availability": "https://schema.org/InStock"
  },
  "author": {
    "@type": "Organization",
    "name": "Young Stunners",
    "url": "https://github.com/youngstunners88"
  },
  "sameAs": [
    "https://youngstunners88.itch.io/lil-blunt-adventure",
    "https://github.com/youngstunners88/GM-GAME"
  ]
}
</script>
```


**Rules**
- One clear **H1** on the page (game name + plain value prop). Not multiple H1s.
- Keyword early in title (≤ ~60 characters).
- **No** `aggregateRating` unless real, verifiable reviews exist.
- Do not claim “every run is on-chain” or “no NFTs” unless that matches shipped product.


### 1.3 Images
- Meaningful `alt` on logo, hero, protocol logos, gameplay shot.
- Provide or generate **1200×630** `/assets/og-image.png` (character + title + “Free browser platformer”; dark theme consistent with site).
- Compress oversized PNGs when touching assets.


### 1.4 robots.txt


```txt
User-agent: *
Allow: /


Sitemap: https://www.smokegame.win/sitemap.xml
```


Disallow only real private paths if they exist (`/admin`, preview routes). Do not disallow the whole site.


### 1.5 sitemap.xml (only live URLs)


Start minimal:


```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://www.smokegame.win/</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
