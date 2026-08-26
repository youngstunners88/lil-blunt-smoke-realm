import {
  BLAZE_LOGO_ASSET_REQUIRED,
  BLAZE_LOGO_SRC,
  DIAMONDS_LOGO_SRC,
  GOLD_MINE_LOGO_ASSET_REQUIRED,
  GOLD_MINE_LOGO_SRC,
  LIL_BLUNT_LOGO_SRC,
} from "@/lib/brand";
import { motion, useReducedMotion } from "motion/react";

/**
 * The Smoke Frontier Economy — the BLAZE → DIAMONDS → GOLD → SMOKE REALM
 * demand cascade rendered as an interactive ecosystem.
 *
 * Four protocol nodes, each carrying its own brand identity. BLAZE and GOLD
 * were not supplied as official assets, so they render as clearly labeled
 * replaceable placeholder slots (BLAZE_LOGO_ASSET_REQUIRED /
 * GOLD_MINE_LOGO_ASSET_REQUIRED) — never fabricated. Hovering a node
 * illuminates it with a warm edge glow and reveals its role in the cascade.
 * Connecting lines trace the flow of value between nodes.
 */

type NodeKey = "blaze" | "diamonds" | "gold" | "smoke";

interface EconomyNode {
  key: NodeKey;
  name: string;
  role: string;
  blurb: string;
  src: string;
  assetRequired?: string;
  edge: string;
  accentText: string;
  accentBorder: string;
}

const NODES: EconomyNode[] = [
  {
    key: "blaze",
    name: "BLAZE",
    role: "The Burn",
    blurb:
      "Where the frontier catches fire. BLAZE is the fuel that sets the whole economy moving.",
    src: BLAZE_LOGO_SRC,
    assetRequired: BLAZE_LOGO_ASSET_REQUIRED,
    edge: "edge-gold",
    accentText: "text-destructive",
    accentBorder: "border-destructive/40",
  },
  {
    key: "diamonds",
    name: "DIAMONDS",
    role: "The Hold",
    blurb:
      "Cut from the deep. DIAMONDS are the crystalline store of value that keeps the town steady.",
    src: DIAMONDS_LOGO_SRC,
    edge: "edge-blue",
    accentText: "text-accent",
    accentBorder: "border-accent/40",
  },
  {
    key: "gold",
    name: "GOLD",
    role: "The Pay",
    blurb:
      "Strike it rich. GOLD is what the mine pays out — the warm metal that settles every score.",
    src: GOLD_MINE_LOGO_SRC,
    assetRequired: GOLD_MINE_LOGO_ASSET_REQUIRED,
    edge: "edge-gold",
    accentText: "text-gold",
    accentBorder: "border-gold/40",
  },
  {
    key: "smoke",
    name: "SMOKE REALM",
    role: "The Home",
    blurb:
      "Where it all lands. The Smoke Realm is the living town that runs on the whole cascade.",
    src: LIL_BLUNT_LOGO_SRC,
    edge: "edge-smoke",
    accentText: "text-primary",
    accentBorder: "border-primary/40",
  },
];

/** Warm ember particle drifting up from the cascade — environmental, not neon. */
function Ember({ delay, left }: { delay: number; left: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.span
      aria-hidden="true"
      className="ember"
      style={{ left, bottom: "-10px", width: 6, height: 6 }}
      initial={{ opacity: 0 }}
      animate={
        reduce ? { opacity: 0.4 } : { opacity: [0, 0.7, 0], y: [0, -140] }
      }
      transition={
        reduce
          ? {}
          : {
              duration: 9,
              delay,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }
      }
    />
  );
}

export function Economy() {
  const reduce = useReducedMotion();

  return (
    <section
      id="economy"
      className="relative z-10 mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8"
      data-ocid="section.economy"
    >
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="wood relative overflow-hidden rounded-2xl p-6 sm:p-10"
      >
        {/* Drifting smoke wash behind the cascade */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 70% 60% at 50% 40%, oklch(0.72 0.16 150 / 0.08), transparent 70%)",
            filter: "blur(30px)",
          }}
        />

        <div className="relative">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-gold">
            The Smoke Frontier Economy
          </p>
          <h2 className="mt-3 max-w-2xl font-display text-3xl font-bold text-foreground sm:text-4xl">
            BLAZE burns. DIAMONDS hold. GOLD pays. The Smoke Realm runs it all.
          </h2>
          <p className="mt-4 max-w-2xl font-body text-muted-foreground">
            One demand cascade keeps the frontier turning. Follow the flow from
            the first spark to the settled score — every node feeds the next.
          </p>
        </div>

        {/* Cascade flow */}
        <div className="relative mt-10">
          {/* Connecting lines — desktop horizontal, mobile vertical */}
          <div aria-hidden="true" className="absolute inset-0 hidden lg:block">
            <svg
              className="h-full w-full"
              viewBox="0 0 1000 220"
              preserveAspectRatio="none"
              fill="none"
            >
              <title>Economy cascade connecting lines</title>
              <path
                d="M 250 110 C 330 110, 330 110, 375 110"
                stroke="oklch(0.78 0.13 75 / 0.35)"
                strokeWidth="2"
                strokeDasharray="6 6"
              />
              <path
                d="M 625 110 C 670 110, 670 110, 750 110"
                stroke="oklch(0.78 0.13 75 / 0.35)"
                strokeWidth="2"
                strokeDasharray="6 6"
              />
              <path
                d="M 250 110 C 250 190, 750 190, 750 110"
                stroke="oklch(0.72 0.16 150 / 0.3)"
                strokeWidth="2"
                strokeDasharray="6 6"
              />
            </svg>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            {NODES.map((node, i) => (
              <motion.div
                key={node.key}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{
                  duration: 0.5,
                  delay: reduce ? 0 : i * 0.12,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className={`group relative flex flex-col items-center rounded-xl border bg-card/70 p-6 text-center transition-all duration-300 hover:-translate-y-1 ${node.edge} ${node.accentBorder}`}
                data-ocid={`economy.node.${node.key}`}
              >
                {/* Hover illumination — warm edge glow */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  style={{
                    boxShadow:
                      node.key === "diamonds"
                        ? "0 0 40px -8px oklch(0.68 0.1 250 / 0.45)"
                        : node.key === "gold"
                          ? "0 0 40px -8px oklch(0.78 0.13 75 / 0.45)"
                          : node.key === "blaze"
                            ? "0 0 40px -8px oklch(0.62 0.2 30 / 0.45)"
                            : "0 0 40px -8px oklch(0.72 0.16 150 / 0.45)",
                  }}
                />

                <div className="relative flex size-20 items-center justify-center overflow-hidden rounded-lg border border-border bg-card/80">
                  <img
                    src={node.src}
                    alt={`${node.name} logo`}
                    className="size-full object-contain transition-transform duration-300 group-hover:scale-105"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display =
                        "none";
                    }}
                  />
                </div>

                <p
                  className={`mt-4 font-mono text-[11px] uppercase tracking-[0.25em] ${node.accentText}`}
                >
                  {node.role}
                </p>
                <h3 className="mt-1 font-display text-xl font-bold text-foreground">
                  {node.name}
                </h3>
                <p className="mt-2 font-body text-sm leading-relaxed text-muted-foreground">
                  {node.blurb}
                </p>

                {node.assetRequired && (
                  <span
                    className="demo-label mt-3"
                    data-ocid={`economy.node.${node.key}.asset_required`}
                  >
                    {node.assetRequired}
                  </span>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Ember particles rising from the cascade */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
        >
          <Ember delay={0} left="18%" />
          <Ember delay={3} left="42%" />
          <Ember delay={6} left="68%" />
          <Ember delay={1.5} left="85%" />
        </div>
      </motion.div>
    </section>
  );
}

export default Economy;
