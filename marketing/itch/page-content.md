# itch.io page — fill-in pack

The itch.io API is **read-only**: six endpoints, no PATCH or PUT, nothing that
edits page metadata. No MCP server can change any of this, because there is no
endpoint behind it. So this pack exists to turn the form into a paste job.

Edit at: https://youngstunners88.itch.io/lil-blunt-adventure/edit

Run `python3 marketing/itch/audit.py` afterwards to confirm the blocking
fields are populated.

---

## COPY-PASTE PACK — fill the form top to bottom

Every value below is final and verified. Paste each block into the matching
field on the edit page; write nothing of your own. The "why" for each choice is
in the sections further down. **The one thing you must change from what is live
now is the tagline — the current one makes a false on-chain claim (see BLOCKING
below).**

**1 — Title**
```
Lil Blunt: The Smoke Realm
```
(Leave the URL slug as `lil-blunt-adventure`. Changing a live slug breaks every
existing link.)

**2 — Short description / tagline** (the line under the title; ~120-char limit)
```
Free browser platformer. No download, no wallet, no account — just play.
```

**3 — Classification** → Kind of project: **HTML** · Genre: **Platformer**

**4 — Embed / uploads**
- This file will be played in the browser: **on**
- **Enable fullscreen.** (Currently off at a 1280×720 frame — a real
  playability limit for a platformer.)
- Frame: **Click to launch** (not autoplay), so the game has keyboard focus
  from the first frame.

**5 — Tags** (itch allows up to 10; paste as-is)
```
wild-west, western, 2d, platformer, arcade, html5, pixel-art, high-score, free, singleplayer
```
Do **not** add `web3`, `nft`, `play-to-earn`, or `crypto` — inaccurate here, and
they draw the audience most likely to be let down by a free score-chaser.

**6 — Description** (the main rich-text body)
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

**7 — Cover image & screenshots** — cover is already uploaded. Keep the 5
screenshots; prefer frames showing motion and threat (a mid-air jump, an enemy
close) over static scenery.

That is the whole form. Everything below is the reasoning and the accuracy
history, not new work.

---

## BLOCKING — accuracy, measured 2026-09-02

Re-measured against the live page. **The cover image and tagline are now
populated** — those are done. But the copy that was added states something the
website explicitly denies, and it is the most widely distributed text the
project has.

### 1. The tagline makes a false on-chain claim — replace it

The live `og:description` currently reads:

> Explore the Smoke Realm and **own your progress on-chain** — no wallet
> required to start. You can't tax the vibe..

And the description body contains:

> Free to play, no download… Web3-ready: **Collect on-chain Blunts and own
> your character upgrades.** Crypto-native but zero friction…

`AGENTS.md` records as blocking that scores are **not** written on-chain today,
that nothing is minted, and that there is no play-to-earn mechanic. The site's
own copy says "No token rewards and no NFT minting". So the itch page and the
website contradict each other, and the itch page is the one that is wrong.

Why this is the top item rather than a nitpick:

- `og:description` is what renders in **every Discord, Telegram and X share
  preview**. It is the single most-reproduced sentence about this game.
- Answer engines quote it. A contradiction between the store page and the hub
  is exactly the kind of inconsistency that gets surfaced.
- It promises ownership of assets that do not exist. Proof of Play is still
  being engineered; until it ships, this is a promise, not a description.

**Replacement tagline** (63 chars, inside itch's ~120 limit):

```
Free browser platformer. No download, no wallet, no account — just play.
```

**Replacement for the "What Makes It Different" bullets** — same energy, no
false claims:

```
Free to play, no download: runs instantly in your browser. No install, no wait.
No wallet, no account: start playing in one click.
Tight platforming: classic run-and-jump with modern responsiveness.
Hand-crafted levels: dig the Dustrock Mines and dodge the Tax Man.
Built on the Internet Computer: the whole game is served from a public chain.
```

That last line is true and is the genuinely unusual thing about the project —
the *site itself* is on-chain, which is rarer than a token contract. It earns
the Web3 interest without claiming rewards that do not exist.

Revisit this section when Proof of Play actually ships, and update it together
with `AGENTS.md`.

### 2. Tags — still empty

No tags found on the live page. itch runs its own internal search and browse
on tags, so an untagged game is close to undiscoverable on the platform that
already sends the most qualified traffic. See the Tags block below.

### Already done — do not redo

- **Cover image** is uploaded (`og:image` resolves).
- **5 screenshots** present.
- **2 links to smokegame.win** in the page body.

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
