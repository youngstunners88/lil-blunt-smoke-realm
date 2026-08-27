import { NeonButton } from "@/components/ui/NeonButton";
import { Gamepad2, Gem, Pickaxe, Trophy } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

const PLAY_GAME_HREF = "https://youngstunners88.itch.io/lil-blunt-adventure";

/** Gameplay facts — confident frontier copy, no invented token mechanics. */
const GAMEPLAY_FACTS = [
  {
    icon: Pickaxe,
    label: "Dig Deeper",
    text: "Platform your way through Dustrock Mines — jump the carts, dodge the smoke, keep the score climbing.",
  },
  {
    icon: Gem,
    label: "Stack Your Score",
    text: "Every run is a fresh claim. Chase the high score and watch the tax man circle the board.",
  },
  {
    icon: Trophy,
    label: "Ride the Board",
    text: "Your best runs land on the wanted board. The frontier remembers who dug the deepest.",
  },
];

/**
 * GAME SHOWCASE section — the primary game entry point for THE SMOKE REALM.
 *
 * Presents the game with a short description of the 2D platformer gameplay and
 * a "Play Game" CTA linking to itch.io. Environmental motion only, honors
 * prefers-reduced-motion.
 */
export function PlayGame() {
  const reduce = useReducedMotion();

  const fadeUp = (delay: number) => ({
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.3 },
    transition: {
      duration: 0.7,
      delay,
      ease: "easeOut" as const,
    },
  });

  return (
    <section
      id="showcase"
      className="relative z-10 mx-auto max-w-7xl overflow-hidden px-4 py-20 sm:px-6 lg:px-8"
      data-ocid="section.showcase"
    >
      <div className="relative mx-auto max-w-5xl">
        {/* Eyebrow */}
        <motion.div
          {...(reduce
            ? {
                initial: { opacity: 0 },
                whileInView: { opacity: 1 },
                viewport: { once: true },
              }
            : fadeUp(0))}
          className="flex justify-center"
        >
          <span
            className="glass-panel inline-flex items-center gap-2 rounded-full px-4 py-1.5 font-mono text-[11px] uppercase tracking-[0.3em] text-cyan"
            data-ocid="showcase.eyebrow"
          >
            <span className="size-1.5 rounded-full bg-cyan neon-flicker" />
            Game Showcase
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h2
          {...(reduce
            ? {
                initial: { opacity: 0 },
                whileInView: { opacity: 1 },
                viewport: { once: true },
              }
            : fadeUp(0.1))}
          className="mt-6 text-center font-display text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl lg:text-5xl"
          data-ocid="showcase.headline"
        >
          The mine is open.{" "}
          <span className="text-gradient-realm text-edge-cyan">
            Play the game.
          </span>
        </motion.h2>

        {/* Tagline */}
        <motion.p
          {...(reduce
            ? {
                initial: { opacity: 0 },
                whileInView: { opacity: 1 },
                viewport: { once: true },
              }
            : fadeUp(0.2))}
          className="mx-auto mt-4 max-w-2xl text-center font-body text-base font-light leading-relaxed text-muted-foreground sm:text-lg"
          data-ocid="showcase.tagline"
        >
          Dig deeper, stack your score, and ride the wanted board — your runs
          are signed on the Internet Computer.
        </motion.p>

        {/* Gameplay facts */}
        <div className="mt-16 grid gap-4 sm:grid-cols-3 sm:gap-5">
          {GAMEPLAY_FACTS.map((fact, i) => (
            <motion.div
              key={fact.label}
              {...(reduce
                ? {
                    initial: { opacity: 0 },
                    whileInView: { opacity: 1 },
                    viewport: { once: true },
                  }
                : fadeUp(0.35 + i * 0.1))}
              className="glass-panel flex flex-col gap-3 rounded-xl p-5"
              data-ocid={`showcase.fact.${i + 1}`}
            >
              <div className="flex items-center gap-3">
                <span className="glass-panel glow-cyan flex size-10 items-center justify-center rounded-lg text-cyan">
                  <fact.icon className="size-5" aria-hidden="true" />
                </span>
                <h3 className="font-display text-lg font-bold text-foreground">
                  {fact.label}
                </h3>
              </div>
              <p className="font-body text-sm leading-relaxed text-muted-foreground">
                {fact.text}
              </p>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          {...(reduce
            ? {
                initial: { opacity: 0 },
                whileInView: { opacity: 1 },
                viewport: { once: true },
              }
            : fadeUp(0.65))}
          className="mt-12 flex flex-col items-center gap-4"
          data-ocid="showcase.cta"
        >
          <NeonButton
            variant="smoke"
            size="xl"
            href={PLAY_GAME_HREF}
            external
            ariaLabel="Play Lil Blunt: The Smoke Realm on itch.io (opens in a new tab)"
            data-ocid="showcase.play_game_button"
          >
            <Gamepad2 className="size-6 transition-transform group-hover:scale-110" />
            Play Game
          </NeonButton>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Free to play on itch.io
          </p>
        </motion.div>
      </div>
    </section>
  );
}

export default PlayGame;
