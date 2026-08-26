import { GlassCard } from "@/components/ui/GlassCard";
import { BLAZE_LOGO_ASSET_REQUIRED, BLAZE_LOGO_SRC } from "@/lib/brand";
import { cn } from "@/lib/utils";
import { Flame, Wind } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useMemo } from "react";

interface Extraction {
  label: string;
  value: string;
  blurb: string;
}

const EXTRACTIONS: Extraction[] = [
  {
    label: "Burn",
    value: "Hot",
    blurb: "The fire that drives the frontier's engines and forges its metal.",
  },
  {
    label: "Extract",
    value: "Deep",
    blurb: "Pulled from the seam, refined in the flame, ready to move.",
  },
  {
    label: "Refine",
    value: "Clean",
    blurb: "Stripped of dross until only the pure burn remains.",
  },
  {
    label: "Vent",
    value: "Green",
    blurb: "Smoke that clears the shaft — the green haze of a working mine.",
  },
];

/** Deterministic ember particles — stable across renders. */
function useEmbers(count: number) {
  return useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: `${(i * 37) % 100}%`,
        delay: `${(i * 0.9) % 12}s`,
        duration: `${9 + (i % 6)}s`,
        size: 3 + (i % 4),
      })),
    [count],
  );
}

/**
 * BLAZE protocol section.
 *
 * Themed fire / mining / extraction with ember particles, an orange-red glow,
 * and green smoke accents. The BLAZE logo was NOT supplied — it renders as a
 * labeled replaceable placeholder slot so the official asset can be dropped in
 * without redesign. Environmental motion: rising embers and a slow flame
 * flicker instead of aggressive zoom.
 */
export function Blaze() {
  const reduce = useReducedMotion();
  const embers = useEmbers(14);

  return (
    <section
      id="blaze"
      className="relative z-10 overflow-hidden px-4 py-24 sm:px-6 sm:py-28 lg:px-8"
      data-ocid="section.blaze"
      aria-labelledby="blaze-heading"
    >
      {/* Fire ambient — orange/red glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 100%, oklch(0.62 0.2 30 / 0.14), transparent 60%), radial-gradient(ellipse 40% 40% at 15% 20%, oklch(0.72 0.16 150 / 0.08), transparent 60%)",
        }}
      />

      {/* Rising ember particles */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        {embers.map((e) => (
          <span
            key={e.id}
            className="ember"
            style={{
              left: e.left,
              bottom: "-10px",
              width: e.size,
              height: e.size,
              animationDelay: e.delay,
              animationDuration: e.duration,
            }}
          />
        ))}
      </div>

      <div className="relative mx-auto max-w-7xl">
        {/* Heading */}
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 20 }}
          whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mx-auto max-w-3xl text-center"
        >
          <div className="mx-auto flex size-20 items-center justify-center overflow-hidden rounded-2xl border border-destructive/40 bg-card/60 p-2">
            <img
              src={BLAZE_LOGO_SRC}
              alt="BLAZE logo"
              className="size-full object-contain"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
          <p className="mt-5 font-mono text-xs uppercase tracking-[0.3em] text-destructive">
            Blaze
          </p>
          <h2
            id="blaze-heading"
            className="mt-3 font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl"
          >
            Burn <span className="text-destructive">Bright</span>, Dig Deep
          </h2>
          <p className="mt-4 font-body text-base leading-relaxed text-muted-foreground sm:text-lg">
            Fire, mining, and extraction — the engine room of the Smoke
            Frontier. Embers rise, the forge glows, and the green smoke clears
            the shaft.
          </p>
          <p className="mt-3 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-destructive/80">
            <span
              className="size-1.5 rounded-full bg-destructive/70"
              aria-hidden="true"
            />
            {BLAZE_LOGO_ASSET_REQUIRED}
          </p>
        </motion.div>

        {/* Extraction grid */}
        <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {EXTRACTIONS.map((item, index) => (
            <motion.div
              key={item.label}
              initial={reduce ? false : { opacity: 0, y: 24 }}
              whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{
                duration: 0.55,
                delay: reduce ? 0 : index * 0.08,
                ease: [0.22, 1, 0.36, 1] as const,
              }}
              data-ocid={`blaze.extraction.${item.label.toLowerCase()}`}
              className="h-full"
            >
              <GlassCard
                variant="default"
                revealAmount={0}
                className="flex h-full flex-col gap-3 p-5"
              >
                <div className="flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-lg border border-destructive/40 bg-destructive/10">
                    <Flame
                      className="size-5 text-destructive"
                      aria-hidden="true"
                    />
                  </span>
                  <h3 className="font-display text-lg font-bold tracking-tight text-foreground">
                    {item.label}
                  </h3>
                </div>
                <p className="font-display text-2xl font-bold tracking-tight text-destructive">
                  {item.value}
                </p>
                <p className="font-body text-sm leading-relaxed text-muted-foreground">
                  {item.blurb}
                </p>
              </GlassCard>
            </motion.div>
          ))}
        </div>

        {/* Green smoke accent strip */}
        <motion.div
          initial={reduce ? false : { opacity: 0 }}
          whileInView={reduce ? undefined : { opacity: 1 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mx-auto mt-12 flex max-w-2xl flex-col items-center justify-center gap-3 rounded-xl border border-primary/30 bg-primary/5 px-6 py-4 sm:flex-row"
          data-ocid="blaze.smoke_accent"
        >
          <Wind className="size-5 text-primary" aria-hidden="true" />
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-primary/90">
            Green smoke clears the shaft — the frontier breathes
          </p>
        </motion.div>
      </div>
    </section>
  );
}

export default Blaze;
