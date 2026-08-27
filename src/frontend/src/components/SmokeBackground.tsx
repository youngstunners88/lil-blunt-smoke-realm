import { motion, useReducedMotion } from "motion/react";
import { useMemo } from "react";

const BACKGROUND_CANVAS_SRC =
  "/assets/generated/lil-blunt-prospecting-co-background.png";

/**
 * Fixed full-screen background for LIL BLUNT: THE SMOKE REALM — the
 * founder-supplied "Lil Blunt Prospecting Co." cinematic canvas: an 1800s
 * American mining town (wooden signs, steam train, lanterns, dusty main
 * street, mountains) infused with cannabis culture.
 *
 * Layers, back to front:
 *   1. The cinematic background canvas image, cover-fit and fixed.
 *   2. A dark overlay + vignette so foreground content (cards, text,
 *      buttons) stays readable on top of the rich image.
 *   3. Three protocol particle families rising from the bottom:
 *        - Warm embers (SMOKE — cannabis energy)
 *        - Blue crystal-glow particles (DIAMONDS — sapphire crystal energy)
 *        - Gold-ore shimmer particles (GOLD — warm metallic ore)
 *
 * All motion is environmental — rising particles only, no aggressive zoom
 * or floating cards. Honors `prefers-reduced-motion`.
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
      {/* Founder-supplied cinematic canvas — 1800s mining town + cannabis culture */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${BACKGROUND_CANVAS_SRC})` }}
      />

      {/* Dark overlay so foreground cards/text/buttons stay readable */}
      <div className="absolute inset-0 bg-[oklch(0.08_0.02_270/0.55)]" />

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
            "radial-gradient(ellipse 100% 80% at 50% 50%, transparent 45%, oklch(0.11 0.025 280 / 0.72) 100%)",
        }}
      />
    </div>
  );
}
