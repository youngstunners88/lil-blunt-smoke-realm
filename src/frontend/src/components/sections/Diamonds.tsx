import { GlassCard } from "@/components/ui/GlassCard";
import { DIAMONDS_LOGO_SRC } from "@/lib/brand";
import { cn } from "@/lib/utils";
import { Gem, Sparkles } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

interface Facet {
  label: string;
  value: string;
  blurb: string;
}

const FACETS: Facet[] = [
  {
    label: "Cut",
    value: "Brilliant",
    blurb: "Every facet cut to catch the light and hold its worth.",
  },
  {
    label: "Clarity",
    value: "Flawless",
    blurb: "No inclusions. No clouding. Pure as the deep mine.",
  },
  {
    label: "Carat",
    value: "Heavy",
    blurb: "Weight enough to move markets and turn heads.",
  },
  {
    label: "Color",
    value: "Diamond Blue",
    blurb: "A cool, crystalline blue that reads true in any light.",
  },
];

/**
 * DIAMONDS protocol section.
 *
 * A dark mine with crystalline formations and diamond-blue illumination,
 * ringed in emerald green. Uses the supplied DIAMONDS logo as-is — no
 * recoloring, no added gradients. Environmental motion: glowing diamonds and
 * a slow crystalline drift instead of aggressive zoom.
 */
export function Diamonds() {
  const reduce = useReducedMotion();

  return (
    <section
      id="diamonds"
      className="relative z-10 overflow-hidden px-4 py-24 sm:px-6 sm:py-28 lg:px-8"
      data-ocid="section.diamonds"
      aria-labelledby="diamonds-heading"
    >
      {/* Dark mine ambient — diamond-blue illumination */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 0%, oklch(0.68 0.1 250 / 0.12), transparent 60%), radial-gradient(ellipse 40% 40% at 85% 80%, oklch(0.72 0.16 150 / 0.08), transparent 60%)",
        }}
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
              src={DIAMONDS_LOGO_SRC}
              alt="DIAMONDS logo"
              className="size-full object-contain"
            />
          </div>
          <p className="mt-5 font-mono text-xs uppercase tracking-[0.3em] text-accent text-edge-blue">
            Diamonds
          </p>
          <h2
            id="diamonds-heading"
            className="mt-3 font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl"
          >
            Cut from the{" "}
            <span className="text-accent text-edge-blue">Deep</span>
          </h2>
          <p className="mt-4 font-body text-base leading-relaxed text-muted-foreground sm:text-lg">
            The crystalline heart of the frontier — luminous, rare, and built to
            hold. Mined in the dark, cut to catch the light.
          </p>
        </motion.div>

        {/* Crystalline formation — glowing diamonds */}
        <div
          className="relative mx-auto mt-14 flex max-w-3xl items-center justify-center gap-6 sm:gap-10"
          aria-hidden="true"
        >
          {[0, 1, 2, 3, 4].map((i) => (
            <motion.div
              key={i}
              className={cn(
                "flex items-center justify-center rounded-lg border border-accent/40 bg-accent/10",
                i % 2 === 0 ? "size-14 sm:size-20" : "size-10 sm:size-14",
              )}
              animate={
                reduce
                  ? undefined
                  : {
                      opacity: [0.5, 1, 0.5],
                      scale: [1, 1.06, 1],
                    }
              }
              transition={{
                duration: 4 + i,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
                delay: i * 0.4,
              }}
            >
              <Gem
                className={cn(
                  "text-accent",
                  i % 2 === 0 ? "size-7 sm:size-10" : "size-5 sm:size-7",
                )}
              />
            </motion.div>
          ))}
        </div>

        {/* Facet grid */}
        <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FACETS.map((facet, index) => (
            <motion.div
              key={facet.label}
              initial={reduce ? false : { opacity: 0, y: 24 }}
              whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{
                duration: 0.55,
                delay: reduce ? 0 : index * 0.08,
                ease: [0.22, 1, 0.36, 1] as const,
              }}
              data-ocid={`diamonds.facet.${facet.label.toLowerCase()}`}
              className="h-full"
            >
              <GlassCard
                variant="blue"
                revealAmount={0}
                className="flex h-full flex-col gap-3 p-5"
              >
                <div className="flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-lg border border-accent/40 bg-accent/10">
                    <Sparkles
                      className="size-5 text-accent"
                      aria-hidden="true"
                    />
                  </span>
                  <h3 className="font-display text-lg font-bold tracking-tight text-foreground">
                    {facet.label}
                  </h3>
                </div>
                <p className="font-display text-2xl font-bold tracking-tight text-accent text-edge-blue">
                  {facet.value}
                </p>
                <p className="font-body text-sm leading-relaxed text-muted-foreground">
                  {facet.blurb}
                </p>
              </GlassCard>
            </motion.div>
          ))}
        </div>

        {/* Emerald ring accent strip */}
        <motion.div
          initial={reduce ? false : { opacity: 0 }}
          whileInView={reduce ? undefined : { opacity: 1 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mx-auto mt-12 flex max-w-2xl items-center justify-center gap-3 rounded-xl border border-primary/30 bg-primary/5 px-6 py-4"
          data-ocid="diamonds.ring_accent"
        >
          <span
            className="size-2 rounded-full bg-primary/80"
            aria-hidden="true"
          />
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-primary/90">
            Ringed in emerald — the smoke green that holds the frontier together
          </p>
        </motion.div>
      </div>
    </section>
  );
}

export default Diamonds;
