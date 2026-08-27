import { motion, useReducedMotion } from "motion/react";
import { useMemo } from "react";

/**
 * The background loop is served from jsDelivr rather than from this app's
 * own `public/` directory.
 *
 * Reason: the Caffeine project and the GitHub repo are separate codebases,
 * and the Caffeine builder cannot pull binary files across from the repo.
 * Requests for `/assets/video/*` on the deployed canister fall through to the
 * SPA's index.html (HTTP 200, `text/html`), so the `<video>` had no decodable
 * source and silently showed only the poster. jsDelivr serves the files
 * straight from the public repo with correct MIME types.
 *
 * The URLs are pinned to a commit SHA, so they are immutable and cacheable.
 * If these files are ever regenerated, bump the SHA — a branch-name URL would
 * silently serve stale or missing content.
 */
const VIDEO_CDN_BASE =
  "https://cdn.jsdelivr.net/gh/youngstunners88/lil-blunt-smoke-realm@238c4484ca17c8c38c0410e14ac580c1e44e3b92/src/frontend/public/assets/video";

const BACKGROUND_VIDEO_MP4 = `${VIDEO_CDN_BASE}/smoke-realm-background.mp4`;

/**
 * VP9 fallback. H.264 is proprietary and a few Chromium builds ship without
 * it — they report `canPlayType('video/mp4; codecs="avc1…"')` as empty and
 * fail the MP4 outright. The browser picks the first source it can decode,
 * so nearly everyone gets the smaller MP4 and only those builds pay for this.
 */
const BACKGROUND_VIDEO_WEBM = `${VIDEO_CDN_BASE}/smoke-realm-background.webm`;

/**
/**
 * Poster / base still. Served from THIS app, not the CDN, and deliberately
 * so: it is the layer that guarantees the page never renders on black. The
 * canister already hosts this file, whereas the CDN is a third party that
 * can be slow, blocked, or down. The video is an enhancement on top; the
 * background itself must not depend on anything outside the deploy.
 */
const BACKGROUND_POSTER_SRC =
  "/assets/generated/lil-blunt-prospecting-co-background.png";

/**
 * Fixed full-screen background for LIL BLUNT: THE SMOKE REALM — the
 * founder-supplied "Lil Blunt Prospecting Co." canvas: an 1800s American
 * mining town (wooden signs, steam train, lanterns, dusty main street,
 * mountains) infused with cannabis culture.
 *
 * The canvas is rendered as a seamless 10-second video loop generated from
 * that exact still, so the town is alive — smoke curls, lanterns flicker,
 * vegetation sways — without any camera movement. The still itself is the
 * poster and the fallback, so the composition is identical whether the video
 * plays or not.
 *
 * The video is dropped entirely when the user prefers reduced motion. If it
 * fails to decode it needs no error handling: the still is painted beneath
 * it and simply shows through. (An earlier `onError` that unmounted the
 * video was actively harmful — React's synthetic handler fires on the first
 * <source> failing, so it tore the element down before the browser could
 * try the WebM.) It is muted and carries no audio track — the site's own
 * theme music (`AmbientAudioPlayer`) is the only sound and must not be
 * disturbed.
 *
 * Layers, back to front:
 *   1. The still canvas (poster / reduced-motion / fallback).
 *   2. The looping video, when motion is allowed.
 *   3. A light readability wash + vignette, kept subtle so the scene stays
 *      visible beneath the UI.
 *   4. Three protocol particle families rising from the bottom:
 *        - Warm embers (SMOKE), blue crystals (DIAMONDS), gold ore (GOLD).
 *
 * Honors `prefers-reduced-motion`.
 */
export function SmokeBackground() {
  const reduce = useReducedMotion();

  // Deterministic particle positions so the DOM is stable across renders.
  const embers = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => ({
        id: i,
        left: `${(i * 7.3 + 3) % 100}%`,
        size: 2 + (i % 3) * 1.5,
        duration: 9 + (i % 5) * 2.5,
        delay: (i % 7) * 1.4,
      })),
    [],
  );

  // Blue crystal-glow particles — DIAMONDS protocol (sapphire crystal energy).
  const crystals = useMemo(
    () =>
      Array.from({ length: 10 }, (_, i) => ({
        id: i,
        left: `${(i * 9.7 + 6) % 100}%`,
        size: 3 + (i % 2) * 2,
        duration: 11 + (i % 4) * 2.5,
        delay: (i % 5) * 1.6,
      })),
    [],
  );

  // Gold-ore shimmer particles — GOLD protocol (warm metallic ore).
  const goldOre = useMemo(
    () =>
      Array.from({ length: 10 }, (_, i) => ({
        id: i,
        left: `${(i * 10.5 + 2) % 100}%`,
        size: 2.5 + (i % 3) * 1.5,
        duration: 10 + (i % 4) * 2,
        delay: (i % 6) * 1.3,
      })),
    [],
  );

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      {/* Founder-supplied cinematic canvas — poster, reduced-motion state,
          and fallback if the video cannot load. Always painted so there is
          never a blank frame while the video buffers. */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${BACKGROUND_POSTER_SRC})` }}
      />

      {/* Seamless 10s loop of that same canvas. Silent by design. */}
      {!reduce && (
        <video
          className="absolute inset-0 size-full object-cover object-center"
          poster={BACKGROUND_POSTER_SRC}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
        >
          <source src={BACKGROUND_VIDEO_MP4} type="video/mp4" />
          <source src={BACKGROUND_VIDEO_WEBM} type="video/webm" />
        </video>
      )}

      {/* Light readability wash — kept subtle so the canvas stays visible */}
      <div className="absolute inset-0 bg-[oklch(0.08_0.02_270/0.22)]" />

      {/* Rising ember particles — SMOKE protocol (cannabis energy) */}
      {embers.map((e) => (
        <span
          key={`ember-${e.id}`}
          className="ember"
          style={{
            left: e.left,
            bottom: "-2%",
            width: e.size,
            height: e.size,
            animationDuration: `${e.duration}s`,
            animationDelay: `${e.delay}s`,
            animationPlayState: reduce ? "paused" : "running",
            opacity: reduce ? 0 : undefined,
          }}
        />
      ))}

      {/* Rising crystal-glow particles — DIAMONDS protocol (sapphire) */}
      {crystals.map((c) => (
        <span
          key={`crystal-${c.id}`}
          style={{
            position: "absolute",
            left: c.left,
            bottom: "-2%",
            width: c.size,
            height: c.size,
            borderRadius: "9999px",
            background:
              "radial-gradient(circle, oklch(0.82 0.16 195 / 0.85), oklch(0.62 0.17 250 / 0.25) 60%, transparent 70%)",
            filter: "blur(1px)",
            animation: reduce
              ? undefined
              : `ember-rise ${c.duration}s linear infinite`,
            animationDelay: `${c.delay}s`,
            animationPlayState: reduce ? "paused" : "running",
            opacity: reduce ? 0 : undefined,
          }}
        />
      ))}

      {/* Rising gold-ore shimmer particles — GOLD protocol (warm metallic) */}
      {goldOre.map((g) => (
        <span
          key={`gold-${g.id}`}
          style={{
            position: "absolute",
            left: g.left,
            bottom: "-2%",
            width: g.size,
            height: g.size,
            borderRadius: "9999px",
            background:
              "radial-gradient(circle, oklch(0.9 0.12 80 / 0.9), oklch(0.78 0.13 75 / 0.25) 60%, transparent 70%)",
            filter: "blur(1px)",
            animation: reduce
              ? undefined
              : `ember-rise ${g.duration}s linear infinite`,
            animationDelay: `${g.delay}s`,
            animationPlayState: reduce ? "paused" : "running",
            opacity: reduce ? 0 : undefined,
          }}
        />
      ))}

      {/* Soft dust haze drifting across the lower third — emerald tint */}
      <motion.div
        className="absolute inset-x-0 bottom-0 h-[40vh]"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 100%, oklch(0.72 0.16 150 / 0.06), transparent 70%)",
        }}
        animate={reduce ? undefined : { opacity: [0.4, 0.7, 0.4] }}
        transition={{
          duration: 18,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />

      {/* Vignette to keep content legible — dusk/night tone */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 100% 80% at 50% 50%, transparent 55%, oklch(0.11 0.025 280 / 0.45) 100%)",
        }}
      />
    </div>
  );
}
