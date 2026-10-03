---
name: paid-campaign-launch
description: Launch and run low-budget paid ad tests for Lil Blunt (image ads, platform choice, minimums, targeting, UTM tracking, what a small budget actually buys). Use when asked to run ads, boost a post, spend an ad budget, pick an ad platform, build ad creative, or set up a marketing campaign.
---

# Paid Campaign Launch — Lil Blunt

## What a small budget actually buys (say this out loud)

At $10–$50 total, paid ads are a **creative signal test**, not growth. Typical
returns at $10: roughly 1,500–4,000 impressions and 10–40 clicks. That is
enough to compare two creatives against each other and nothing more. Never
present a sub-$50 test as a growth campaign, and never project revenue from it.

The honest framing every time: *paid at this level buys you data; organic buys
you players.* Recommend running both, and be clear which is which.

## Platform minimums (verified Aug 2026 — re-verify before promising)

| Platform | Hard minimum | Fits a $10 test? | Audience fit |
|---|---|---|---|
| **X (Twitter)** | No platform minimum | **Yes — fully spendable** | Best. Crypto/Web3-native, and the brand already lives here (@smokering25) |
| **Reddit** | $5/day, **$25 lifetime** | Partially — the lifetime floor can block a $10 campaign; try $5/day × 2 days | Excellent gaming intent (r/WebGames, r/playmygame, r/IndieGaming) |
| **TikTok** | ~$20/day campaign, $5/day ad group | No | Good reach, wrong budget |
| **Meta** | ~$1–5/day | Yes, but house rules exclude it | Broad, low intent |
| **Pinterest** | Low | Yes | Weak — nobody searches Pinterest for browser games |

Default recommendation for a $10 test: **X**. Fall back to Reddit at $5/day × 2
if X's account setup stalls.

## Accuracy rules (blocking — inherited from AGENTS.md)

Ad copy is public copy. The `doNotBuild` constraint applies in full:

- **Safe:** free to play, no wallet needed, no download, runs in the browser,
  hosted on ICP, Wild West/cannabis/gold-rush theme, high-score chasing.
- **Never:** players earn tokens, airdrops, or NFTs; play-to-earn; scores are
  recorded on-chain; the leaderboard is live or publicly verifiable.

The `$GOLD` and `$DIAMONDS` branding belongs to **separate partner protocols**
(`mine4gold.app`, `diamonds1111.win`) — not to game rewards. Hero art may show
that branding; ad *copy* must never imply playing the game yields those assets.

## Creative

Render every size from one hero image:

```bash
python3 marketing/ads/render_image_ad.py --source <hero.png> --variant all
```

Outputs `marketing/ads/out/<variant>/` at 4:5, 1:1, 1200x628, 2:3, 9:16.
Three copy variants (a/b/c) ship by default — always test at least two so the
spend produces a comparison rather than a single unreadable number.

Creative rules for this brand's art, which is dense and detailed:
- Text never floats on bare art — it sits in the bottom scrim the renderer adds.
- Never cover the character's face or the product bags.
- Four words max per line; the headline carries one idea.
- The CTA pill is the only button-like element in frame.

## Tracking — do this before launching, not after

Every destination URL gets UTMs, or the spend teaches you nothing:

```
https://www.smokegame.win/?utm_source=<x|reddit>&utm_medium=paid_social&utm_campaign=lilblunt_launch_test&utm_content=<variant-a|b|c>
```

`utm_content` is what separates the variants — it is the whole point of the
test. Read results from the platform's own dashboard; the site has no
conversion pixel wired up, so in-platform CTR is the metric that exists.

## Judging the test

With ~$10 split across two variants, only one comparison is statistically
honest: **relative CTR between variants.** Do not read anything into absolute
conversion counts at this sample size. If one variant beats the other by less
than roughly 30% relative, call it a tie and pick on brand judgment instead of
pretending the data decided.

## What this agent cannot do

No tool in this environment can create a paid campaign on any platform:
Windsor.ai's TikTok/X connectors are read-plus-limited-write (pause, enable,
budget) with **no create-campaign action**, no ad-platform tokens exist in the
environment, and browser automation cannot reach the public internet from this
sandbox (see `gameplay-capture`; re-verified Aug 2026 with the agent proxy
correctly configured — still `ERR_CONNECTION_RESET`).

So the split is fixed: **this agent builds creative, copy, targeting, and the
tracked URLs; the founder does the final upload-and-launch clicks.** Say that
up front rather than discovering it at the end of the task.

## Organic — the part that actually moves numbers at this budget

Free and higher-yield than a $10 test. See `game-distribution` for the drafting
rules. Priority order for this game:

1. **r/WebGames, r/playmygame, r/IndieGaming** — real gaming intent, free,
   thousands of potential plays. Post as a developer sharing work, never as an
   ad; read each subreddit's self-promo rules first.
2. **X organic** from @smokering25 — the hero image plus the hook, link in reply
   (not the main post; links suppress reach).
3. **itch.io page** — already live; make sure it points at smokegame.win.
