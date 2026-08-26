import { GlassCard } from "@/components/ui/GlassCard";
import { Compass, Gamepad2, Trophy } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

/**
 * A single game-first proposition: a small animated icon, a one-word label,
 * and a short supporting line. Used three times in the strip below the hero.
 */
interface Proposition {
  id: "play" | "explore" | "conquer";
  label: string;
  text: string;
  icon: typeof Gamepad2;
  variant: "smoke" | "blue" | "gold";
}

const PROPOSITIONS: Proposition[] = [
  {
    id: "play",
    label: "Play",
    text: "Jump. Dash. Fight. Survive.",
    icon: Gamepad2,
    variant: "smoke",
  },
  {
    id: "explore",
    label: "Explore",
    text: "Smoke Realm → Crystal Realm → Gold Rush.",
    icon: Compass,
    variant: "blue",
  },
  {
    id: "conquer",
    label: "Conquer",
    text: "Defeat bosses. Discover secrets. Set high scores.",
    icon: Trophy,
    variant: "gold",
  },
];

/**
 * Game-First Strip — sits directly under the hero. Three restrained
 * propositions (Play / Explore / Conquer) that frame the experience as
 * game-first, world-second, ecosystem-third. Each is a GlassCard with a small
 * animated icon and a staggered scroll-reveal entrance. Honors
 * prefers-reduced-motion.
 */
export function GameFirstStrip() {
  const reduce = useReducedMotion();

  return (
    <section
      id="game-first"
      data-ocid="section.game_first"
      aria-label="Game-first propositions"
      className="relative z-10 px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24"
    >
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 sm:gap-6">
          {PROPOSITIONS.map((prop, index) => {
            const Icon = prop.icon;
            const glowClass =
              prop.variant === "smoke"
                ? "text-primary text-glow-smoke"
                : prop.variant === "blue"
                  ? "text-accent text-glow-blue"
                  : "text-gold text-glow-gold";

            return (
              <motion.div
                key={prop.id}
                initial={reduce ? { opacity: 0 } : { opacity: 0, y: 20 }}
                whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={
                  reduce
                    ? { duration: 0.4 }
                    : {
                        duration: 0.55,
                        delay: index * 0.12,
                        ease: [0.22, 1, 0.36, 1],
                      }
                }
              >
                <GlassCard
                  variant={prop.variant}
                  revealAmount={0}
                  className="flex h-full flex-col items-center gap-4 text-center"
                >
                  {/* Small animated icon — gentle float, reduced when needed */}
                  <motion.div
                    aria-hidden="true"
                    className={`flex size-12 items-center justify-center rounded-xl border border-border/60 bg-background/40 ${glowClass}`}
                    animate={reduce ? {} : { y: [0, -4, 0] }}
                    transition={
                      reduce
                        ? undefined
                        : {
                            duration: 3.2,
                            repeat: Number.POSITIVE_INFINITY,
                            ease: "easeInOut",
                            delay: index * 0.4,
                          }
                    }
                  >
                    <Icon className="size-6" />
                  </motion.div>

                  {/* Label */}
                  <h3
                    className="font-display text-xl font-bold uppercase tracking-[0.18em] text-foreground"
                    data-ocid={`game_first.${prop.id}.label`}
                  >
                    {prop.label}
                  </h3>

                  {/* Supporting line */}
                  <p
                    className="font-body text-sm font-light leading-relaxed text-muted-foreground sm:text-base"
                    data-ocid={`game_first.${prop.id}.text`}
                  >
                    {prop.text}
                  </p>
                </GlassCard>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
