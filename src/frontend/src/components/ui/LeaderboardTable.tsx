import { DemoBadge } from "@/components/ui/DemoBadge";
import type { LeaderboardEntry } from "@/lib/types";
import { cn } from "@/lib/utils";
import { motion, useReducedMotion } from "motion/react";

/**
 * Rank tier styling tuned for the parchment wanted-poster surface.
 *
 * #1 is brass/gold, #2-3 is diamond blue, the rest fall back to a dark
 * smoke-green ink. All use dark text on a light parchment chip so they read
 * clearly against the warm paper — no neon glow.
 */
function rankTierClass(rank: number): string {
  if (rank === 1) {
    return "border-[oklch(0.45_0.1_60)] bg-gradient-to-br from-[oklch(0.82_0.13_75)] to-[oklch(0.68_0.12_55)] text-[oklch(0.2_0.04_45)] shadow-[0_1px_0_0_oklch(0.95_0.02_80/0.5)_inset]";
  }
  if (rank === 2 || rank === 3) {
    return "border-[oklch(0.4_0.12_250)] bg-gradient-to-br from-[oklch(0.78_0.16_250)] to-[oklch(0.6_0.16_250)] text-[oklch(0.18_0.03_250)] shadow-[0_1px_0_0_oklch(0.95_0.02_80/0.5)_inset]";
  }
  return "border-[oklch(0.4_0.1_150)] bg-[oklch(0.72_0.14_150/0.35)] text-[oklch(0.24_0.08_150)]";
}

function formatScore(score: bigint): string {
  return Number(score).toLocaleString("en-US");
}

function truncatePrincipal(id: string): string {
  if (id.length <= 24) return id;
  return `${id.slice(0, 12)}…${id.slice(-6)}`;
}

export interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  /** Show the DEMO LEADERBOARD label above the table. */
  isDemo?: boolean;
  className?: string;
  "data-ocid"?: string;
}

/**
 * THE WANTED BOARD — responsive leaderboard table.
 *
 * Desktop renders a full table with columns Rank / Player / Score / Stage /
 * Bosses Defeated / Achievements. Mobile collapses to stacked cards with the
 * same data. The whole surface is styled as an old wanted poster: a parchment
 * sheet framed in wood with a brass header, western display type for the
 * title, and Geist Mono for the blockchain data. Rank tiers: #1 gold, #2-3
 * diamond blue, rest smoke green. When `isDemo` is true, a DEMO LEADERBOARD
 * badge is shown so the data source is unmistakable.
 */
export function LeaderboardTable({
  entries,
  isDemo,
  className,
  "data-ocid": dataOcid,
}: LeaderboardTableProps) {
  const reduce = useReducedMotion();

  return (
    <div className={cn("flex flex-col gap-4", className)} data-ocid={dataOcid}>
      {/* Wanted-poster header — brass trim over the parchment sheet */}
      <div className="brass relative overflow-hidden rounded-t-xl px-5 py-4 sm:px-7">
        <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
          <div className="flex items-center gap-3">
            <span
              aria-hidden="true"
              className="hidden font-display text-2xl text-gold sm:inline"
            >
              ✦
            </span>
            <div className="text-center sm:text-left">
              <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-gold">
                The Smoke Frontier · On-chain
              </p>
              <h3 className="mt-1 font-display text-2xl font-bold tracking-wide text-foreground sm:text-3xl">
                WANTED
              </h3>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {isDemo && (
              <DemoBadge
                label="DEMO LEADERBOARD"
                data-ocid="leaderboard.demo_badge"
              />
            )}
            <span className="hidden font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground sm:inline">
              Dead or alive · highest score
            </span>
          </div>
        </div>
      </div>

      {/* Parchment sheet holding the table */}
      <div className="parchment overflow-hidden rounded-b-xl">
        {/* Desktop table */}
        <div className="hidden overflow-x-auto sm:block">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-[oklch(0.45_0.1_60/0.5)]">
                {[
                  "Rank",
                  "Player",
                  "Score",
                  "Stage",
                  "Bosses Defeated",
                  "Achievements",
                ].map((col) => (
                  <th
                    key={col}
                    className={cn(
                      "h-12 px-4 font-mono text-xs uppercase tracking-widest text-[oklch(0.3_0.06_60)]",
                      col === "Score" ||
                        col === "Bosses Defeated" ||
                        col === "Achievements"
                        ? "text-right"
                        : "text-left",
                    )}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {entries.map((entry, index) => (
                <motion.tr
                  key={entry.principal}
                  data-ocid={`leaderboard.row.${index + 1}`}
                  initial={!reduce ? { opacity: 0, y: 12 } : false}
                  whileInView={!reduce ? { opacity: 1, y: 0 } : undefined}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.35,
                    delay: index * 0.05,
                    ease: "easeOut",
                  }}
                  className="border-b border-[oklch(0.4_0.04_55/0.35)] transition-colors last:border-0 hover:bg-[oklch(0.72_0.14_150/0.12)]"
                >
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "inline-flex size-8 items-center justify-center rounded-full border font-mono text-xs font-bold",
                        rankTierClass(entry.rank),
                      )}
                    >
                      {entry.rank}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      <span className="font-display text-sm font-semibold text-[oklch(0.2_0.04_45)]">
                        {entry.playerAlias}
                      </span>
                      <span className="font-mono text-[11px] text-[oklch(0.35_0.04_55)]">
                        {truncatePrincipal(entry.principal)}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="font-mono text-sm font-bold text-[oklch(0.2_0.04_45)]">
                      {formatScore(entry.score)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs font-semibold text-[oklch(0.3_0.1_250)]">
                      Stage {Number(entry.stage)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="font-mono text-sm text-[oklch(0.2_0.04_45)]">
                      {Number(entry.bossesDefeated)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="font-mono text-sm font-bold text-[oklch(0.28_0.1_150)]">
                      {entry.achievements}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="flex flex-col gap-3 p-4 sm:hidden">
          {entries.map((entry, index) => (
            <motion.div
              key={entry.principal}
              data-ocid={`leaderboard.row.${index + 1}`}
              initial={!reduce ? { opacity: 0, y: 12 } : false}
              whileInView={!reduce ? { opacity: 1, y: 0 } : undefined}
              viewport={{ once: true }}
              transition={{
                duration: 0.35,
                delay: index * 0.05,
                ease: "easeOut",
              }}
              className="rounded-lg border border-[oklch(0.45_0.1_60/0.4)] bg-[oklch(0.92_0.03_70/0.6)] p-4 shadow-[0_1px_0_0_oklch(0.95_0.02_80/0.4)_inset]"
            >
              <div className="flex items-center justify-between">
                <span
                  className={cn(
                    "inline-flex size-9 items-center justify-center rounded-full border font-mono text-sm font-bold",
                    rankTierClass(entry.rank),
                  )}
                >
                  {entry.rank}
                </span>
                <span className="font-mono text-lg font-bold text-[oklch(0.28_0.1_150)]">
                  {formatScore(entry.score)}
                </span>
              </div>
              <div className="mt-3 flex flex-col gap-0.5">
                <span className="font-display text-sm font-semibold text-[oklch(0.2_0.04_45)]">
                  {entry.playerAlias}
                </span>
                <span className="break-all font-mono text-[11px] text-[oklch(0.35_0.04_55)]">
                  {entry.principal}
                </span>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 border-t border-[oklch(0.4_0.04_55/0.35)] pt-3 text-center">
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-wider text-[oklch(0.4_0.04_55)]">
                    Stage
                  </div>
                  <div className="font-mono text-xs font-semibold text-[oklch(0.3_0.1_250)]">
                    {Number(entry.stage)}
                  </div>
                </div>
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-wider text-[oklch(0.4_0.04_55)]">
                    Bosses
                  </div>
                  <div className="font-mono text-xs text-[oklch(0.2_0.04_45)]">
                    {Number(entry.bossesDefeated)}
                  </div>
                </div>
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-wider text-[oklch(0.4_0.04_55)]">
                    Feats
                  </div>
                  <div className="font-mono text-xs font-bold text-[oklch(0.28_0.1_150)]">
                    {entry.achievements}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
