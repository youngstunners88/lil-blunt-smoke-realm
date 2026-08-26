import { motion, useReducedMotion } from "motion/react";
import { useMemo } from "react";

/**
 * Fixed full-screen animated background for LIL BLUNT: THE SMOKE REALM —
 * the hybrid dusk/night frontier where smoke, crystal, and gold meet.
 *
 * Layers, back to front:
 *   1. `.smoke-layer` nebula drift (emerald + cyan + sapphire + gold).
 *   2. Parallax mountain silhouettes (two dusk/night ridgelines drifting
 *      at different speeds for depth) — cool-shifted to match the new
 *      background token (0.11 0.025 280).
 *   3. Three protocol particle families rising from the bottom:
 *        - Warm embers (SMOKE — cannabis energy)
 *        - Blue crystal-glow particles (DIAMONDS — sapphire crystal energy)
 *        - Gold-ore shimmer particles (GOLD — warm metallic ore)
 *   4. A soft dust haze and a vignette to keep content legible.
 *
 * All motion is environmental — drifting smoke, rising particles, slow
 * parallax — no aggressive zoom or floating cards. Honors
 * `prefers-reduced-motion`.
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
      {/* Base nebula smoke drift layer */}
      <div className="smoke-layer" />

      {/* Parallax mountain silhouettes — far ridge (dusk/night tone) */}
      <motion.div
        className="absolute inset-x-0 bottom-0 h-[42vh]"
        style={{
          background:
            "linear-gradient(180deg, transparent 0%, oklch(0.1 0.025 280 / 0.6) 100%)",
          clipPath:
            "polygon(0 62%, 8% 48%, 16% 58%, 26% 40%, 36% 55%, 46% 44%, 56% 58%, 66% 42%, 76% 55%, 86% 46%, 100% 58%, 100% 100%, 0 100%)",
        }}
        animate={reduce ? undefined : { x: [0, -18, 0] }}
        transition={{
          duration: 60,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />

      {/* Parallax mountain silhouettes — near ridge (dusk/night tone) */}
      <motion.div
        className="absolute inset-x-0 bottom-0 h-[30vh]"
        style={{
          background:
            "linear-gradient(180deg, transparent 0%, oklch(0.08 0.022 270 / 0.66) 100%)",
          clipPath:
            "polygon(0 70%, 12% 52%, 24% 64%, 38% 46%, 52% 62%, 64% 48%, 78% 60%, 90% 50%, 100% 62%, 100% 100%, 0 100%)",
        }}
        animate={reduce ? undefined : { x: [0, 24, 0] }}
        transition={{
          duration: 80,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />

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
