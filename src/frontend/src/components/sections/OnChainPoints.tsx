import { NeonButton } from "@/components/ui/NeonButton";
import { StatCard } from "@/components/ui/StatCard";
import {
  useAchievements,
  useLeaderboard,
  usePlayerProfile,
} from "@/lib/repository";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { motion, useReducedMotion } from "motion/react";

/**
 * ON-CHAIN POINTS / ICP section.
 *
 * Proof of Play achievement layer secured by ICP + Internet Identity.
 * All figures are sourced from the demo backend (repository hooks) and
 * labeled "ECOSYSTEM DATA — DEMO" — never "LIVE DATA" (see doNotBuild:
 * no live on-chain ICP leaderboard with real scores). No NFT minting
 * claims — this is an achievement layer only.
 */
export function OnChainPoints() {
  const reduce = useReducedMotion();
  const { identity, isAuthenticated, isLoggingIn, login, isLoginError } =
    useInternetIdentity();

  const { data: leaderboard } = useLeaderboard();
  const { data: achievements } = useAchievements();
  const { data: profile } = usePlayerProfile(identity?.getPrincipal());

  const entries = leaderboard ?? [];
  const topScore = entries[0]?.score;
  const totalRuns = entries.length;
  const achievementCount = achievements?.length ?? 0;

  const topScoreLabel =
    typeof topScore === "bigint" ? Number(topScore).toLocaleString() : "—";

  return (
    <section
      id="points"
      data-ocid="section.on_chain_points"
      className="relative z-10 mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8"
    >
      {/* Header */}
      <div className="mx-auto max-w-3xl text-center">
        <span
          className="iron inline-flex items-center gap-2 rounded-full px-4 py-1.5 font-mono text-[11px] uppercase tracking-[0.3em] text-accent"
          data-ocid="on_chain_points.eyebrow"
        >
          <span className="size-1.5 rounded-full bg-accent crystal-pulse" />
          On-Chain Points · ICP
        </span>
        <h2
          className="mt-6 font-display text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl lg:text-5xl"
          data-ocid="on_chain_points.headline"
        >
          Proof of Play on the{" "}
          <span className="text-gradient-crystal">Internet Computer.</span>
        </h2>
        <p
          className="mx-auto mt-4 max-w-xl font-body text-base font-light leading-relaxed text-muted-foreground sm:text-lg"
          data-ocid="on_chain_points.tagline"
        >
          Every run becomes a verifiable on-chain achievement — a Proof of Play
          layer secured by ICP and Internet Identity. No NFT minting claims,
          just frontier feats etched onto the chain.
        </p>
      </div>

      {/* Stat tiles */}
      <motion.div
        initial={reduce ? { opacity: 0 } : { opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="glass-panel mx-auto mt-6 max-w-5xl rounded-2xl p-6 sm:p-8"
        data-ocid="on_chain_points.stat_panel"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6">
          <StatCard
            label="Top Score"
            value={topScoreLabel}
            accent="gold"
            tooltip="Highest score on the leaderboard"
            data-ocid="on_chain_points.stat.top_score"
          />
          <StatCard
            label="Total Runs"
            value={totalRuns.toLocaleString()}
            accent="blue"
            tooltip="Number of runs recorded in the ecosystem"
            data-ocid="on_chain_points.stat.total_runs"
          />
          <StatCard
            label="Achievements"
            value={achievementCount.toLocaleString()}
            accent="smoke"
            tooltip="Proof of Play achievements in the data"
            data-ocid="on_chain_points.stat.achievements"
          />
        </div>
      </motion.div>

      {/* Internet Identity sign-in / player profile */}
      <motion.div
        initial={reduce ? { opacity: 0 } : { opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
        className="glass-panel mx-auto mt-8 max-w-5xl rounded-2xl p-6 sm:p-8"
        data-ocid="on_chain_points.identity_panel"
      >
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-md text-center sm:text-left">
            <h3
              className="font-display text-xl font-semibold tracking-tight text-foreground sm:text-2xl"
              data-ocid="on_chain_points.identity_title"
            >
              Sign in with Internet Identity
            </h3>
            <p
              className="mt-2 font-body text-sm font-light leading-relaxed text-muted-foreground"
              data-ocid="on_chain_points.identity_blurb"
            >
              Reveal your own Proof of Play profile — alias, stage reached,
              bosses defeated, and achievements — secured on ICP. Internet
              Identity only.
            </p>
          </div>

          <div className="flex w-full flex-col items-center gap-3 sm:w-auto">
            {!isAuthenticated ? (
              <>
                <NeonButton
                  variant="blue"
                  onClick={login}
                  data-ocid="on_chain_points.ii_signin_button"
                >
                  {isLoggingIn
                    ? "Connecting…"
                    : "Sign in with Internet Identity"}
                </NeonButton>
                {isLoginError && (
                  <p
                    role="alert"
                    className="font-mono text-[11px] uppercase tracking-widest text-rose-400"
                    data-ocid="on_chain_points.ii_error"
                  >
                    Sign-in failed — try again
                  </p>
                )}
              </>
            ) : (
              <div
                className="w-full rounded-xl border border-border bg-card/60 p-4 sm:min-w-[20rem]"
                data-ocid="on_chain_points.profile_card"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent">
                    Your Profile
                  </span>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <ProfileField label="Alias" value={profile?.alias ?? "—"} />
                  <ProfileField
                    label="Stage Reached"
                    value={
                      typeof profile?.stageReached === "bigint"
                        ? Number(profile.stageReached).toLocaleString()
                        : "—"
                    }
                  />
                  <ProfileField
                    label="Bosses Defeated"
                    value={
                      typeof profile?.bossesDefeated === "bigint"
                        ? Number(profile.bossesDefeated).toLocaleString()
                        : "—"
                    }
                  />
                  <ProfileField
                    label="Achievements"
                    value={
                      Array.isArray(profile?.achievements)
                        ? profile.achievements.length.toLocaleString()
                        : "—"
                    }
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </section>
  );
}

function ProfileField({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
        {label}
      </div>
      <div
        className="mt-1 truncate font-display text-sm font-semibold text-foreground"
        title={value}
      >
        {value}
      </div>
    </div>
  );
}

export default OnChainPoints;
