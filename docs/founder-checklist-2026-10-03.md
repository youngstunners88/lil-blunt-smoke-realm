# Your two jobs (about 5 minutes) - 2026-10-03

Both checked today: the itch page still has the old text, and `smokegame.win` still has no address. `www.smokegame.win` is fine.
After each job, tell me. I check it from the outside and report LIVE or not.

---

## Job 1: fix the itch.io page (3 minutes)

Why: it still promises on-chain saves, NFT collectibles, "connect your wallet" and "trade rare items". The game can't do those today
(its NFT badge setting and on-chain leaderboard are empty). AI answers quote this page more than our own.

1. Open https://youngstunners88.itch.io/smokerealm/edit and sign in.
2. **Title:** change `The Smoke Realm` to exactly `Lil Blunt: The Smoke Realm` (the full name keeps it from being mixed up with the rapper).
3. **Do not touch the URL box.** It must stay `smokerealm`.
4. **Description:** click into the big text box, select everything (Ctrl+A or Cmd+A), delete it, and paste the text below. If the editor has a
   "Source" or "HTML" button, ignore it and just paste as plain text.
5. Scroll to the bottom and click **Save**.
6. Open https://youngstunners88.itch.io/smokerealm in a private window and check the text matches. Then tell me "itch done".

Paste this (checked: Jev accuracy gate passes, no invented names, audit passes):

```
Lil Blunt: The Smoke Realm is a free 2D side-scrolling platformer and arcade
score-chaser playable in a web browser on desktop or mobile. Built in Godot 4
and exported to HTML5, the Wild West video game stars the mascot Lil Blunt,
who throws axes and faces Tax Collector enemies across three stages, Smoke
Realm, Crystal Caverns and Gold Rush, each ending in a boss. No download, no
account and no crypto wallet, with nothing to buy.

You are Lil Blunt, a green leaf mascot working the Smoke Realm.

Run, jump and dash your way deeper, grab what you can carry, and keep your
score climbing before your lives run out. The Tax Collector shows up to take his
cut. He always does.

CONTROLS
  A / D or Left / Right arrow   move
  Spacebar or W                 jump
  J or Enter                    throw axes
  Shift                         sprint
  K                             dash
  E                             interact
  On phones and tablets, on-screen touch controls appear.

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

---

## Job 2: make `smokegame.win` work (2 minutes)

Why: our own homepage and the itch page say "play at smokegame.win", but that address has nowhere to go, so people typing it get an error.

1. Log in to NameSilo, open **Domain Manager**, click **smokegame.win**.
2. Open **URL Forwarding**.
3. Add a forward: **Source** `smokegame.win`, **Destination** `https://www.smokegame.win/`, **Type** `301 Permanent`.
4. **Apply it to the main domain only.** If there is any option that also applies it to `www` or all subdomains, leave it OFF.
   (Last time forwarding replaced the `www` record and the whole site looped. That is the one thing to avoid.)
5. Save. Tell me "domain done".

I then check from outside that `www.smokegame.win` still loads and `smokegame.win` lands on it. If `www` ever shows an error, delete the
forward right away and tell me; the fix is in `.claude/skills/dns-apex-fix/SKILL.md`.
