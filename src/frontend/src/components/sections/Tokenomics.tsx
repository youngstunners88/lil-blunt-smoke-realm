import { DemoBadge } from "@/components/ui/DemoBadge";
import { GlassCard } from "@/components/ui/GlassCard";
import { StatCard } from "@/components/ui/StatCard";
import { useTokenMetrics } from "@/lib/repository";
import type { TokenMetric } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Coins, Flame, Gem, RefreshCw } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useMemo } from "react";

type AssetAccent = "smoke" | "blue" | "gold";

interface AssetMeta {
  tokenId: string;
  name: string;
  icon: LucideIcon;
  accent: AssetAccent;
  /** Tooltip shown on every stat tile for this asset. */
  tooltip: string;
}

const ASSETS: AssetMeta[] = [
  {
    tokenId: "SMOKE",
    name: "SMOKE",
    icon: Flame,
    accent: "smoke",
    tooltip:
      "Demo-sourced metric. Will be replaced by live ICP canister data when the backend source is connected.",
  },
  {
    tokenId: "DIAMONDS",
    name: "DIAMONDS",
    icon: Gem,
    accent: "blue",
    tooltip:
      "Demo-sourced metric. Will be replaced by live ICP canister data when the backend source is connected.",
  },
  {
    tokenId: "GOLD",
    name: "GOLD",
    icon: Coins,
    accent: "gold",
    tooltip:
      "Demo-sourced metric. Will be replaced by live ICP canister data when the backend source is connected.",
  },
];

const ACCENT_TEXT: Record<AssetAccent, string> = {
  smoke: "text-primary text-glow-smoke",
  blue: "text-accent text-glow-blue",
  gold: "text-gold text-glow-gold",
};

const ACCENT_BORDER: Record<AssetAccent, string> = {
  smoke: "border-primary/40",
  blue: "border-accent/40",
  gold: "border-gold/40",
};

const ACCENT_BG: Record<AssetAccent, string> = {
  smoke: "bg-primary/10",
  blue: "bg-accent/10",
  gold: "bg-gold/10",
};

/** Format a bigint metric with thousands separators. */
function formatMetric(value: bigint): string {
  return value.toLocaleString("en-US");
}

/** Format a nanosecond timestamp into a readable date. */
function formatTimestamp(ns: bigint): string {
  const ms = Number(ns / 1_000_000n);
  if (!ms || Number.isNaN(ms)) return "—";
  return new Date(ms).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

interface AssetPanelProps {
  meta: AssetMeta;
  metric: TokenMetric | null;
  index: number;
}

function AssetPanel({ meta, metric, index }: AssetPanelProps) {
  const reduce = useReducedMotion();
  const Icon = meta.icon;
  const accentText = ACCENT_TEXT[meta.accent];
  const accentBorder = ACCENT_BORDER[meta.accent];
  const accentBg = ACCENT_BG[meta.accent];

  const stats = useMemo(() => {
    if (!metric) return null;
    return [
      {
        label: "Supply",
        value: formatMetric(metric.supply),
      },
      {
        label: "Circulating",
        value: formatMetric(metric.circulating),
      },
      {
        label: "Burned",
        value: formatMetric(metric.burned),
      },
      {
        label: "Locked",
        value: formatMetric(metric.locked),
      },
      {
        label: "Staked",
        value: formatMetric(metric.staked),
      },
    ];
  }, [metric]);

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 28 }}
      whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{
        duration: 0.6,
        delay: reduce ? 0 : index * 0.12,
        ease: [0.22, 1, 0.36, 1] as const,
      }}
      data-ocid={`tokenomics.panel.${meta.tokenId.toLowerCase()}`}
      className="h-full"
    >
      <GlassCard
        variant={meta.accent}
        revealAmount={0}
        className="flex h-full flex-col gap-5 p-6 sm:p-7"
      >
        {/* Header: icon + name + DEMO badge */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span
              className={cn(
                "flex size-12 items-center justify-center rounded-xl border",
                accentBorder,
                accentBg,
              )}
            >
              <Icon className={cn("size-6", accentText)} aria-hidden="true" />
            </span>
            <div className="flex flex-col">
              <h3
                className={cn(
                  "font-display text-2xl font-bold tracking-tight",
                  accentText,
                )}
              >
                {meta.name}
              </h3>
              <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground/70">
                Ecosystem Asset
              </span>
            </div>
          </div>
          {metric?.isDemo ? (
            <DemoBadge
              label="DEMO"
              data-ocid={`tokenomics.demo_badge.${meta.tokenId.toLowerCase()}`}
            />
          ) : null}
        </div>

        {/* Utility description — sourced from the typed metric */}
        <p className="font-body text-sm leading-relaxed text-muted-foreground">
          {metric?.utility ??
            "Utility details will populate when the data source is connected."}
        </p>

        {/* Stat grid */}
        {stats ? (
          <div className="grid grid-cols-2 gap-3">
            {stats.map((stat) => (
              <StatCard
                key={stat.label}
                label={stat.label}
                value={stat.value}
                isDemo={metric?.isDemo}
                tooltip={meta.tooltip}
                accent={meta.accent}
                data-ocid={`tokenomics.stat.${meta.tokenId.toLowerCase()}.${stat.label.toLowerCase()}`}
              />
            ))}
          </div>
        ) : (
          <div
            className="flex items-center justify-center rounded-xl border border-dashed border-border/50 p-8 text-center font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground/60"
            data-ocid={`tokenomics.empty_state.${meta.tokenId.toLowerCase()}`}
          >
            Awaiting data source
          </div>
        )}

        {/* Provenance footer */}
        {metric ? (
          <div className="mt-auto flex flex-col gap-1 border-t border-border/40 pt-3">
            <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70">
              <RefreshCw className="size-3" aria-hidden="true" />
              <span>
                {metric.isDemo ? "Demo source" : "Live source"}: {metric.source}
              </span>
            </div>
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70">
              Last updated: {formatTimestamp(metric.lastUpdated)}
            </span>
          </div>
        ) : null}
      </GlassCard>
    </motion.div>
  );
}

/**
 * Tokenomics dashboard — SMOKE, DIAMONDS, GOLD.
 *
 * Each asset renders in a GlassCard with its realm color variant and surfaces
 * supply, circulating, burned, locked, staked, and utility via StatCard. All
 * values come from the `useTokenMetrics()` repository hook — no supply numbers
 * are hard-coded in the UI. The repository abstraction means these fields can
 * later be populated from an ICP canister or external API without a redesign.
 *
 * Data is demo-sourced today, so the section carries a "DEMO DATA" label. A
 * "LIVE DATA" label would only appear once a real backend source is connected.
 */
export function Tokenomics() {
  const reduce = useReducedMotion();
  const { data: metrics, isLoading, isError } = useTokenMetrics();

  const byId = useMemo(() => {
    const map = new Map<string, TokenMetric>();
    for (const m of metrics ?? []) map.set(m.tokenId, m);
    return map;
  }, [metrics]);

  const anyLive = (metrics ?? []).some((m) => !m.isDemo);
  const dataLabel = anyLive ? "LIVE DATA" : "DEMO DATA";

  return (
    <section
      id="tokenomics"
      data-ocid="section.tokenomics"
      className="relative z-10 px-4 py-24 sm:px-6 sm:py-28 lg:px-8"
      aria-labelledby="tokenomics-heading"
    >
      <div className="mx-auto max-w-7xl">
        {/* Heading */}
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 20 }}
          whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mx-auto max-w-2xl text-center"
        >
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-primary/80 text-glow-smoke">
            Tokenomics
          </p>
          <h2
            id="tokenomics-heading"
            className="mt-3 font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl"
          >
            The{" "}
            <span className="text-gradient-smoke text-glow-smoke">
              Three Assets
            </span>
          </h2>
          <p className="mt-4 font-body text-base leading-relaxed text-muted-foreground sm:text-lg">
            Supply, circulation, burn, lock, and stake metrics for every token
            in the Smoke Realm. Sourced from the ecosystem repository — ready to
            swap demo data for live canister feeds.
          </p>
          <div className="mt-5 flex justify-center">
            <DemoBadge label={dataLabel} data-ocid="tokenomics.data_label" />
          </div>
        </motion.div>

        {/* Loading state */}
        {isLoading ? (
          <div
            className="mt-16 flex items-center justify-center gap-3 font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground/70"
            data-ocid="tokenomics.loading_state"
          >
            <RefreshCw className="size-4 animate-spin" aria-hidden="true" />
            Loading ecosystem metrics…
          </div>
        ) : isError ? (
          <div
            className="mt-16 flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-destructive/40 bg-destructive/5 p-8 text-center font-mono text-xs uppercase tracking-[0.2em] text-destructive/80"
            data-ocid="tokenomics.error_state"
          >
            Could not load token metrics. The data source may be unavailable.
          </div>
        ) : (
          /* Asset grid — three columns desktop, stacked mobile */
          <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-3">
            {ASSETS.map((meta, index) => (
              <AssetPanel
                key={meta.tokenId}
                meta={meta}
                metric={byId.get(meta.tokenId) ?? null}
                index={index}
              />
            ))}
          </div>
        )}

        {/* Caption */}
        <motion.p
          initial={reduce ? false : { opacity: 0 }}
          whileInView={reduce ? undefined : { opacity: 1 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-12 text-center font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground/70"
        >
          Metrics sourced from the repository layer. Chill vibes only.
        </motion.p>
      </div>
    </section>
  );
}
