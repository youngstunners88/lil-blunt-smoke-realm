import { DemoBadge } from "@/components/ui/DemoBadge";
import { GlassCard } from "@/components/ui/GlassCard";
import { StatCard } from "@/components/ui/StatCard";
import { GOLD_MINE_LOGO_SRC } from "@/lib/brand";
import { useTokenMetrics } from "@/lib/repository";
import type { TokenMetric } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  Archive,
  BookOpen,
  Coins,
  FileText,
  Gavel,
  Landmark,
  Pickaxe,
  Scale,
  TrendingUp,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useMemo } from "react";

interface PanelMeta {
  label: string;
  icon: LucideIcon;
  blurb: string;
}

const PANELS: PanelMeta[] = [
  {
    label: "Mining",
    icon: Pickaxe,
    blurb:
      "Where GOLD is struck. Dig deep, stack the claim, and let the vein run.",
  },
  {
    label: "Stats",
    icon: TrendingUp,
    blurb:
      "Supply, circulation, burn, and stake — the ledger of the gold rush.",
  },
  {
    label: "Auctions",
    icon: Gavel,
    blurb:
      "Rare claims go to the highest bidder. The auction house never sleeps.",
  },
  {
    label: "LP",
    icon: Scale,
    blurb:
      "Liquidity pools that keep the frontier solvent and the wheels turning.",
  },
  {
    label: "Reserve",
    icon: Landmark,
    blurb: "The Fort Knox of the Smoke Frontier — vaulted, guarded, and deep.",
  },
  {
    label: "Staking",
    icon: Coins,
    blurb: "Park your gold in the strongbox and earn while the mine works.",
  },
  {
    label: "Contracts",
    icon: FileText,
    blurb: "The fine print of the claim — audited, on-chain, and binding.",
  },
  {
    label: "Docs",
    icon: BookOpen,
    blurb: "The miner's almanac. Read up before you swing the pick.",
  },
];

/** Format a bigint metric with thousands separators. */
function formatMetric(value: bigint): string {
  return value.toLocaleString("en-US");
}

interface GoldPanelProps {
  meta: PanelMeta;
  index: number;
}

function GoldPanel({ meta, index }: GoldPanelProps) {
  const reduce = useReducedMotion();
  const Icon = meta.icon;
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 24 }}
      whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{
        duration: 0.55,
        delay: reduce ? 0 : (index % 4) * 0.08,
        ease: [0.22, 1, 0.36, 1] as const,
      }}
      data-ocid={`gold.panel.${meta.label.toLowerCase()}`}
      className="h-full"
    >
      <GlassCard
        variant="gold"
        revealAmount={0}
        className="group flex h-full flex-col gap-3 p-5"
      >
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-lg border border-gold/40 bg-gold/10">
            <Icon className="size-5 text-gold" aria-hidden="true" />
          </span>
          <h3 className="font-display text-lg font-bold tracking-tight text-foreground">
            {meta.label}
          </h3>
        </div>
        <p className="font-body text-sm leading-relaxed text-muted-foreground">
          {meta.blurb}
        </p>
        <span className="mt-auto inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-gold/80">
          <Archive className="size-3" aria-hidden="true" />
          Claim open
        </span>
      </GlassCard>
    </motion.div>
  );
}

/**
 * GOLD / Gold Mine protocol section.
 *
 * Styled as Fort Knox x 1800s gold mine x modern Web3 dashboard. The GOLD logo
 * was NOT supplied — it renders as a labeled replaceable placeholder slot so
 * the official asset can be dropped in without redesign. Warm metallic GOLD,
 * brass/parchment materials, and a gold-shimmer sweep carry the environmental
 * storytelling. Live-ish token metrics flow through `useTokenMetrics`.
 */
export function Gold() {
  const reduce = useReducedMotion();
  const { data: metrics, isLoading, isError } = useTokenMetrics();

  const goldMetric = useMemo(
    () =>
      (metrics ?? []).find((m: TokenMetric) => m.tokenId === "GOLD") ?? null,
    [metrics],
  );

  const stats = useMemo(() => {
    if (!goldMetric) return null;
    return [
      { label: "Supply", value: formatMetric(goldMetric.supply) },
      { label: "Circulating", value: formatMetric(goldMetric.circulating) },
      { label: "Burned", value: formatMetric(goldMetric.burned) },
      { label: "Locked", value: formatMetric(goldMetric.locked) },
      { label: "Staked", value: formatMetric(goldMetric.staked) },
    ];
  }, [goldMetric]);

  return (
    <section
      id="gold"
      className="relative z-10 overflow-hidden px-4 py-24 sm:px-6 sm:py-28 lg:px-8"
      data-ocid="section.gold"
      aria-labelledby="gold-heading"
    >
      {/* Ambient gold glow + shimmer sweep */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 50% 0%, oklch(0.78 0.13 75 / 0.1), transparent 60%)",
        }}
      />
      <div
        aria-hidden="true"
        className="gold-shimmer pointer-events-none absolute inset-x-0 top-0 h-px"
      />

      <div className="relative mx-auto max-w-7xl">
        {/* Heading */}
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 20 }}
          whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mx-auto max-w-3xl text-center"
        >
          <div className="mx-auto flex size-24 items-center justify-center overflow-hidden rounded-full bg-card/60">
            <img
              src={GOLD_MINE_LOGO_SRC}
              alt="GOLD MINE logo"
              className="size-full object-contain"
            />
          </div>
          <p className="mt-5 font-mono text-xs uppercase tracking-[0.3em] text-gold text-edge-gold">
            Gold Mine
          </p>
          <h2
            id="gold-heading"
            className="mt-3 font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl"
          >
            The <span className="text-gradient-gold text-edge-gold">Vault</span>{" "}
            of the Frontier
          </h2>
          <p className="mt-4 font-body text-base leading-relaxed text-muted-foreground sm:text-lg">
            Fort Knox meets the 1800s gold mine. Strike the vein, bank the bars,
            and let the reserve do the talking.
          </p>
        </motion.div>

        {/* Stats — live-ish metrics from the repository */}
        <div className="mt-14">
          <div className="mb-5 flex items-center justify-between gap-3">
            <h3 className="font-display text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              The Ledger
            </h3>
            {goldMetric?.isDemo ? (
              <DemoBadge label="DEMO" data-ocid="gold.demo_badge" />
            ) : null}
          </div>

          {isLoading ? (
            <div
              className="flex items-center justify-center gap-3 rounded-xl border border-dashed border-gold/30 bg-gold/5 p-10 font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground/70"
              data-ocid="gold.loading_state"
            >
              Weighing the bars…
            </div>
          ) : isError ? (
            <div
              className="flex items-center justify-center rounded-xl border border-dashed border-destructive/40 bg-destructive/5 p-10 text-center font-mono text-xs uppercase tracking-[0.2em] text-destructive/80"
              data-ocid="gold.error_state"
            >
              Could not load the gold ledger. The data source may be
              unavailable.
            </div>
          ) : stats ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {stats.map((stat) => (
                <StatCard
                  key={stat.label}
                  label={stat.label}
                  value={stat.value}
                  isDemo={goldMetric?.isDemo}
                  tooltip="Demo-sourced metric. Will be replaced by live ICP canister data when the backend source is connected."
                  accent="gold"
                  data-ocid={`gold.stat.${stat.label.toLowerCase()}`}
                />
              ))}
            </div>
          ) : (
            <div
              className="flex items-center justify-center rounded-xl border border-dashed border-gold/30 bg-gold/5 p-10 text-center font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground/60"
              data-ocid="gold.empty_state"
            >
              Awaiting data source
            </div>
          )}
        </div>

        {/* Panel grid — Mining / Stats / Auctions / LP / Reserve / Staking / Contracts / Docs */}
        <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {PANELS.map((meta, index) => (
            <GoldPanel key={meta.label} meta={meta} index={index} />
          ))}
        </div>

        {/* Caption */}
        <motion.p
          initial={reduce ? false : { opacity: 0 }}
          whileInView={reduce ? undefined : { opacity: 1 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-12 text-center font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground/70"
        >
          The gold rush is open. Stake your claim.
        </motion.p>
      </div>
    </section>
  );
}

export default Gold;
