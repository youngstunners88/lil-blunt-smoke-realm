import { cn } from "@/lib/utils";
import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

export type GlassCardVariant = "smoke" | "blue" | "gold" | "default";

const VARIANT_GLASS: Record<GlassCardVariant, string> = {
  smoke: "wood",
  blue: "iron",
  gold: "brass",
  default: "wood",
};

const VARIANT_HOVER_GLOW: Record<GlassCardVariant, string> = {
  smoke: "hover:edge-smoke hover:border-primary/50",
  blue: "hover:edge-blue hover:border-accent/50",
  gold: "hover:edge-gold hover:border-gold/50",
  default: "hover:edge-smoke hover:border-primary/40",
};

export interface GlassCardProps {
  children: ReactNode;
  className?: string;
  variant?: GlassCardVariant;
  /** Reveal animation amount (0–1). Set to 0 to disable whileInView. */
  revealAmount?: number;
}

/**
 * Frontier material card with a warm edge highlight and a scroll-reveal
 * entrance. Uses the wood / iron / brass material surfaces instead of neon
 * glassmorphism, with a warm edge highlight on hover.
 *
 * Honors `prefers-reduced-motion`: when reduced, the card renders in place
 * with no transform animation. Used as the base surface for stat tiles,
 * achievement cards, leaderboard rows, and vault entries.
 */
export function GlassCard({
  children,
  className,
  variant = "default",
  revealAmount = 0.3,
}: GlassCardProps) {
  const reduce = useReducedMotion();
  const shouldReveal = !reduce && revealAmount > 0;

  return (
    <motion.div
      initial={shouldReveal ? { opacity: 0, y: 24 } : false}
      whileInView={shouldReveal ? { opacity: 1, y: 0 } : undefined}
      viewport={{ once: true, amount: revealAmount }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "rounded-2xl p-6 transition-all duration-300",
        VARIANT_GLASS[variant],
        VARIANT_HOVER_GLOW[variant],
        className,
      )}
    >
      {children}
    </motion.div>
  );
}
