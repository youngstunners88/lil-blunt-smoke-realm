---
name: cinematic-video-continuity
description: Generate or extend the Seedance cinematic background video for this site as ONE continuous scene, never as independently-generated clips glued together. Use whenever asked to extend, lengthen, add characters/action to, or regenerate the site's background loop or any Seedance-based video asset.
---

# Cinematic Video Continuity

The site's background is a Seedance-generated video loop of the "Lil Blunt
Prospecting Co." canvas. This skill exists because the first extension
attempt got this wrong in a way that was subtle in testing and obvious to a
real viewer: two independently-generated clips, each reset to the same
static reference image, concatenated together. Numerically the seam looked
fine (SSIM ~0.92 against a ~0.74 baseline) — but "matches the same still"
and "continues the same shot" are different things, and the difference is
exactly what a human eye catches as a cut.

## The rule: continuation is chained, never independently generated

**Wrong** (what produced the visible cut): generate clip 2 conditioned on
the *original reference image* for both its start and end frame, then
concatenate clip 1 + clip 2. Both clips share a "set" but are different
"shots" — smoke position, dust, and lighting state don't match frame-to-
frame at the join, only the gross composition does.

**Right**: use a video-*extend* model, not a fresh first-last-frame
generation. Feed it:
- `video_url`: the actual preceding clip (its real last frame is what the
  model continues from — not a lookalike still).
- `last_image` (when the model supports it, e.g. `seedance-2.5-video-extend`):
  the original reference image, so the new segment interpolates back toward
  it and the loop still closes cleanly.
- `generate_audio: false` always — see the accuracy/silence rule below.

On MuAPI this is `seedance-2.5-video-extend` (or `-480p` for a cheaper draft
pass). Do not use `seedance-2-first-last-frame` for a continuation — that
model is for a fresh clip conditioned on two stills, which is exactly the
independently-generated-clip mistake described above.

To extend an existing site clip, that clip must be fetchable by URL fast
enough for the upstream fetcher (see the Range/fetch-speed note in
`web-audio-playback` and the URL-speed lesson below — the same constraint
applies to every Seedance call in this project). If it is not already
hosted somewhere fast, stage it: commit it to a throwaway path in the repo,
push, use the GitHub-raw URL, then remove the throwaway file once the
generation has consumed it.

## No hallucinated set pieces

A locked-camera continuation must not invent new architecture. The first
character-extension attempt added "a saloon maiden leans on a porch rail" —
a porch railing that does not exist in the reference image. That is exactly
the kind of addition the project's own rules forbid (no morphing or
hallucinated architecture; use only structures already present in the
shot). When new characters enter a locked shot, they enter and interact
using only what's already there — they do not bring new set dressing with
them. State this explicitly and repeatedly in the prompt: "use only
structures, signs, and terrain already present in the shot; do not add any
new building, porch, railing, board, sign, or object."

## Verify the loop numerically, not by eye

After any generation or extension, before shipping:

```bash
ffmpeg -i clip.mp4 -vf "select=eq(n\,0)" -frames:v 1 first.png
ffmpeg -sseof -0.5 -i clip.mp4 -frames:v 1 last.png
ffmpeg -i first.png -i last.png -lavfi "[0:v][1:v]ssim=stats_file=-" -f null -
```

An SSIM around 0.85–0.95 at the wrap against a clearly lower baseline
(compare first-frame to a random mid-clip frame) indicates the loop closes
without a hard jump. But SSIM alone does not catch "same composition,
different shot" — when extending, always confirm the new segment's *first*
frame was conditioned on the real preceding clip via `video_url`, not
regenerated from the reference still, before trusting any SSIM number.

## Audio

Every generation call sets `generate_audio: false` (or omits audio entirely
on models that default to silent). Strip audio again at encode time with
`-an` regardless — never trust the generator's own silence flag alone.
Verify with `ffmpeg -i out.mp4 2>&1 | grep -c Audio:` — must be 0. The
site's own theme music (`AmbientAudioPlayer`) is the only audio and must
never be competed with.

## Delivery path

See `web-audio-playback` and the SmokeBackground component's own comments
for why the video is served from jsDelivr pinned to a commit SHA rather
than from the Caffeine-deployed canister directly (Caffeine cannot pull
binaries from GitHub). Every time the video changes: commit, push, bump the
pinned SHA in `SmokeBackground.tsx`, confirm jsDelivr serves the new bytes
at that SHA before telling Caffeine to deploy.
