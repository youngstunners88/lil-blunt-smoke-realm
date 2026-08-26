import { DemoBadge } from "@/components/ui/DemoBadge";
import { GlassCard } from "@/components/ui/GlassCard";
import { useTokenMetrics } from "@/lib/repository";
import type { TokenMetric } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Coins, Flame, Gem, HelpCircle } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useMemo } from "react";

type CascadeStepId = "BLAZE" | "DIAMONDS" | "GOLD";

interface CascadeStep {
  id: CascadeStepId;
  number: number;
  name: string;
  role: string;
  description: string;
  lore: string;
  icon: LucideIcon;
  variant: "smoke" | "blue" | "gold";
  accentText: string;
  textGlowClass: string;
  accentBorder: string;
  accentBg: string;
  tooltipBg: string;
  tooltipText: string;
}

const STEPS: CascadeStep[] = [
  {
    id: "BLAZE",
    number: 1,
    name: "BLAZE",
    role: "The Upstream Throttle",
    description:
      "The upstream token in the cascade. BLAZE is required to mint Diamonds, throttling the supply of everything downstream.",
    lore: "BLAZE emissions decline over time, creating scarcity that cascades through the entire Smoke Realm economy.",
    icon: Flame,
    variant: "smoke",
    accentText: "text-primary",
    textGlowClass: "text-glow-smoke",
    accentBorder: "border-primary/40",
    accentBg: "bg-primary/10",
    tooltipBg: "bg-primary",
    tooltipText: "text-primary-foreground",
  },
  {
    id: "DIAMONDS",
    number: 2,
    name: "DIAMONDS",
    role: "The Mid-Stream Asset",
    description:
      "Minted with BLAZE and used to mint GOLD. Diamonds are the mid-stream asset that links upstream scarcity to downstream value.",
    lore: "Diamonds bridge the cascade — minted from BLAZE, consumed to mint GOLD. Their float is shaped by the upstream throttle and downstream demand.",
    icon: Gem,
    variant: "blue",
    accentText: "text-accent",
    textGlowClass: "text-glow-blue",
    accentBorder: "border-accent/40",
    accentBg: "bg-accent/10",
    tooltipBg: "bg-accent",
    tooltipText: "text-accent-foreground",
  },
  {
    id: "GOLD",
    number: 3,
    name: "GOLD",
    role: "The Terminal Store of Value",
    description:
      "The terminal asset in the cascade. GOLD powers Fort Knox staking and Gold Rush auctions in the Vault ecosystem.",
    lore: "GOLD is the terminal store of value in the Smoke Realm — staked in Fort Knox, wagered in Gold Rush auctions, and the final settling point of the cascade.",
    icon: Coins,
    variant: "gold",
    accentText: "text-gold",
    textGlowClass: "text-glow-gold",
    accentBorder: "border-gold/40",
    accentBg: "bg-gold/10",
    tooltipBg: "bg-gold",
    tooltipText: "text-[oklch(0.13_0.02_85)]",
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 32 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  },
};

const arrowVariants = {
  hidden: { opacity: 0, scale: 0.4 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.4, ease: "easeOut" as const },
  },
};

/**
 * Pull a metric for a cascade step from the repository. Returns null when the
 * metric is not yet loaded so the card can render its role description without
 * inventing numbers. All values come from the typed repository abstraction —
 * no hard-coded supply figures live in the UI.
 */
function useStepMetric(tokenId: CascadeStepId): TokenMetric | null {
  const { data } = useTokenMetrics();
  return useMemo(
    () => (data ?? []).find((m) => m.tokenId === tokenId) ?? null,
    [data, tokenId],
  );
}

function StepCard({ step, index }: { step: CascadeStep; index: number }) {
  const reduce = useReducedMotion();
  const metric = useStepMetric(step.id);
  const Icon = step.icon;

  return (
    <motion.div
      variants={reduce ? undefined : cardVariants}
      initial={reduce ? false : "hidden"}
      whileInView={reduce ? undefined : "visible"}
      viewport={{ once: true, amount: 0.4 }}
      data-ocid={`demand_cascade.card.${step.id.toLowerCase()}`}
      className="h-full"
    >
      <GlassCard
        variant={step.variant}
        revealAmount={0}
        className="flex h-full w-full flex-col items-start gap-5 p-6 sm:p-7"
      >
        {/* Number badge + DEMO indicator */}
        <div className="flex w-full items-center justify-between">
          <span
            className={cn(
              "flex size-10 items-center justify-center rounded-full border font-mono text-sm font-semibold",
              step.accentBorder,
              step.accentBg,
              step.accentText,
            )}
            aria-label={`Step ${step.number}`}
          >
            {step.number}
          </span>
          {metric?.isDemo ? (
            <DemoBadge
              label="DEMO"
              data-ocid={`demand_cascade.demo_badge.${step.id.toLowerCase()}`}
            />
          ) : null}
        </div>

        {/* Icon + token name */}
        <div className="flex items-center gap-3">
          <span
            className={cn(
              "flex size-12 items-center justify-center rounded-xl border",
              step.accentBorder,
              step.accentBg,
            )}
          >
            <Icon
              className={cn("size-6", step.accentText, step.textGlowClass)}
            />
          </span>
          <div className="flex flex-col">
            <h3
              className={cn(
                "font-display text-2xl font-bold tracking-tight",
                step.accentText,
                step.textGlowClass,
              )}
            >
              {step.name}
            </h3>
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              {step.role}
            </span>
          </div>
        </div>

        {/* Description — role only, no hard-coded supply numbers */}
        <p className="font-body text-sm leading-relaxed text-muted-foreground">
          {step.description}
        </p>

        {/* Provenance footer — sourced from the typed metric, never invented */}
        {metric ? (
          <div className="mt-auto flex w-full flex-col gap-1 border-t border-border/40 pt-3">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70">
              Source: {metric.source}
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70">
              {metric.isDemo ? "Demo data" : "Live data"}
            </span>
          </div>
        ) : null}

        {/* Lore tooltip — kept as a title attribute for accessibility */}
        <span className="sr-only">
          Step {index + 1} of {STEPS.length}: {step.name}, {step.role}.{" "}
          {step.lore}
        </span>
      </GlassCard>
    </motion.div>
  );
}

function Connector({ index }: { index: number }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      variants={reduce ? undefined : arrowVariants}
      initial={reduce ? false : "hidden"}
      whileInView={reduce ? undefined : "visible"}
      viewport={{ once: true, amount: 0.6 }}
      data-ocid={`demand_cascade.connector.${index}`}
      className="flex shrink-0 items-center justify-center self-center"
      aria-hidden="true"
    >
      {/* Desktop: horizontal arrow */}
      <svg
        width="64"
        height="24"
        viewBox="0 0 64 24"
        fill="none"
        role="img"
        aria-label={`Cascade connector ${index + 1}`}
        className="hidden md:block"
      >
        <defs>
          <linearGradient
            id={`conn-grad-${index}`}
            x1="0"
            y1="0"
            x2="64"
            y2="0"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0" stopColor="oklch(0.85 0.22 145)" />
            <stop offset="0.5" stopColor="oklch(0.75 0.18 230)" />
            <stop offset="1" stopColor="oklch(0.78 0.16 85)" />
          </linearGradient>
        </defs>
        <path
          d="M2 12 H54"
          stroke={`url(#conn-grad-${index})`}
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M50 6 L60 12 L50 18"
          stroke={`url(#conn-grad-${index})`}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
      {/* Mobile: vertical arrow */}
      <svg
        width="24"
        height="48"
        viewBox="0 0 24 48"
        fill="none"
        role="img"
        aria-label={`Cascade connector ${index + 1}`}
        className="md:hidden"
      >
        <defs>
          <linearGradient
            id={`conn-grad-v-${index}`}
            x1="0"
            y1="0"
            x2="0"
            y2="48"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0" stopColor="oklch(0.85 0.22 145)" />
            <stop offset="0.5" stopColor="oklch(0.75 0.18 230)" />
            <stop offset="1" stopColor="oklch(0.78 0.16 85)" />
          </linearGradient>
        </defs>
        <path
          d="M12 2 V38"
          stroke={`url(#conn-grad-v-${index})`}
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M6 34 L12 44 L18 34"
          stroke={`url(#conn-grad-v-${index})`}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
    </motion.div>
  );
}

/**
 * The Demand Cascade — a 3-step interactive ecosystem flowchart.
 *
 * BLAZE → DIAMONDS → GOLD, with sequential scroll-reveal animations. Each
 * step explains its ecosystem role without hard-coded supply numbers; all
 * metrics flow from the typed repository abstraction so they can later be
 * sourced from an ICP canister or external API without a UI redesign. The
 * section is anchored at `#ecosystem` so the navbar lands here.
 *
 * Data is demo-sourced today, so the section carries an "ECOSYSTEM DATA — DEMO"
 * label. A "LIVE DATA" label would only appear once a real backend source is
 * connected — which it is not, so DEMO is shown.
 */
export function DemandCascade() {
  const reduce = useReducedMotion();
  const { data: metrics } = useTokenMetrics();
  const anyLive = (metrics ?? []).some((m) => !m.isDemo);
  const dataLabel = anyLive ? "LIVE DATA" : "ECOSYSTEM DATA — DEMO";

  return (
    <section
      id="ecosystem"
      data-ocid="section.ecosystem"
      className="relative z-10 px-4 py-24 sm:px-6 sm:py-28 lg:px-8"
      aria-labelledby="demand-cascade-heading"
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
            Ecosystem
          </p>
          <h2
            id="demand-cascade-heading"
            className="mt-3 font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl"
          >
            The{" "}
            <span className="text-gradient-smoke text-glow-smoke">
              Demand Cascade
            </span>
          </h2>
          <p className="mt-4 font-body text-base leading-relaxed text-muted-foreground sm:text-lg">
            Three tokens, one flow. Value cascades upstream to downstream — each
            step throttles the supply of the next.
          </p>
          <div className="mt-5 flex justify-center">
            <DemoBadge
              label={dataLabel}
              data-ocid="demand_cascade.data_label"
            />
          </div>
        </motion.div>

        {/* Flowchart */}
        <div className="mt-16 flex flex-col items-stretch gap-4 md:flex-row md:items-center md:gap-0">
          {STEPS.map((step, index) => (
            <div
              key={step.id}
              className="flex flex-col items-stretch gap-4 md:flex-row md:items-center md:gap-0"
            >
              <div className="flex-1">
                <StepCard step={step} index={index} />
              </div>
              {index < STEPS.length - 1 && <Connector index={index} />}
            </div>
          ))}
        </div>

        {/* Caption */}
        <motion.p
          initial={reduce ? false : { opacity: 0 }}
          whileInView={reduce ? undefined : { opacity: 1 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-12 flex items-center justify-center gap-2 text-center font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground/70"
        >
          <HelpCircle className="size-3.5" aria-hidden="true" />
          Hover any step to expand the lore. Chill vibes only.
        </motion.p>
      </div>
    </section>
  );
}
