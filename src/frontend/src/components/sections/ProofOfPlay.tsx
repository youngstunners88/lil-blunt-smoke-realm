import { AchievementCard } from "@/components/ui/AchievementCard";
import { DemoBadge } from "@/components/ui/DemoBadge";
import { useAchievements } from "@/lib/repository";
import { cn } from "@/lib/utils";
import { Award, Crown, Flame, Sparkles, Trophy } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

/**
 * Proof of Play — the Smoke Realm's gameplay achievement layer.
 *
 * This is a gameplay achievement gallery, NOT an NFT collection. Achievements
 * are unlocked by meeting in-game requirements (boss no-damage runs, 100%
 * collection, staking thresholds, lounge access). The system is extensible:
 * new achievements are added to the backend `getAchievements()` repository
 * method and flow through the typed `Achievement` model without touching this
 * render layer.
 *
 * Data is sourced from the backend via `useAchievements()`. When the actor is
 * not yet available (no canister connection), the hook returns an empty array
 * and the section renders a canister-ready empty state. Demo data is flagged
 * with `isDemo` on each achievement and surfaced via a `DemoBadge` so demo
 * rows are never mistaken for live progress.
 */

/** Per-achievement artwork icon, keyed by achievement id. Falls back to Trophy. */
const ACHIEVEMENT_ICON: Record<string, LucideIcon> = {
  "auditor-slayer": Award,
  "blaze-rush-champion": Flame,
  "fort-knox-whale": Crown,
  "smoke-lounge-vip": Sparkles,
};

/** Stable keys for the loading-state skeleton cards (avoids array-index keys). */
const SKELETON_IDS = ["sk-a", "sk-b", "sk-c", "sk-d"] as const;

export function ProofOfPlay() {
  const reduce = useReducedMotion();
  const { data: achievements, isLoading, isFetching } = useAchievements();

  const fadeUp = (delay: number) =>
    reduce
      ? { initial: { opacity: 0 }, animate: { opacity: 1 } }
      : {
          initial: { opacity: 0, y: 24 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.6, delay, ease: "easeOut" as const },
        };

  const hasData = !!achievements && achievements.length > 0;
  const showLoading = isLoading || (isFetching && !hasData);

  return (
    <section
      id="feats"
      data-ocid="section.feats"
      className="relative z-10 px-4 py-24 sm:px-6 sm:py-28 lg:px-8"
    >
      <div className="mx-auto w-full max-w-6xl">
        {/* Section heading */}
        <motion.div {...fadeUp(0)} className="mb-12 text-center sm:mb-16">
          <span className="brass inline-flex items-center gap-2 rounded-full px-4 py-1.5 font-mono text-[11px] uppercase tracking-[0.3em] text-primary/90">
            <Trophy className="size-3.5" aria-hidden="true" />
            Gameplay Feats
          </span>
          <h2
            className="mt-6 font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl"
            data-ocid="feats.heading"
          >
            <span className="text-gradient-smoke">Proof of Play</span>
          </h2>
          <p
            className="mx-auto mt-4 max-w-2xl font-body text-base font-light text-muted-foreground sm:text-lg"
            data-ocid="feats.subtitle"
          >
            Earn your place in the haze. These are gameplay achievements —
            unlocked by skill, grit, and staking conviction in the Smoke Realm.
            No minting, no trophies on-chain; just proof you played.
          </p>
          <div className="mt-5 flex items-center justify-center">
            <DemoBadge label="DEMO DATA" data-ocid="feats.demo_badge" />
          </div>
        </motion.div>

        {/* Achievement grid / states */}
        {showLoading ? (
          <LoadingState />
        ) : hasData ? (
          <AchievementGrid achievements={achievements} />
        ) : (
          <EmptyState />
        )}

        {/* Extensibility footnote */}
        <motion.p
          {...fadeUp(0.3)}
          className="mt-12 text-center font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground/60"
        >
          New feats drop with every realm expansion. The haze keeps growing.
        </motion.p>
      </div>
    </section>
  );
}

/**
 * 2x2 desktop / stacked mobile grid of achievement cards. The AchievementCard
 * component owns its own staggered entrance and hover interaction; this grid
 * only provides layout and the responsive breakpoint.
 */
function AchievementGrid({
  achievements,
}: {
  achievements: NonNullable<ReturnType<typeof useAchievements>["data"]>;
}) {
  return (
    <div
      data-ocid="feats.grid"
      className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6"
    >
      {achievements.map((achievement, index) => {
        const Icon = ACHIEVEMENT_ICON[achievement.id] ?? Trophy;
        return (
          <div
            key={achievement.id}
            className={cn(
              "transition-transform duration-300",
              "hover:-translate-y-1 focus-within:-translate-y-1",
            )}
          >
            <AchievementCard
              achievement={achievement}
              icon={Icon}
              index={index}
              data-ocid={`feats.card.${index + 1}`}
            />
          </div>
        );
      })}
    </div>
  );
}

/** Layout-matched skeleton shown while the canister query is in flight. */
function LoadingState() {
  return (
    <div
      data-ocid="feats.loading_state"
      className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6"
      aria-busy="true"
      aria-label="Loading achievements"
    >
      {SKELETON_IDS.map((id) => (
        <div key={id} className="wood flex flex-col gap-4 rounded-2xl p-5">
          <div className="h-32 animate-pulse rounded-xl bg-background/30" />
          <div className="h-5 w-24 animate-pulse rounded-full bg-background/40" />
          <div className="h-5 w-3/4 animate-pulse rounded bg-background/30" />
          <div className="h-4 w-full animate-pulse rounded bg-background/20" />
          <div className="h-1.5 w-full animate-pulse rounded-full bg-background/30" />
        </div>
      ))}
    </div>
  );
}

/** Canister-ready empty state — shown when no achievements are returned. */
function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      data-ocid="feats.empty_state"
      className="wood mx-auto flex max-w-2xl flex-col items-center rounded-2xl px-8 py-16 text-center"
    >
      <motion.div
        animate={{ opacity: [0.5, 1, 0.5], scale: [0.97, 1, 0.97] }}
        transition={{
          duration: 2.4,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
        className="mb-6 flex size-16 items-center justify-center rounded-full border border-primary/30 bg-background/20 edge-smoke"
      >
        <Trophy className="size-7 text-primary" aria-hidden="true" />
      </motion.div>
      <h3 className="font-display text-xl font-semibold text-foreground">
        No feats synced yet
      </h3>
      <p className="mt-3 max-w-md font-body text-sm text-muted-foreground">
        Connect your ICP Identity to pull your Proof of Play achievements from
        the Smoke Realm canister. The haze clears when you do.
      </p>
    </motion.div>
  );
}

export default ProofOfPlay;
