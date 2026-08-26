import { DemoBadge } from "@/components/ui/DemoBadge";
import { GlassCard, type GlassCardVariant } from "@/components/ui/GlassCard";
import { useWorlds } from "@/lib/repository";
import type { World } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Diamond, Loader2, Pickaxe, Wind } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

/**
 * Per-realm presentation config. The realm `id` from the backend `World`
 * record selects the visual treatment — GlassCard variant, Lucide icon, theme
 * tag, and the gradient that paints the card's atmospheric header. Adding a
 * new realm is a single entry here; the render layer stays untouched.
 */
interface RealmVisual {
  variant: GlassCardVariant;
  icon: LucideIcon;
  /** Short uppercase tag shown above the realm name. */
  tag: string;
  /** Inline gradient painted behind the icon — uses the realm-* tokens. */
  headerGradient: string;
  /** Glow utility applied to the icon badge. */
  iconGlow: string;
  /** Text-glow utility applied to the realm name. */
  nameGlow: string;
  /** Border + tint for the icon badge. */
  iconWrap: string;
  /** Icon color. */
  iconColor: string;
}

const REALM_VISUALS: Record<string, RealmVisual> = {
  smoke: {
    variant: "smoke",
    icon: Wind,
    tag: "Urban · Psychedelic",
    headerGradient:
      "linear-gradient(135deg, oklch(0.85 0.22 145 / 0.28), oklch(0.55 0.22 145 / 0.08) 60%, transparent)",
    iconGlow: "glow-smoke",
    nameGlow: "text-glow-smoke",
    iconWrap: "border-primary/50 bg-primary/15",
    iconColor: "text-primary",
  },
  diamond: {
    variant: "blue",
    icon: Diamond,
    tag: "Crystal Caves · Reflections",
    headerGradient:
      "linear-gradient(135deg, oklch(0.75 0.18 230 / 0.28), oklch(0.5 0.18 230 / 0.08) 60%, transparent)",
    iconGlow: "glow-blue",
    nameGlow: "text-glow-blue",
    iconWrap: "border-accent/50 bg-accent/15",
    iconColor: "text-accent",
  },
  gold: {
    variant: "gold",
    icon: Pickaxe,
    tag: "Western · Mining",
    headerGradient:
      "linear-gradient(135deg, oklch(0.78 0.16 55 / 0.3), oklch(0.7 0.2 30 / 0.1) 60%, transparent)",
    iconGlow: "glow-gold",
    nameGlow: "text-glow-gold",
    iconWrap: "border-gold/50 bg-gold/15",
    iconColor: "text-gold",
  },
};

/**
 * Resolve a realm's visual config by its backend `id`. Falls back to the
 * smoke treatment so an unknown realm still renders coherently rather than
 * throwing — the section is game-first and should never blank out.
 */
function resolveRealm(id: string): RealmVisual {
  return REALM_VISUALS[id] ?? REALM_VISUALS.smoke;
}

function RealmCard({ world, index }: { world: World; index: number }) {
  const reduce = useReducedMotion();
  const visual = resolveRealm(world.id);
  const Icon = visual.icon;

  // Staggered scroll reveal — each card enters slightly after the previous.
  // When reduced motion is requested, cards render in place with no transform.
  const reveal = reduce
    ? { initial: { opacity: 0 }, whileInView: { opacity: 1 } }
    : {
        initial: { opacity: 0, y: 28 },
        whileInView: { opacity: 1, y: 0 },
      };

  return (
    <motion.div
      {...reveal}
      viewport={{ once: true, amount: 0.3 }}
      transition={{
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1],
        delay: index * 0.12,
      }}
      data-ocid={`game-worlds.card.${index + 1}`}
      className="h-full"
    >
      <GlassCard
        variant={visual.variant}
        revealAmount={0}
        className={cn(
          "group relative flex h-full flex-col overflow-hidden p-0",
          "transition-transform duration-300",
          !reduce && "hover:scale-[1.02]",
        )}
      >
        {/* Atmospheric header — realm-colored gradient + floating icon */}
        <div
          aria-hidden="true"
          className="relative h-40 w-full overflow-hidden sm:h-44"
          style={{ background: visual.headerGradient }}
        >
          {/* Faint pixel-grid texture for game feel */}
          <div
            className="absolute inset-0 opacity-[0.12]"
            style={{
              backgroundImage:
                "linear-gradient(oklch(1 0 0 / 0.5) 1px, transparent 1px), linear-gradient(90deg, oklch(1 0 0 / 0.5) 1px, transparent 1px)",
              backgroundSize: "32px 32px",
              maskImage:
                "radial-gradient(ellipse at center, oklch(0 0 0 / 0.9), transparent 75%)",
              WebkitMaskImage:
                "radial-gradient(ellipse at center, oklch(0 0 0 / 0.9), transparent 75%)",
            }}
          />
          {/* Floating icon badge */}
          <motion.div
            className={cn(
              "absolute left-1/2 top-1/2 flex size-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-2xl border-2 transition-transform duration-300 group-hover:scale-110",
              visual.iconWrap,
              visual.iconGlow,
            )}
            animate={reduce ? undefined : { y: [0, -6, 0] }}
            transition={{
              duration: 4,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
              delay: index * 0.4,
            }}
          >
            <Icon
              className={cn("size-8", visual.iconColor)}
              aria-hidden="true"
            />
          </motion.div>
        </div>

        {/* Body — realm name, theme tag, description */}
        <div className="flex flex-1 flex-col gap-3 p-6">
          <div className="flex items-center justify-between gap-3">
            <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground/80">
              {visual.tag}
            </span>
            {world.isDemo && (
              <DemoBadge
                data-ocid={`game-worlds.demo_badge.${index + 1}`}
                label="DEMO"
              />
            )}
          </div>

          <h3
            className={cn(
              "font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl",
              visual.nameGlow,
            )}
          >
            {world.name}
          </h3>

          <p className="font-body text-base leading-relaxed text-muted-foreground">
            {world.description}
          </p>

          {/* Bottom accent line — realm-colored, intensifies on hover */}
          <div
            aria-hidden="true"
            className={cn(
              "mt-auto h-px w-full transition-opacity duration-300 group-hover:opacity-100",
              visual.variant === "smoke" &&
                "bg-gradient-to-r from-transparent via-primary/60 to-transparent opacity-60",
              visual.variant === "blue" &&
                "bg-gradient-to-r from-transparent via-accent/60 to-transparent opacity-60",
              visual.variant === "gold" &&
                "bg-gradient-to-r from-transparent via-gold/60 to-transparent opacity-60",
            )}
          />
        </div>
      </GlassCard>
    </motion.div>
  );
}

/**
 * The Game Worlds section — three cinematic realm cards (SMOKE REALM,
 * DIAMOND REALM, GOLD RUSH) fetched from the backend via `useWorlds()`.
 *
 * Each card uses a distinct GlassCard variant with a realm-colored gradient
 * header, a floating Lucide icon, and a neon name glow. Cards stagger in on
 * scroll reveal and lift subtly on hover. Demo data is flagged with a
 * DemoBadge so it is never mistaken for live world state. Mobile stacks the
 * cards vertically; desktop lays them out in a three-column grid.
 */
export function GameWorlds() {
  const reduce = useReducedMotion();
  const { data: worlds, isLoading, isError } = useWorlds();

  const headingReveal = reduce
    ? { initial: { opacity: 0 }, whileInView: { opacity: 1 } }
    : { initial: { opacity: 0, y: 24 }, whileInView: { opacity: 1, y: 0 } };

  return (
    <section
      id="game-worlds"
      data-ocid="section.game-worlds"
      className="relative z-10 px-4 py-24 sm:px-6 sm:py-32 lg:px-8"
    >
      <div className="mx-auto w-full max-w-6xl">
        {/* Section heading */}
        <motion.div
          {...headingReveal}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-12 text-center sm:mb-16"
        >
          <span className="glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 font-mono text-[11px] uppercase tracking-[0.3em] text-primary/90">
            <Wind className="size-3.5 text-glow-smoke" aria-hidden="true" />
            Three Realms
          </span>
          <h2
            className="mt-6 font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl"
            data-ocid="game-worlds.heading"
          >
            <span className="text-gradient-smoke text-glow-smoke">
              The Game Worlds
            </span>
          </h2>
          <p
            className="mx-auto mt-4 max-w-2xl font-body text-base font-light text-muted-foreground sm:text-lg"
            data-ocid="game-worlds.subtitle"
          >
            Three cinematic realms. One chill crusade. Pick your haze, drop in,
            and survive what the Smoke Realm throws at you.
          </p>
        </motion.div>

        {/* Realm grid / states */}
        {isLoading ? (
          <LoadingState />
        ) : isError ? (
          <ErrorState />
        ) : worlds && worlds.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
            {worlds.map((world, index) => (
              <RealmCard key={world.id} world={world} index={index} />
            ))}
          </div>
        ) : (
          <EmptyState />
        )}

        {/* Footer note */}
        <motion.p
          {...(reduce
            ? { initial: { opacity: 0 }, whileInView: { opacity: 1 } }
            : {
                initial: { opacity: 0, y: 16 },
                whileInView: { opacity: 1, y: 0 },
              })}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
          className="mt-12 text-center font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground/60"
        >
          Chill vibes only. You can&apos;t tax the vibe.
        </motion.p>
      </div>
    </section>
  );
}

function LoadingState() {
  return (
    <output
      data-ocid="game-worlds.loading_state"
      className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8"
      aria-live="polite"
    >
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="glass h-80 animate-pulse rounded-2xl border border-border/40"
        >
          <div className="h-40 rounded-t-2xl bg-muted/20" />
          <div className="space-y-3 p-6">
            <div className="h-3 w-24 rounded bg-muted/40" />
            <div className="h-6 w-40 rounded bg-muted/50" />
            <div className="h-4 w-full rounded bg-muted/30" />
            <div className="h-4 w-2/3 rounded bg-muted/30" />
          </div>
        </div>
      ))}
      <span className="sr-only">Loading game worlds…</span>
    </output>
  );
}

function ErrorState() {
  return (
    <div
      data-ocid="game-worlds.error_state"
      className="glass mx-auto flex max-w-xl flex-col items-center rounded-2xl px-8 py-12 text-center"
      role="alert"
    >
      <div className="mb-4 flex size-14 items-center justify-center rounded-full border border-destructive/40 bg-destructive/10">
        <Loader2
          className="size-6 animate-spin text-destructive"
          aria-hidden="true"
        />
      </div>
      <h3 className="font-display text-xl font-semibold text-foreground">
        The haze rolled in too thick
      </h3>
      <p className="mt-3 max-w-md font-body text-sm text-muted-foreground">
        We couldn&apos;t pull the realms from the canister. Take a breath and
        try again — the Smoke Realm isn&apos;t going anywhere.
      </p>
    </div>
  );
}

function EmptyState() {
  return (
    <div
      data-ocid="game-worlds.empty_state"
      className="glass mx-auto flex max-w-xl flex-col items-center rounded-2xl px-8 py-12 text-center"
    >
      <div className="mb-4 flex size-14 items-center justify-center rounded-full border border-primary/30 bg-primary/10 glow-smoke">
        <Wind className="size-6 text-primary" aria-hidden="true" />
      </div>
      <h3 className="font-display text-xl font-semibold text-foreground">
        No realms surfaced yet
      </h3>
      <p className="mt-3 max-w-md font-body text-sm text-muted-foreground">
        The canister returned an empty world list. The realms are still rolling
        in — check back once the haze settles.
      </p>
    </div>
  );
}

export default GameWorlds;
