# Deep-dive audit, 2026-10-01

Scope: live site and its crawler view, DNS, structured data, security headers, dependencies, accuracy of every
game-description surface against the game source, search-engine and open-web presence, and the measurement
stack. Method for every row is named. Reproduce with `tech_audit.py`, `verify_publish.py`, `surface_audit.py`,
`assess.py`. Nothing here was spent beyond about one cent of OpenRouter.

## Scorecard

| Check | Result |
|---|---|
| `tech_audit.py` | 29 pass, 20 warn, 2 fail (both: the bare domain) |
| `verify_publish.py` | 46 of 50. The 4 failures are the llms.txt and old-slug items that Version 46 should fix |
| `surface_audit.py` | 12 of 18 pass, 2 unchecked (LinkedIn, X), 4 fail (itch page x2, live llms.txt, artist FAQ) |
| Jev accuracy gate, 10 live static pages | 10 of 10 pass |
| Jev accuracy gate, itch body | BLOCKED: on-chain scores 0.75, rewards 0.93, play-to-earn 0.60 |
| Tests / typecheck / build (repo) | 29 tests pass, typecheck clean, build ok |
| Dependency audit | 30 advisories, 0 reach the shipped bundle |

## Findings, ranked

### High

**H1. The bare domain `smokegame.win` does not resolve.** dns.google returns NOERROR with no A or AAAA; NameSilo
holds only the `www` CNAME, two `.www` ICP records and a Google verification TXT. Yet the live homepage text says
"play in your web browser at smokegame.win", the noscript text says the same, and the itch body says "play at
smokegame.win". An answer engine that quotes our own sentence sends people to a dead address, and a search for
"smokegame.win" returns nothing about us. Owner: founder (NameSilo write access; the stored key is read-only).
Fix and verification are in `.claude/skills/dns-apex-fix/SKILL.md`. Recommended: Fix B (301 apex to www), scoped to
the apex only, because the skill records that URL forwarding once overwrote the `www` CNAME and looped the site.
I verify afterwards from dns.google and `curl -I`.

**H2. The live `/faq/not-the-artist/` page states something false.** It says "Is Lil Blunt a real recording
artist? No." and "Any similarity in name or style to a real person is coincidental." A real artist exists: the
Memphis duo Indo G & Lil' Blunt (Wikipedia, Spotify, Apple Music), and searching "Lil Blunt" returns only them.
This is Caffeine's rewrite (1.1k characters); our repo page is 4.2k and does not say it. Owner: Caffeine round.
Draft, gated by Jev: `marketing/aeo/outbox/round5-artist-faq.md`. `surface_audit.py` now flags the denial.

**H3. The itch page body still carries blocked claims.** Title and tagline were fixed by the founder. Still
present: "Collect on-chain Blunts and own your character upgrades", "your progress is truly yours", "Connect your
wallet to save progress permanently and trade rare items", "on-chain saves and NFT collectibles", plus the stage
name "Neon Spore Forest", which is in no game file. Owner: founder (edit on itch; paste block 6 of
`marketing/itch/page-content.md`). Evidence the claims are premature: the game's shipped `config.json` has
`survivor_badge_erc721` empty and `icp.leaderboard_canister_id` empty, so no badge mint and no on-chain
leaderboard can run. Not a problem: "Arrow keys / WASD", which is accurate (see corrections).

**H4. Production serves Caffeine boilerplate as `/llms.txt`.** 637 bytes, calls the game "a web application
built with Caffeine". It was fixed once before and regressed. `/llms-full.txt` and `/.well-known/llms.txt` return
the HTML app shell with 200. Version 46 (draft) is meant to fix this and add a `llms-full.txt` marker; unverified.

### Medium

**M5. Version 46 is unverified.** Caffeine says its backend and browser tests did not pass and sent no changed-file
list; its chat agent cannot read files or logs (chat index 505). Live is 45, draft is 46, so nothing published on
its own. I cannot open the draft: Chromium here rejects the sandbox proxy certificate and I will not bypass TLS.
Options in the decisions sheet.

**M6. Search Console is probably already set up, under another Google account.** NameSilo has
`google-site-verification=7qJZvsiu...` at the apex. The Google account connected here has no property, and
Searchata wants a card for a trial. Connecting the account that owns the property unlocks impressions, clicks,
index coverage and Core Web Vitals, none of which exist today (CrUX and PageSpeed are both unavailable to me).

**M7. A "Connect Wallet" button on the homepage.** `Hero.tsx:322` labels the Internet Identity sign-in "Connect
Wallet", and a search engine's snippet for the homepage reads "Play Game Connect Wallet". It contradicts "no
wallet" everywhere else. The game itself also has an optional wallet button in its main menu (CONNECT RABBY), so
the accurate wording is "no wallet required", not "no wallet". Founder decision (deferred copy).

**M8. Repo and production have drifted.** `assess.py` lists page titles that differ on 6 pages, the canonical entry
absent from live `/about/` and `/how-to-play/`, and "24 uncommitted files" before this session. Our rich pages
never shipped and Caffeine rewrote some for the worse (H2). Structural fix: a source diff through
`caffeine_local_setup` (needs your consent to install the CLI), or accept the repo as notes only.

**M9. No security headers.** Missing: Content-Security-Policy, X-Content-Type-Options, X-Frame-Options,
Referrer-Policy, Permissions-Policy. `Access-Control-Allow-Origin: *`. HSTS is present. This is the Internet
Computer boundary and asset canister, not our code; whether Caffeine exposes `.ic-assets.json5` header rules is
unknown. Low practical risk for a static, no-form site; worth one question to Caffeine.

**M10. Soft-404s.** Unknown paths return 200 with the app shell and a canonical to `/`. Platform behaviour. Harmless
unless something links to a bogus URL.

### Low

- Meta length: home description is 245 characters (search results show about 155), two FAQ titles run 67 and 75.
- Two `<h1>` tags on the homepage in the crawler view (static fallback plus app hero).
- og:image alt text says "frontier outlaw" and the meta description says "Web3", both deferred founder items.
- The open web knows the game only through itch (old title and old URL still in browse listings) and the site.
  No third-party page describes it, so there is little else to correct and little else citing us.
- LinkedIn and X post text cannot be fetched without a login; paste them into `marketing/aeo/surface_text/`.

## What is healthy

HSTS, www 308 redirect, canonical on every page, sitemap valid and www-only (11 URLs, no llms.txt), robots allows
all major AI crawlers explicitly, JSON-LD parses everywhere (VideoGame, WebSite, Organization), og:image 200
and 152 KB, crawler and browser views match at 98 to 99 percent (no cloaking), itch old slug 302 to the new one,
all external links carry rel="noopener", no eval or unsafe HTML, no secrets in git history, privacy and terms
exist, background video present in the live bundle, and smokegame.win is the number 1 result for the exact name
"Lil Blunt: The Smoke Realm".

## Corrections to my own earlier statements

1. I called "Arrow keys / WASD to move and jump" on the itch page false. It is true: `project.godot` binds A, D,
   Left, Right (move), Space and W (jump), Enter and J (attack), Shift, K, E. Removed from the audit.
2. I said itch blocks this host. It only rejects crawler user agents; a browser UA reads the page.
3. I reported Card 1 and 7 acceptance tests I had not run, and a draft gated "PASS" that I never gated.

## Could not verify

Draft Version 46 contents and its test failures; Core Web Vitals and Lighthouse (no property, API quota);
rendered-browser console errors (proxy certificate); LinkedIn and X text; where the DIAMONDS sites are served;
what the live itch page looks like to a logged-out search crawler versus a browser.
