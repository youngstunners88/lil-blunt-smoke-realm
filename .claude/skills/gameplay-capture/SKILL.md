---
name: gameplay-capture
description: What is and is not possible for capturing real Lil Blunt gameplay footage (Clipy recordings, screenshots, stage/boss clips) from this Claude Code remote/cloud session. Use before promising, attempting, or troubleshooting any gameplay recording, screen capture, or Clipy `record`/`session` command against the itch.io game or any external site.
---

# Gameplay Capture — Known Sandbox Limitation

**Headless browser automation cannot reach the public internet from this
remote session's container, at all.** This was verified directly, not
assumed:

```
Playwright chromium.launch({ proxy: { server: HTTPS_PROXY } })
  → page.goto('https://example.com/')  → net::ERR_CONNECTION_RESET
  → page.goto('https://itch.io/')      → net::ERR_CONNECTION_RESET
```

Both failed identically — `example.com` included — which rules out
anything itch.io-specific (CORS, embed restrictions, rate limiting) and
confirms it is this container's browser network path, not the target site.
`curl` through the same `HTTPS_PROXY` reaches both sites fine, so this is
specifically a browser-process limitation, not a proxy or DNS outage.

## The practical consequence

`clipy record --url <any page>` and `clipy session start --url <any page>`
both drive a headless Playwright Chromium under the hood. **They will fail
the same way**, regardless of whether a valid `CLIPY_API_KEY` is configured.
Do not spend time debugging a Clipy auth or config issue if the symptom is
`ERR_CONNECTION_RESET` on the very first navigation — it is this limitation,
not Clipy.

**Never fabricate gameplay footage or claim a recording was captured that
was not.** If asked for stage/boss clips, timed gameplay segments, or any
screen-recorded proof of the live game, and this limitation is still in
effect, say so plainly rather than producing a placeholder, an AI-generated
approximation, or silently substituting different content. An "ad" built
from footage that doesn't show the real game is a misrepresentation of the
product, not a shortcut — the project's own marketing rules
(`youngstunners88/GM-GAME` marketing docs) are explicit that accuracy is
structural, not optional.

## What DOES work from this session

- `clipy proof --frame <img>` — turns screenshots supplied by other means
  into a short proof video. Useful if the founder or another tool provides
  still frames.
- `clipy context import <youtube-url|loom-url>` — pulls captions/transcript
  client-side; worth trying since it may not depend on the same Chromium
  network path (uses `yt-dlp`/Loom's own transcript API, not a full browser
  navigation) — verify before relying on it.
- Anything read-only against Clipy's own API (`list`, `search`, `show`,
  `transcript`, `summary`, `moments`, `memory search`) once a key is set —
  these are plain HTTPS calls, not browser automation, and go through the
  working `curl`/`fetch` path.
- Seedance/MuAPI video generation (see `cinematic-video-continuity`) — also
  plain HTTPS calls, not a browser.

## What requires the founder's own machine

Real gameplay capture needs a real browser with real network access driving
real keyboard input against the actual Godot HTML5 export, ideally with a
human watching to confirm stage/boss transitions land where intended (no
vision-feedback loop exists here to auto-detect "boss 2 defeated"). That
means:

1. **Clipy Mac app** (https://clipy.online/download) + `clipy session start
   --source mac-screen` — records their real screen while they play.
2. **Clipy Chrome extension** — records inside their own logged-in tab.
3. Either way, a human plays through the stages; Clipy's `mark` and
   `chapter` commands tag the moments (stage starts, boss fights) as they
   happen, which is what makes the resulting `.arec` useful to a future
   agent.

Once that recording exists, hand its `clipy.online/video/<id>.arec` URL to
Claude Code — reading and acting on an *existing* recording (summarizing,
extracting moments, cutting an ad from it) is plain HTTPS and works fine
from this session.

## If this limitation is ever fixed

Re-verify with the exact test above before assuming gameplay capture works
again — don't take a general "browser now works" claim on faith; confirm
`page.goto('https://example.com/')` actually succeeds first.
