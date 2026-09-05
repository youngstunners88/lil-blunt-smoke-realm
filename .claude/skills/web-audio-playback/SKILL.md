---
name: web-audio-playback
description: Diagnose and fix background music / audio playback bugs on this site — a track that cuts off partway, won't loop, won't autoplay, or a play/pause button that doesn't toggle. Use whenever the user reports the song stopping early, not playing "in totality", not looping, or the audio button behaving wrong.
---

# Web Audio Playback on the Smoke Realm Site

Background music lives in `src/frontend/src/components/AmbientAudioPlayer.tsx`
and is mounted once in `App.tsx`. The track file is
`src/frontend/public/assets/audio/theme.mp3`.

## Diagnose before you change code

Run these checks in order. Each rules out a whole class of cause.

### 1. Is the file itself truncated?

```bash
ls -la src/frontend/public/assets/audio/theme.mp3
md5sum src/frontend/public/assets/audio/theme.mp3 <path-to-original-upload>
```

Matching md5 and byte size means **the file is fine — stop blaming the asset**.
The bug is in delivery or playback code. This is the most common false lead:
the song sounds truncated in the browser while the file on disk is complete.

### 2. Is the deployed copy the real file?

The GitHub repo and the Caffeine project are **separate codebases**. Pushing a
binary to GitHub does not put it in the Caffeine build. If the song is correct
locally but wrong on the deployed site, the deployed asset is probably missing
or was replaced by a generated placeholder. Verify by fetching the deployed URL
and checking `content-length` against the local file size.

### 3. Is it a Range-request problem? (the usual culprit here)

ICP asset canisters serve certified assets **without reliable HTTP Range
support**. A media element that cannot issue range requests plays only what it
buffered and then stops — which presents exactly as "the song cuts off."

The fix is to bypass streaming entirely: `fetch()` the whole file, convert to a
`Blob`, and set `audio.src` to an object URL. Always keep a `.catch()` that
falls back to the plain path so a fetch failure degrades to streaming rather
than silence, and `URL.revokeObjectURL()` on cleanup.

## Known bug patterns in this component

### Autoplay-unlock listener fighting the toggle button

Browsers block unmuted autoplay, so the component registers a document-level
"first user gesture" listener to start playback. **That listener must exclude
clicks on the toggle button itself.** Otherwise, on a user's first-ever click:
the gesture listener starts playback → the button's own click handler then
reads `audio.paused === false` → immediately re-pauses. The button looks broken.

Guard with `buttonRef.current.contains(event.target)` and return early.

### Autoplay fallback overriding a deliberate pause

Track explicit user intent in a ref (`userPausedRef`). The gesture/retry path
must check it and bail — otherwise a stray page interaction resumes music the
user deliberately silenced.

### JSX `<audio>` element instead of a persistent object

Prefer a single `new Audio()` created once inside `useEffect`. A JSX `<audio>`
re-evaluated across renders can drop playback state and make `loop` unreliable.

### `loop` stalling at the end

Belt-and-braces: also handle `ended` by setting `currentTime = 0` and calling
`play()` again. Some browsers stall `loop` when the original source was a
partial stream.

## Rules

- Set a modest default volume (`0.35`) — this is ambient background music.
- Every `audio.play()` call needs a `.catch()`; it rejects on blocked autoplay.
- Keep the play/pause state driven by the audio element's own `play`/`pause`
  events, never by optimistic local state — otherwise the icon lies.
- The `useMediaCaption` lint rule does not apply to instrumental background
  music. If a JSX `<audio>` element is used, suppress with a `biome-ignore`
  comment stating the reason.

## After changing the component

```bash
cd src/frontend && pnpm fix && pnpm build
```

Then revert `dist/` before committing — it is a build artifact tracked from an
old export, not something to hand-update:

```bash
git checkout -- src/frontend/dist
```
