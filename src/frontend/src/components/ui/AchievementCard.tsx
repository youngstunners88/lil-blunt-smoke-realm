import type { Rarity } from "@/backend";
import type { Achievement } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Lock } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

/**
 * Map a rarity tier to its frontier material surface, warm edge highlight,
 * and accent tones. The `.rarity-*` border/glow tier is preserved on the outer
 * frame; the material (wood/iron/brass) gives each certificate its surface.
 */
const RARITY_STYLE: Record<
  Rarity,
  { rarity: string; material: string; text: string; badge: string; bar: string }
> = {
  common: {
    rarity: "rarity-common",
    material: "wood",
    text: "text-muted-foreground",
    badge: "border-border/50 text-muted-foreground",
    bar: "bg-muted-foreground/60",
  },
  uncommon: {
    rarity: "rarity-common",
    material: "wood",
    text: "text-primary",
    badge: "border-primary/40 text-primary",
    bar: "bg-primary",
  },
  rare: {
    rarity: "rarity-rare",
    material: "iron",
    text: "text-accent",
    badge: "border-accent/40 text-accent",
    bar: "bg-accent",
  },
  epic: {
    rarity: "rarity-epic",
    material: "brass",
    text: "text-gold",
    badge: "border-gold/40 text-gold",
    bar: "bg-gold",
  },
  legendary: {
    rarity: "rarity-legendary",
    material: "brass",
    text: "text-gold",
    badge: "border-gold/50 text-gold",
    bar: "bg-gold",
  },
};

const RARITY_LABEL: Record<Rarity, string> = {
  common: "Common",
  uncommon: "Uncommon",
  rare: "Rare",
  epic: "Epic",
  legendary: "Legendary",
};

/** Default icon per rarity — used as the artwork placeholder glyph. */
const RARITY_ICON: Record<Rarity, LucideIcon> = {
  common: Lock,
  uncommon: Lock,
  rare: Lock,
  epic: Lock,
  legendary: Lock,
};

export interface AchievementCardProps {
  achievement: Achievement;
  /** Override the default rarity icon (e.g. Skull, Rocket, Crown). */
  icon?: LucideIcon;
  index?: number;
  "data-ocid"?: string;
}

/**
 * Proof of Play achievement card — styled as a frontier mining certificate.
 *
 * A wood/brass/iron collector's card with a warm edge highlight per rarity
 * tier, a stamped sigil for the artwork, the title in Fraunces display, the
 * requirement in DM Sans, and Geist Mono for technical detail. Locked cards
 * render grayscale with a lock overlay; unlocked cards carry their rarity's
 * warm edge. A progress bar shows completion when partially unlocked.
 */
export function AchievementCard({
  achievement,
  icon,
  index = 0,
  "data-ocid": dataOcid,
}: AchievementCardProps) {
  const reduce = useReducedMotion();
  const style = RARITY_STYLE[achievement.rarity];
  const Icon = icon ?? RARITY_ICON[achievement.rarity];
  const locked = !achievement.unlocked;
  const progressPct = Math.min(100, Math.max(0, Number(achievement.progress)));

  return (
    <motion.article
      initial={!reduce ? { opacity: 0, y: 24 } : false}
      whileInView={!reduce ? { opacity: 1, y: 0 } : undefined}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, delay: index * 0.08, ease: "easeOut" }}
      data-ocid={dataOcid}
      className={cn(
        "group relative overflow-hidden rounded-xl border p-1.5 transition-all duration-300",
        style.rarity,
        locked && "grayscale opacity-70",
      )}
    >
      {/* Material surface — the certificate body */}
      <div
        className={cn(
          "relative flex flex-col gap-4 overflow-hidden rounded-lg p-5",
          style.material,
        )}
      >
        {/* Certificate header — mono label + rarity badge */}
        <div className="flex items-center justify-between gap-3">
          <span className="font-mono text-[0.6rem] uppercase tracking-[0.25em] text-muted-foreground/80">
            Smoke Frontier
          </span>
          <span
            className={cn(
              "rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.2em]",
              style.badge,
            )}
          >
            {RARITY_LABEL[achievement.rarity]}
          </span>
        </div>

        {/* Stamped sigil — the artwork placeholder */}
        <div className="relative flex h-28 items-center justify-center">
          <div
            className={cn(
              "flex h-24 w-24 items-center justify-center rounded-full border-2 border-dashed",
              style.text,
            )}
          >
            <Icon
              className={cn(
                "size-11 transition-transform duration-300 group-hover:scale-110",
                style.text,
              )}
              strokeWidth={1.5}
              aria-hidden="true"
            />
          </div>
          {locked && (
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-background/40 backdrop-blur-[2px]">
              <Lock
                className="size-6 text-muted-foreground"
                aria-hidden="true"
              />
            </div>
          )}
        </div>

        {/* Title */}
        <h3 className="font-display text-xl font-semibold leading-tight text-foreground">
          {achievement.title}
        </h3>

        {/* Requirement */}
        <p className="font-body text-sm leading-relaxed text-muted-foreground">
          {achievement.requirement}
        </p>

        {/* Progress bar (only when not fully unlocked) */}
        {!achievement.unlocked && progressPct > 0 && (
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              <span>Progress</span>
              <span className={style.text}>{progressPct}%</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-background/40">
              <motion.div
                className={cn("h-full rounded-full", style.bar)}
                initial={!reduce ? { width: 0 } : false}
                whileInView={!reduce ? { width: `${progressPct}%` } : undefined}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
          </div>
        )}

        {/* Unlocked state */}
        {achievement.unlocked && (
          <div
            className={cn(
              "mt-auto inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.2em]",
              style.text,
            )}
          >
            <span
              className="size-1.5 rounded-full bg-current"
              aria-hidden="true"
            />
            Unlocked
          </div>
        )}
      </div>
    </motion.article>
  );
}
