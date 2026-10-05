# SEO head package — homepage (corrected, ready to dispatch)

This is the exact `<head>` block to dispatch to **Caffeine** for the homepage
(`https://www.smokegame.win/`). It executes masterplan §1.2, **with the
accuracy violations removed** — the masterplan's own block claims things
`AGENTS.md` marks as blocking-false.

**Status: draft only. Do NOT dispatch this yet.** Committing here is not
shipping; Caffeine builds from a separate copy and only goes live on a manual
"Go live" click. When you do dispatch it, follow the `seo-smokegame-ship`
verification step and re-measure the crawler variant afterwards — the live host
serves a different document to Googlebot than to a browser, so a head that lands
in the browser variant is not done.

---

## What was changed from masterplan §1.2, and why

The masterplan block is not accuracy-clean. Three corrections, each tied to a
blocking rule in `AGENTS.md`:

1. **Removed "on-chain proof-of-play" / "earn proof-of-play badges."** Scores
   are **not** written to a blockchain today and **nothing is minted** by
   playing. Proof of Play is an achievement layer, not a live on-chain reward.
   This exact claim shipped once before on AEO pages and had to be walked back —
   do not reintroduce it. What *is* true and still distinctive: the **whole site
   is served from the Internet Computer**, which is rarer than a token contract.
   The copy leans on that instead.
2. **Dropped the `Organization` author with a URL.** The project is
   decentralised — no company, no HQ (the Terms page now states this). An
   `author` Organization with a URL asserts a corporate entity that does not
   exist, so the field is omitted rather than faked.
3. **No `aggregateRating`.** There are no real, verifiable reviews, so no rating
   markup — same rule as the masterplan states for itself.

Also: the OG/Twitter image points at the brand logo that actually exists today
(`/assets/brand/lil-blunt/lil-blunt-logo.jpeg`). Masterplan §1.3 wants a
dedicated 1200×630 `/assets/og-image.png`; until that asset is generated and
confirmed live, referencing a non-existent file would break the share preview.
Swap the two image URLs once the 1200×630 asset exists.

---

## The head block to dispatch

```html
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />

<title>Lil Blunt: The Smoke Realm | Free Browser Platformer</title>
<meta name="description" content="Play Lil Blunt: The Smoke Realm free in your browser — a 2D Wild West platformer served entirely from the Internet Computer blockchain. No download, no wallet, no account. Hub for SMOKE, DIAMONDS, and GOLD." />

<link rel="canonical" href="https://www.smokegame.win/" />
<meta name="robots" content="index, follow, max-image-preview:large" />

<meta property="og:type" content="website" />
<meta property="og:url" content="https://www.smokegame.win/" />
<meta property="og:title" content="Lil Blunt: The Smoke Realm | Free Browser Platformer" />
<meta property="og:description" content="Free 2D Wild West platformer that runs in your browser — no download, no wallet, no account. The whole site is served from the Internet Computer. SMOKE · DIAMONDS · GOLD." />
<meta property="og:image" content="https://www.smokegame.win/assets/brand/lil-blunt/lil-blunt-logo.jpeg" />
<meta property="og:site_name" content="Smoke Game" />

<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="Lil Blunt: The Smoke Realm | Free Browser Platformer" />
<meta name="twitter:description" content="Free 2D Wild West platformer in your browser. No download, no wallet, no account — the whole site runs on the Internet Computer." />
<meta name="twitter:image" content="https://www.smokegame.win/assets/brand/lil-blunt/lil-blunt-logo.jpeg" />

<!-- VideoGame schema: no fake ratings, no on-chain reward claims, no fabricated author entity -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "VideoGame",
  "name": "Lil Blunt: The Smoke Realm",
  "description": "A free 2D Wild West browser platformer. It runs in the browser with no download, wallet, or account, and the site itself is served from the Internet Computer.",
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
  "sameAs": [
    "https://youngstunners88.itch.io/lil-blunt-adventure",
    "https://github.com/youngstunners88/GM-GAME"
  ]
}
</script>
```

---

## Accuracy check (every value vs AGENTS.md)

| Value | Claim | Accurate? |
|---|---|---|
| title / og:title | "Free Browser Platformer" | Yes — free, runs in browser, is a platformer. |
| description | "served entirely from the Internet Computer blockchain" | Yes — the site is served from ICP. |
| description | "No download, no wallet, no account" | Yes — matches site copy and claims.json `access`. |
| JSON-LD description | "site itself is served from the Internet Computer" | Yes — host, not casino. |
| offers.price = 0 | Free | Yes. |
| (absent) on-chain proof-of-play | — | Removed; would be blocking-false. |
| (absent) author Organization + URL | — | Removed; no company exists. |
| (absent) aggregateRating | — | Removed; no real reviews. |

Canonical is on **www** (`https://www.smokegame.win/`), matching the masterplan's
chosen canonical host and the other static pages in this repo.

**One clear H1** on the homepage — game name plus plain value prop, a single H1 —
is a page-body rule, not part of this head block; enforce it when dispatching.
