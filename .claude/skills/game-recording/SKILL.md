---
name: game-recording
description: Capture real Lil Blunt gameplay by serving the Godot HTML5 build locally and recording it from a headless browser, then compose it to 9:16. Use when asked to record gameplay, make a gameplay video or trailer, capture footage of the game, or produce a vertical clip for a client or ad.
---

# Recording the Game Locally

This works. It is the way around the sandbox's browser being unable to reach
the public internet: **127.0.0.1 is exempt from the egress policy**, so a
locally served copy of the game renders in a real browser and can be captured
frame by frame.

Read `gameplay-capture` for what is still *not* possible (skilled play, boss
fights). This skill is the part that does work.

## Two capture paths

**Xvfb + x11grab (preferred).** `marketing/recorder/record_xvfb.sh 60 out.mp4`
runs a real X server, puts the browser on it, and lets ffmpeg grab the display
at a constant 30fps. Output is full 1920x1080 at real-time pacing. Input goes
through `xdotool`, which talks to X directly — CDP input over Xvfb kept missing
the menu because the infobars changed the viewport aspect and moved every
element. `--disable-infobars --test-type` removes those banners; without them
they appear in the recording and steal ~104px.

**CDP screencast (fallback).** `record_game.mjs` captures frames from a
headless browser with no X server. Lower and irregular framerate, but it emits
a manifest with per-frame timestamps and named marks, which makes precise
segment extraction easy.

Both feed the same composer:
`compose_vertical.py --video out.mp4 --ss 12 --t 20` for the x11grab path, or
`--rec /tmp/rec --segment a:b` for the frame path.

## The pipeline

```bash
# 1. Get the build (once). The embed URL is in the itch.io page HTML.
curl -sSL https://youngstunners88.itch.io/lil-blunt-adventure -o /tmp/itch.html
grep -oE 'html-classic\.itch\.zone/html/[0-9-]+/index\.html' /tmp/itch.html
# then fetch index.html, index.js, index.wasm, index.pck, index.png,
# index.audio.worklet.js, web3.js from that base into /tmp/game

# 2. Serve with the headers Godot 4 needs
python3 marketing/recorder/serve_game.py --dir /tmp/game --port 8900 &

# 3. Record
node marketing/recorder/record_game.mjs --url http://127.0.0.1:8900/ --out /tmp/rec

# 4. Compose to 9:16
python3 marketing/recorder/compose_vertical.py --rec /tmp/rec \
    --segment stage1_start:stage1_end --speed 1.4 --out gameplay.mp4
```

## Things that will waste an hour if forgotten

- **Godot 4 needs cross-origin isolation.** `python3 -m http.server` serves no
  COOP/COEP and the engine never starts. `serve_game.py` sets them.
- **The controls are A/D, not arrows.** The game's own HUD says
  `MOVE A/D · JUMP W/Space · ATTACK J · DASH K`. Arrow keys are unbound, so an
  arrow-key script produces a recording of a character standing still.
- **There is an email-capture modal after PLAY.** It must be dismissed (the
  SKIP button) or the run never reaches gameplay.
- **SwiftShader is the renderer**, so capture lands around 5–7 fps. Compose
  with `--speed 1.4` or higher; the motion reads far better and the low rate
  stops being obvious.
- **Strip the itch.io wrapper script** from index.html. It is an external
  fetch that fails under COEP and adds console noise.
- **The game logs its own state.** `[BUILD]` lines and offline-mode warnings
  in the console confirm the build actually booted — worth reading.

## Driving it

The action sequence is `marketing/recorder/shots.json`, not code, so shots can
be re-cut without touching the recorder. Steps: `mark`, `wait`, `click`
(fractional coordinates — the game is one canvas, so there is nothing to
query), `tap`, `hold`, `release`, `run`, `shot`.

`mark` labels moments; `compose_vertical.py --segment a:b` trims between two
marks. Take a `shot` at each stage while iterating — it is the only way to see
where a click actually landed.

## Honest limits

The `run` step holds a direction and jumps on a cadence. That produces genuine
motion, real score, and real pickups — verified going 60 → 340 points with
diamonds and TitanX collected. It is **not** skilled play, and it will not
reach a boss. For boss footage a human has to play; then use
`marketing/cut_gameplay.py` on their recording instead.

Never present automated footage as a skilled run, and never imply the montage
shows content it does not.

**Consider not shipping it at all.** Asked to review this, Kimi made the point
that matters: in a game whose pitch is high-score chasing, footage of clumsy
play reads as *janky game*, not *hard game* — and a bad video ad underperforms
no video ad while poisoning the comparison against the image set. The recorder
is genuinely useful for QA, for checking a build boots, and for grabbing stills.
Using its output as the hero creative because the tooling exists is a
sunk-cost decision. A human recording one clean 20-second run clears that bar;
no boss is needed, just competent movement.
