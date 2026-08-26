import { motion, useReducedMotion } from "motion/react";

/**
 * Old West Town — the living mining town at the heart of the Smoke Frontier.
 *
 * A VISUAL transition section: a town scene with labeled buildings mapping
 * each landmark to a feature of the frontier. This is deliberately NOT an
 * interactive clickable map — the buildings are static scenery that tells the
 * story of where each feature lives in the town. Environmental storytelling
 * (lantern flicker, drifting dust, rising smoke) keeps it feeling alive.
 */

interface TownBuilding {
  name: string;
  feature: string;
  blurb: string;
  icon: string;
  accent: string;
}

const BUILDINGS: TownBuilding[] = [
  {
    name: "Saloon",
    feature: "Smoke Lounge",
    blurb: "Where the town gathers to unwind and trade tall tales.",
    icon: "🍺",
    accent: "text-primary",
  },
  {
    name: "Assay Office",
    feature: "Gold / Vault",
    blurb: "Where every strike is weighed, assayed, and banked.",
    icon: "⚖️",
    accent: "text-gold",
  },
  {
    name: "Mine",
    feature: "Mining",
    blurb: "The deep dig that keeps the whole town in ore.",
    icon: "⛏️",
    accent: "text-gold",
  },
  {
    name: "General Store",
    feature: "NFTs",
    blurb: "Rare goods and keepsakes from across the frontier.",
    icon: "🏪",
    accent: "text-accent",
  },
  {
    name: "Town Hall",
    feature: "Leaderboard",
    blurb: "Where the town records who digs deepest and stands tallest.",
    icon: "🏛️",
    accent: "text-primary",
  },
  {
    name: "Wanted Board",
    feature: "Bosses / Achievements",
    blurb: "Posters of the toughest marks and the deeds worth chasing.",
    icon: "📜",
    accent: "text-destructive",
  },
];

/** A single drifting dust mote — subtle, environmental. */
function Dust({ delay, left }: { delay: number; left: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.span
      aria-hidden="true"
      className="absolute rounded-full bg-gold/30"
      style={{ left, width: 3, height: 3, filter: "blur(1px)" }}
      initial={{ opacity: 0 }}
      animate={
        reduce
          ? { opacity: 0.3 }
          : { opacity: [0, 0.5, 0], x: [0, 40], y: [0, -30] }
      }
      transition={
        reduce
          ? {}
          : {
              duration: 12,
              delay,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }
      }
    />
  );
}

export function Town() {
  const reduce = useReducedMotion();

  return (
    <section
      id="town"
      className="relative z-10 mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8"
      data-ocid="section.town"
    >
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="wood relative overflow-hidden rounded-2xl p-6 sm:p-10"
      >
        {/* Warm lantern glow wash */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 60% 50% at 50% 0%, oklch(0.78 0.13 75 / 0.1), transparent 70%)",
            filter: "blur(30px)",
          }}
        />

        <div className="relative">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-gold">
            Old West Town
          </p>
          <h2 className="mt-3 max-w-2xl font-display text-3xl font-bold text-foreground sm:text-4xl">
            Welcome to the Smoke Frontier.
          </h2>
          <p className="mt-4 max-w-2xl font-body text-muted-foreground">
            Wood, brass, and parchment. Every building on this street has a job
            to do — and every one of them feeds the frontier.
          </p>
        </div>

        {/* Town scene — labeled buildings, static scenery */}
        <div className="relative mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {BUILDINGS.map((b, i) => (
            <motion.div
              key={b.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{
                duration: 0.5,
                delay: reduce ? 0 : i * 0.1,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="relative flex items-start gap-4 rounded-xl border border-border bg-card/60 p-5"
              data-ocid={`town.building.${i + 1}`}
            >
              {/* Lantern flicker on each building */}
              <div
                aria-hidden="true"
                className="lantern-flicker absolute -top-2 right-4 size-2 rounded-full bg-gold/70"
                style={{ boxShadow: "0 0 12px 2px oklch(0.78 0.13 75 / 0.5)" }}
              />

              <div className="flex size-12 shrink-0 items-center justify-center rounded-lg border border-border bg-card/80 text-2xl">
                <span aria-hidden="true">{b.icon}</span>
              </div>
              <div className="min-w-0">
                <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                  {b.name}
                </p>
                <h3
                  className={`mt-1 font-display text-lg font-bold text-foreground ${b.accent}`}
                >
                  {b.feature}
                </h3>
                <p className="mt-1 font-body text-sm leading-relaxed text-muted-foreground">
                  {b.blurb}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Drifting dust motes across the street */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
        >
          <Dust delay={0} left="12%" />
          <Dust delay={4} left="38%" />
          <Dust delay={8} left="62%" />
          <Dust delay={2} left="82%" />
        </div>
      </motion.div>
    </section>
  );
}

export default Town;
