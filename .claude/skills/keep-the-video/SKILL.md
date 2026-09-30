---
name: keep-the-video
description: Protects the site's looping background video from being removed, replaced, or disabled. Use before ANY edit to SmokeBackground, the background, the hero, the page layout or theme, any Caffeine dispatch that touches the homepage or its styling, and whenever someone reports the video is missing, not playing, or shows a play button. The video may only be removed or replaced when the founder explicitly commands it in words.
---

# Keep the video

**The background video stays unless the founder explicitly says to remove or
replace it.** Not "simplify the page", not "improve performance", not "clean up
the hero", not a redesign. Those are not instructions to touch the video.

The founder has raised this repeatedly, with strong feeling. Treat it as a hard
constraint, like the accuracy rules in `AGENTS.md`.

## What counts as permission

Only a direct instruction naming the video, for example *"remove the
background video"* or *"replace the video with X"*. Inference does not count:

| Not permission | Why |
|---|---|
| "make the site faster" | Speed is not a reason to drop the main visual. Lazy-load or compress instead. |
| "improve readability" | Fix the panel and text over the video; leave the video. |
| "reduce the bundle / tidy components" | `SmokeBackground.tsx` is not dead code. |
| A failing test | Fix the code. Never delete a guard test to get green. |

If a task seems to require touching the video, **stop and ask the founder.**

## Four layers, so one mistake cannot remove it

1. **This skill** — the rule, and the diagnosis below.
2. **`SmokeBackground.test.tsx`** — fails if the `<video>`, either source, the
   pinned jsDelivr URLs, `muted`/`loop`/`playsinline`/`autoplay`, the poster, or
   the tap-to-start fallback disappears. Deleting or weakening it is itself a
   violation of this skill.
3. **`assess.py` live check** — fetches the *production* JS bundle and goes RED
   if the video markers are gone. The repo is not the deploy source (Caffeine
   builds from its own copy), so a green repo proves nothing about production.
4. **Every Caffeine dispatch** that touches the homepage must include the line
   in "Dispatch boilerplate" below.

## Diagnosing "the video is missing" — it usually isn't

**Check production before assuming it was removed.** On 2026-09-30 the founder
reported it removed, with a screenshot showing a large play triangle over the
page. The live bundle contained the mp4 and webm paths, `autoPlay`,
`playsInline` and the jsDelivr host. **The video was present.** That triangle is
the browser's own "autoplay blocked" button, which iOS shows in Low Power Mode
and some browsers show under data saver.

```bash
python3 marketing/aeo/assess.py --quick     # includes the live video check
```

| Symptom | Likely cause | Fix |
|---|---|---|
| Big play triangle, no motion | Autoplay blocked (Low Power Mode, data saver) | Already handled: first touch/click/key starts it. Confirm that build is live. |
| Static still image, no play button | Reduced-motion is on, **by design** | Nothing. The video is deliberately not rendered then. |
| Video never loads on desktop | `/assets/video/*` served from the canister, which falls through to `index.html` | Sources must be the pinned jsDelivr URLs, not a relative path. |
| Markers absent from the live bundle | Caffeine's copy lost the component | Real removal. Re-dispatch. |

## The reduced-motion gate is intentional

`useReducedMotion()` stops the `<video>` rendering at all for people who asked
their system for less motion. That is an accessibility requirement — see
`accessibility-statement`. It is **not** the video being removed and must not be
"fixed" to always render.

## Dispatch boilerplate

Paste into any Caffeine message that touches the homepage or global styling:

```
DO NOT remove, replace, disable or restyle the background <video> in
SmokeBackground. It is protected. Keep both sources (mp4 and webm) on the
pinned jsDelivr URLs, keep muted/loop/playsInline/autoPlay and the poster, and
keep the tap-to-start fallback. Only the founder can authorise changing it.
If any change seems to require touching it, stop and ask instead.
```

## When this hands off

| Situation | Go to |
|---|---|
| Contrast or layout over the video | `impeccable` |
| Reduced-motion and accessibility | `accessibility-statement` |
| What is actually live | `rapid-assessment` |
| Generating or extending the video asset | `cinematic-video-continuity` |
