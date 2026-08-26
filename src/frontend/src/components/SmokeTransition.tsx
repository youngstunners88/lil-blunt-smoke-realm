import { motion, useReducedMotion } from "motion/react";

/**
 * Signature smoke transition between sections.
 *
 * A drifting band of warm smoke that separates two sections, honoring
 * prefers-reduced-motion by rendering a static divider when reduced motion is
 * requested. Uses the `.smoke-layer` utility plus a Framer Motion drift so the
 * page reads as one connected living world rather than a stack of cards.
 */
export function SmokeTransition() {
  const reduce = useReducedMotion();
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none relative z-0 h-24 w-full overflow-hidden"
      data-ocid="smoke_transition"
    >
      <motion.div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 100% at 50% 50%, oklch(0.72 0.16 150 / 0.12), transparent 70%)",
          filter: "blur(24px)",
        }}
        animate={
          reduce
            ? { opacity: 0.6 }
            : { opacity: [0.4, 0.8, 0.4], x: [0, 30, 0] }
        }
        transition={
          reduce
            ? { duration: 0 }
            : {
                duration: 14,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }
        }
      />
      <div className="glow-gold absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
    </div>
  );
}
