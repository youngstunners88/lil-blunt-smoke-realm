# itch.io page — fill-in pack

The itch.io API is **read-only**: six endpoints, no PATCH or PUT, nothing that
edits page metadata. No MCP server can change any of this, because there is no
endpoint behind it. So this pack exists to turn the form into a paste job.

Edit at: https://youngstunners88.itch.io/lil-blunt-adventure/edit

Run `python3 marketing/itch/audit.py` afterwards to confirm the blocking
fields are populated.

---

## BLOCKING — do these two first

### 1. Cover image

**Upload:** `marketing/itch/out/cover-630x500.png` (630x500, generated from the
hero art by `make_cover.py`).

This is the single highest-impact fix available. Every itch.io browse listing,
search result, embed card and collection tile is a thumbnail. With no cover the
game is visually absent from the store regardless of how good the page is.

> One caution on this particular image: it features the $GOLD and $DIAMONDS
> branded products prominently. Those are separate partner protocols, not
> things the game awards. On a *game store* page that can read as "play to earn
> these". A gameplay screenshot would be both safer and, for a store listing,
> usually higher-converting — players want to see the game. Swap it once the
> theme question below is settled.

### 2. Short description / tagline

Currently empty. This is the line under the title in every listing, and what
social cards and search results pick up.

```
Free browser platformer. No download, no wallet, no account — just play.
```

63 characters — inside itch's ~120 character display limit.

---

## Title — decide before editing

The page says **"Lil Blunt Adventure"**. The website brands it **"Lil Blunt:
The Smoke Realm"**. Two names for one game split recognition across both, and
neither accumulates.

Recommendation: rename the page to `Lil Blunt: The Smoke Realm`. The URL slug
can stay `lil-blunt-adventure` — changing a live slug breaks every existing
link, and 273 views' worth of referrals is not worth resetting.

---

## Embed settings

**Enable fullscreen.** Currently off, at a 1280x720 frame. For a platformer
that is a genuine playability limit — players cannot see enough of the level.

Also worth setting: "click to launch" rather than autoplay, so the game has
keyboard focus from the first frame. Focus is the second most common reason a
player thinks the controls are broken.

---

## Controls block — paste into the description

These are verified against the build, and the current site copy is **wrong**
about them (it says arrow keys, which are not bound):

```
Controls
  A / D      move
  W or Space jump
  J          attack
  K          dash

The arrow keys are not bound. Click the game once so it has keyboard focus.
```

---

## Tags

itch.io allows up to 10 and runs its own internal search on them. Safe,
accurate ones regardless of the theme question:

```
2d, platformer, arcade, html5, singleplayer, pixel-art, high-score, free
```

Do **not** add `wild-west` or `western` until the theme question below is
resolved. Do not add `web3`, `nft`, `play-to-earn`, or `crypto` — they are
inaccurate here and they attract exactly the audience that will be
disappointed.

---

## Description body — BLOCKED, needs your answer first

I have not written this, because writing it now would mean guessing.

**The recorded gameplay does not match the site's description.** Footage of
build `2026-08-26d` shows a **pink mushroom fantasy forest**, not the "1800s
Wild West mining town" and "Dustrock Mines" the website describes. The HUD in
that footage reads: `COINS · RINGS · TOKENS · GOLD · DIAMONDS · TITANX · wBTC ·
XAUT · BLAZE DIAMONDS · VESTING 0%`.

Two things need settling before store copy can be written honestly:

1. **What is the game's actual setting?** If the mushroom forest is one area of
   several and the game is broadly Wild West, the copy stands and the
   screenshot choice just needs care. If the game is a fantasy platformer, then
   the site copy, the keyword targeting, and the ad set are all describing a
   different product — and someone arriving on a "wild west game" promise will
   bounce immediately.

2. **What do the token counters mean?** The site states plainly that playing
   awards no tokens, NFTs or airdrops. The game's own HUD shows GOLD, DIAMONDS,
   wBTC, XAUT and a VESTING percentage. Those may be purely cosmetic score
   counters, which is fine — but the store page has to say which, because a
   player seeing "VESTING 0%" will reasonably assume something accrues.

Answer those two and the description writes itself in ten minutes.

---

## Screenshots

Upload 4–5. `marketing/itch/out/` has frames pulled from real gameplay; regenerate
with different timestamps via `ffmpeg -ss <sec> -i <video> -frames:v 1 out.png`.

Pick frames showing *motion and threat* — a jump mid-air, an enemy close. A
static frame of scenery reads as a screensaver. Avoid frames where the score is
frozen; the capture bot stalls, and a stalled score is visible.
