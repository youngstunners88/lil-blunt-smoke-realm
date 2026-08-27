import { cn } from "@/lib/utils";
import { useReducedMotion } from "motion/react";
import { type ReactNode, forwardRef } from "react";

export type NeonButtonVariant = "smoke" | "blue" | "gold";
export type NeonButtonSize = "sm" | "md" | "lg" | "xl";

/**
 * A dark, blurred base sits under every variant's colour tint.
 *
 * The tints are deliberately light (15–25% alpha) so the material reads as
 * glass. Over a flat surface that is fine, but the hero now sits on the
 * cinematic town canvas, and a bright patch of sunlit road behind a button
 * showed straight through and made the label unreadable. This backing gives
 * the label a consistent surface to sit on wherever the button lands, while
 * keeping the glassy look.
 */
const SURFACE_BASE =
  "bg-[oklch(0.12_0.02_270/0.62)] backdrop-blur-md supports-[backdrop-filter]:bg-[oklch(0.12_0.02_270/0.52)]";

const VARIANT_BASE: Record<NeonButtonVariant, string> = {
  smoke:
    "border-primary/60 bg-primary/15 text-primary hover:bg-primary/25 hover:text-edge-smoke hover:edge-smoke",
  blue: "border-accent/60 bg-accent/15 text-accent hover:bg-accent/25 hover:text-edge-blue hover:edge-blue",
  gold: "border-gold/60 bg-gold/15 text-gold hover:bg-gold/25 hover:text-edge-gold hover:edge-gold",
};

const SIZE_BASE: Record<NeonButtonSize, string> = {
  sm: "h-9 px-4 text-sm gap-1.5 rounded-lg",
  md: "h-11 px-6 text-base gap-2 rounded-lg",
  lg: "h-14 px-8 text-lg gap-2.5 rounded-xl",
  xl: "h-16 px-10 text-xl gap-3 rounded-xl sm:h-[4.5rem] sm:px-14",
};

export interface NeonButtonProps {
  children: ReactNode;
  variant?: NeonButtonVariant;
  size?: NeonButtonSize;
  /** Render as an `<a>` (link) instead of a `<button>`. */
  href?: string;
  external?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  className?: string;
  /** data-ocid marker for deterministic testing. */
  "data-ocid"?: string;
  ariaLabel?: string;
}

/**
 * Frontier CTA button used for the PLAY NOW action and all primary actions.
 *
 * Uses warm edge highlights and material tints instead of neon glow. Renders
 * as a `<button>` by default; pass `href` to render an `<a>`. The `xl` size
 * is reserved for the hero PLAY NOW button — visually dominant on every
 * viewport. Honors `prefers-reduced-motion` by disabling the hover scale.
 */
export const NeonButton = forwardRef<
  HTMLButtonElement | HTMLAnchorElement,
  NeonButtonProps
>(function NeonButton(
  {
    children,
    variant = "smoke",
    size = "md",
    href,
    external,
    onClick,
    disabled,
    type = "button",
    className,
    "data-ocid": dataOcid,
    ariaLabel,
  },
  ref,
) {
  const reduce = useReducedMotion();
  const classes = cn(
    "group inline-flex items-center justify-center border-2 font-display font-bold uppercase tracking-[0.12em] transition-all duration-300",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    "disabled:cursor-not-allowed disabled:opacity-60",
    SURFACE_BASE,
    VARIANT_BASE[variant],
    SIZE_BASE[size],
    !reduce && "hover:scale-[1.03] active:scale-[0.98]",
    className,
  );

  if (href) {
    return (
      <a
        ref={ref as React.Ref<HTMLAnchorElement>}
        href={href}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
        onClick={onClick}
        aria-label={ariaLabel}
        data-ocid={dataOcid}
        className={classes}
      >
        {children}
      </a>
    );
  }

  return (
    <button
      ref={ref as React.Ref<HTMLButtonElement>}
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      data-ocid={dataOcid}
      className={classes}
    >
      {children}
    </button>
  );
});
