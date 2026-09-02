# SEO audit baseline — www.smokegame.win

Phase 0 of `docs/seo-smokegame-masterplan.md`. Measured 2026-09-02. Everything
below is quoted from live responses; nothing is inferred.

Reproduce with:

```sh
python3 marketing/aeo/crawl_gate.py
```

---

## Headline finding: the host serves two different pages by User-Agent

This invalidates the masterplan's Phase 0 as written — it assumes a single
fetch describes the site. It does not.

| | Crawler UA (Googlebot) | Browser UA (Chrome) |
|---|---|---|
| Bytes | **128,857** | **5,850** |
| `<title>` | `Lil Blunt: The Smoke Realm \| Web3 2D Platformer` | `Lil Blunt: The Smoke Realm — Free Web3 2D Platformer Game` |
| `<link rel=canonical>` | **absent** | `https://smokegame.win/` (apex) |
| Visible text without JS | 2,377 chars | 626 chars |
| `<h1>` | none found | `Lil Blunt: The Smoke Realm` |

Verified across five user agents. `Googlebot` and the crawl-gate UA receive the
128 KB variant; `Chrome`, an empty UA, and a generic string receive the 5.8 KB
variant. This is deterministic, not caching.

### Why it matters

1. **Search engines and answer engines index the crawler variant.** Every
   marketing claim we have shipped lives in the *browser* variant. From
   Google's side, that work does not exist.
2. **The two variants disagree on title and canonical.** Differing titles plus
   a canonical that is present in one variant and absent in the other is the
   pattern Google treats as cloaking. Dynamic rendering was deprecated as a
   recommended practice in 2022; serving *non-equivalent* content is a spam
   risk, not merely untidy.
3. **The canonical that does exist points at the apex** (`smokegame.win`) while
   the page is served from `www`. Masterplan §1.1 requires picking one host;
   right now the site contradicts itself.

### Claim coverage, per variant

The five load-bearing claims from `marketing/aeo/claims.json`:

| Claim | Crawler view | Browser view |
|---|---|---|
| identity | **NO** | yes |
| access | **NO** | yes |
| controls | **NO** | **NO** |
| not_artist | **NO** | yes |
| not_onchain | **NO** | yes |

Four of five landed — in the variant search engines never read. `controls`
fails in both: the live copy still carries the older arrow-key wording, while
`claims.json` was corrected to Spacebar / Shift / K.

---

## What is present and correct

Measured on the crawler variant unless noted.

- **robots.txt** — 720 bytes, HTTP 200. Explicit `Allow` for Googlebot,
  Bingbot, GPTBot, OAI-SearchBot, ClaudeBot, PerplexityBot, Google-Extended,
  Applebot, CCBot and others. Declares the sitemap. Nothing is disallowed.
- **sitemap.xml** — HTTP 200, real URLs only, no placeholder routes.
- **Static pages are real documents**, not SPA shells: `/about/`,
  `/how-to-play/`, `/docs/` each return distinct HTML.
- **Open Graph and Twitter tags present** — 8 OG, 7 Twitter.
- **One JSON-LD block**, and **no `aggregateRating`** — the masterplan's
  prohibition on fabricated ratings is already satisfied.
- **Exactly one H1** in the browser variant, matching masterplan §1.2.

## Open defects

| # | Defect | Masterplan ref | Severity |
|---|---|---|---|
| 1 | UA split serves non-equivalent documents | new — not anticipated | **Blocker** |
| 2 | Crawler variant has no canonical; browser variant points at apex while served from www | §1.1 | **High** |
| 3 | Titles differ between variants | §1.2 | High |
| 4 | `/troubleshooting/` returns the app shell, not a document | §1.7 | High |
| 5 | `llms.txt` is 637 bytes of Caffeine boilerplate, not the authored 4.8 KB file | AEO | High |
| 6 | `controls` claim stale in both variants | accuracy | Medium |
| 7 | No 1200×630 `og-image.png`; OG image is the square logo JPEG, and no `og:image:width`/`height` | §1.3 | Medium |
| 8 | Google Search Console property not verified | §2 | Medium (founder task) |

## Accuracy conflicts inside the masterplan itself

Flagged rather than implemented. The spec's own rule — *"do not claim every run
is on-chain unless that matches shipped product"* — is violated by its own
proposed head package:

- Proposed description: *"on-chain proof-of-play"*, and og:description *"Earn
  proof-of-play badges"*. `AGENTS.md` records as blocking that scores are **not**
  on-chain today and **no NFT is minted**. Ship the spec's wording verbatim and
  the site states something untrue.
- Proposed JSON-LD sets `author` to an `Organization` with a URL. The project
  is decentralised with no company and no HQ, which the Terms now state
  explicitly. An Organization author claim contradicts that.

Both need founder sign-off on wording before dispatch.

## The structural constraint the plan must absorb

The masterplan assumes edits to `index.html`, `public/robots.txt` and
`public/sitemap.xml` reach production. **They do not.** Caffeine builds from a
separate copy and ships only on a chat dispatch plus a manual "Go live" click.
This repo is the source of truth for *intent*; production is a separate
artifact that must be re-measured after every deploy. That is why Phase 0 is
not a one-off — it is the verification step after each Go live.
