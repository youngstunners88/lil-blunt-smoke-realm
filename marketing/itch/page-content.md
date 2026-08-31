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

```
Controls
  Left / Right arrow   move
  Spacebar             jump
  Enter                throw axes
  Shift                sprint
  K                    burst dash

Click the game once so it has keyboard focus.
```

---

## Tags

itch.io allows up to 10 and runs its own internal search on them. Safe,
accurate ones regardless of the theme question:

```
wild-west, western, 2d, platformer, arcade, html5, pixel-art, high-score, free, singleplayer
```

`wild-west` and `western` are confirmed accurate — use them, and drop a weaker
tag if you need the room. Do not add `web3`, `nft`, `play-to-earn` or `crypto`:
they are inaccurate here, and they attract exactly the audience that will be
disappointed by a free score-chasing platformer.

---

## Description body — paste into the page editor

Confirmed with the owner 2026-08-30: the Wild West framing is correct, and the
mushroom forest is an introductory area (Lil Blunt is a weed leaf, so the
opening is his own turf before the frontier). The HUD counters are score
counters, still in progress — so nothing below implies anything accrues.

```
Lil Blunt: The Smoke Realm is a free Wild West platformer that runs in your
browser. No download, no wallet, no account — click and play.

You are Lil Blunt, a green outlaw prospector working the Dustrock Mines.
Run, jump and dash your way deeper, grab what you can carry, and keep your
score climbing before your lives run out. The Tax Man shows up to take his
cut. He always does.

CONTROLS
  Left / Right arrow   move
  Spacebar             jump
  Enter                throw axes
  Shift                sprint
  K                    burst dash

Click the game once so it has keyboard focus.

WHAT IT IS
  · Free, and there is nothing to buy
  · No download and no install — it runs in the browser
  · No crypto wallet, no browser extension, no account needed
  · Built in Godot 4, hosted on the Internet Computer
  · Score chasing: every run is a fresh claim on the mine

Scores are shown on a demonstration board styled as an old-west wanted poster.
They are not recorded on a blockchain, and playing does not award tokens,
NFTs, or airdrops.

Also playable at smokegame.win
```

Every claim there is verified. The last paragraph is not boilerplate — it is
the line that keeps the page honest given the on-screen counters, and it
belongs in the description rather than buried in a FAQ.

## Screenshots

Upload 4–5. `marketing/itch/out/` has frames pulled from real gameplay; regenerate
with different timestamps via `ffmpeg -ss <sec> -i <video> -frames:v 1 out.png`.

Pick frames showing *motion and threat* — a jump mid-air, an enemy close. A
static frame of scenery reads as a screensaver. Avoid frames where the score is
frozen; the capture bot stalls, and a stalled score is visible.
