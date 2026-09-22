# Exporting a Godot 4.3 game to HTML5 and hosting it on the Internet Computer

A build-and-deploy writeup from shipping *Lil Blunt: The Smoke Realm*, a 2D
platformer, as a browser game hosted on the Internet Computer (ICP). It focuses
on the two things that actually cost us time — a Godot web-export setting that
fails silently, and a hosting quirk specific to ICP asset canisters — because
both are the kind of problem you only find after the thing is "done" and looks
broken for no visible reason.

This is a devlog draft. Publish it to a devlog / dev.to / Hashnode; it is
written to be genuinely useful to other developers on the same stack, not as
marketing.

## The stack

- **Godot 4.3**, exported to HTML5 (WebAssembly + WebGL2).
- Hosted two ways: on **itch.io** as an embedded browser game, and on the
  **Internet Computer**, where the site is served from a canister rather than a
  conventional web host.
- No game engine changes for the web target — the interesting work is entirely
  in the export configuration and the host.

## Trap 1: the threaded web export that silently will not boot

This is the one that will cost you an afternoon if you do not know it up front.

Godot 4's web export has a **threads** variant. If threads are enabled, the
build depends on `SharedArrayBuffer`, and `SharedArrayBuffer` is only available
to a page served with **cross-origin isolation** — specifically these two
response headers:

```
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
```

On a host you fully control, you can set those and move on. The problem is
**embedded contexts**: itch.io serves your game inside an iframe, and many
mobile browsers and previewers do not present those headers to the framed
document. When `SharedArrayBuffer` is absent, a threaded Godot build does not
throw a friendly error — it **silently fails to boot**. You get a black canvas
and a console message about `SharedArrayBuffer is not defined`, on a build that
runs perfectly on your own machine.

The fix is to export **non-threaded**. In the web export preset:

```
variant/thread_support=false
```

A non-threaded build needs no `SharedArrayBuffer`, needs no COOP/COEP headers,
and therefore boots inside itch.io's iframe, in mobile browsers, and in
previews. For a 2D platformer the loss of worker threads is not something a
player will notice.

Two follow-on notes from doing this for real:

- If you migrated an export preset from Godot 3.x, delete the old threading
  keys (`web/use_threads` and friends). Stale keys can leave a threaded
  `index.worker.js` artifact around that overrides your intent. Confirm the
  exported directory has **no** `*.worker.js` file.
- Pin `variant/thread_support=false` in whatever automates your export (a
  script or CI step), not just in the editor, so a future export cannot quietly
  regress it.

## Trap 2: audio that cuts off, and why it is the host, not the file

The second issue only appears once you host on the Internet Computer, and it
presents as a content bug when it is actually a transport one.

Background music started, played for a few seconds, and stopped partway
through. The obvious suspect — a truncated audio file — was wrong: the file on
disk was complete and its checksum matched the original upload. The cause was
**HTTP Range requests**.

An HTML `<audio>` (or `<video>`) element streams media by issuing Range
requests — "give me bytes 0–N", then more as it plays. **ICP asset canisters
serve certified assets without reliable Range support.** A media element that
cannot continue its Range requests plays only what it managed to buffer on the
first request, then stops. From the browser it looks exactly like a file that
was cut short.

The fix is to bypass streaming entirely: `fetch()` the whole file, turn it into
a `Blob`, and point the element at an object URL.

```js
const res = await fetch(TRACK_URL);
const blob = await res.blob();
audio.src = URL.createObjectURL(blob);
// ...and URL.revokeObjectURL() on cleanup.
```

Now the whole asset is in memory before playback, no Range request is needed,
and `loop` behaves. Keep a `.catch()` that falls back to the plain path so a
fetch failure degrades to streaming rather than to silence. This applies to any
media you serve from an ICP canister, not just one track.

## What hosting on ICP actually buys, and what it does not

Worth being precise, because "Web3 game" is a phrase that oversells this. What
is genuinely unusual is that the **entire front end** is served from an
on-chain canister rather than the more common pattern of a normal website plus
one token contract. There is no wallet requirement to play; optional sign-in
uses Internet Identity (device biometrics or a passkey), not a seed phrase.

What it is not: it is not a play-to-earn game, nothing is minted by playing, and
scores are not written to a chain today. The chain here is the web host, and
that framing — host, not casino — is the accurate one.

## Checklist if you are doing the same thing

1. Export **non-threaded** (`variant/thread_support=false`). Verify no
   `*.worker.js` in the output.
2. If you also host somewhere you control and want threads there, set COOP
   `same-origin` + COEP `require-corp` — but keep a non-threaded build for
   itch.io and mobile.
3. For any media served from an ICP canister, **fetch-to-blob** instead of
   relying on Range requests.
4. Test inside the real embed (itch.io iframe, a phone), not only on your
   desktop, because the failures above are invisible on the desktop.
