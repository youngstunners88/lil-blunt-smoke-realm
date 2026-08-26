import { ConnectWalletModal } from "@/components/ConnectWalletModal";
import { NeonButton } from "@/components/ui/NeonButton";
import { BLAZE_LOGO_SRC, LIL_BLUNT_LOGO_SRC } from "@/lib/brand";
import { Gamepad2, Triangle, Wallet } from "lucide-react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import { useRef, useState } from "react";

const PLAY_GAME_HREF = "https://youngstunners88.itch.io/lil-blunt-adventure";

function smoothScroll(href: string) {
  const el = document.querySelector(href);
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

/**
 * Far mountain ridge — the darkest, slowest parallax layer. A wide SVG
 * silhouette that sits behind the town and drifts gently as the page scrolls.
 * Dusk/night tone: cool-shifted charcoal with a faint sapphire rim so the
 * crystal-glow particles read against it.
 */
function FarMountains() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 1440 420"
      preserveAspectRatio="xMidYMax slice"
      className="absolute inset-x-0 bottom-0 h-[70%] w-full"
    >
      <path
        d="M0 420 L0 300 L120 210 L240 300 L360 180 L480 290 L600 220 L720 320 L840 200 L960 300 L1080 230 L1200 320 L1320 250 L1440 330 L1440 420 Z"
        fill="oklch(0.13 0.025 270)"
      />
      <path
        d="M0 420 L0 340 L160 260 L300 340 L440 250 L580 350 L720 280 L860 360 L1000 270 L1140 350 L1280 300 L1440 360 L1440 420 Z"
        fill="oklch(0.1 0.025 280)"
      />
      {/* Faint sapphire rim light along the upper ridge — crystal energy */}
      <path
        d="M0 300 L120 210 L240 300 L360 180 L480 290 L600 220 L720 320 L840 200 L960 300 L1080 230 L1200 320 L1320 250 L1440 330"
        fill="none"
        stroke="oklch(0.62 0.17 250 / 0.18)"
        strokeWidth="1.5"
      />
    </svg>
  );
}

/**
 * Near ridge + mining town silhouettes — the faster parallax layer. Dark
 * building shapes with soft cyan crystal-glow windows, a mine entrance, and
 * a headframe tower so the hero reads as a living frontier town, not a logo
 * on black. A warm gold rim light traces the rooftops so the western gold
 * light coexists with the cyan crystal glow. Cool-shifted to dusk/night so
 * neon cyan + emerald + sapphire + gold all read against it.
 */
function MiningTown() {
  const windows = [
    { x: 90, y: 300, w: 10, h: 14 },
    { x: 130, y: 322, w: 10, h: 14 },
    { x: 250, y: 290, w: 10, h: 14 },
    { x: 290, y: 312, w: 10, h: 14 },
    { x: 880, y: 288, w: 10, h: 14 },
    { x: 920, y: 310, w: 10, h: 14 },
    { x: 1150, y: 300, w: 10, h: 14 },
    { x: 1190, y: 322, w: 10, h: 14 },
  ];
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 1440 420"
      preserveAspectRatio="xMidYMax slice"
      className="absolute inset-x-0 bottom-0 h-[62%] w-full"
    >
      {/* Ground ridge — cool dusk earth */}
      <path
        d="M0 420 L0 360 L180 320 L360 360 L560 330 L760 370 L980 340 L1180 370 L1360 350 L1440 370 L1440 420 Z"
        fill="oklch(0.16 0.025 270)"
      />
      {/* Mine headframe tower */}
      <g fill="oklch(0.13 0.022 270)">
        <rect x="640" y="250" width="70" height="110" />
        <rect x="630" y="236" width="90" height="16" />
        <rect x="650" y="252" width="12" height="108" />
        <rect x="688" y="252" width="12" height="108" />
      </g>
      {/* Mine entrance */}
      <path
        d="M700 360 Q700 320 740 320 Q780 320 780 360 Z"
        fill="oklch(0.08 0.02 280)"
      />
      {/* Saloon / general store */}
      <g fill="oklch(0.14 0.022 270)">
        <rect x="60" y="300" width="120" height="60" />
        <rect x="52" y="290" width="136" height="12" />
        <rect x="230" y="310" width="100" height="50" />
        <rect x="224" y="300" width="112" height="12" />
        <rect x="840" y="296" width="110" height="64" />
        <rect x="832" y="286" width="126" height="12" />
        <rect x="1120" y="306" width="130" height="54" />
        <rect x="1112" y="296" width="146" height="12" />
      </g>
      {/* Lit windows — soft cyan crystal glow (diamond energy), no orange */}
      {windows.map((w, i) => (
        <rect
          key={w.x}
          x={w.x}
          y={w.y}
          width={w.w}
          height={w.h}
          rx="1"
          fill="oklch(0.82 0.16 195 / 0.7)"
          className="crystal-pulse"
          style={{ animationDelay: `${i * 0.4}s` }}
        />
      ))}
      {/* Warm gold rim light along the rooftops — western light coexisting
          with the cyan crystal glow so the three worlds read as one scene */}
      <path
        d="M52 290 L188 290 M224 300 L336 300 M630 236 L720 236 M832 286 L958 286 M1112 296 L1258 296"
        fill="none"
        stroke="oklch(0.78 0.13 75 / 0.35)"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * Drifting smoke band — a soft haze rolling across the lower scene. Now a
 * four-color nebula (emerald + cyan + sapphire + gold) so the three protocols
 * are all present in the air the hero breathes. Honors prefers-reduced-motion.
 */
function DriftingSmoke() {
  const reduce = useReducedMotion();
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 overflow-hidden"
    >
      <motion.div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 55% 60% at 30% 80%, oklch(0.72 0.16 150 / 0.12), transparent 70%), radial-gradient(ellipse 40% 50% at 55% 70%, oklch(0.82 0.16 195 / 0.08), transparent 70%), radial-gradient(ellipse 45% 55% at 75% 75%, oklch(0.62 0.17 250 / 0.1), transparent 70%), radial-gradient(ellipse 35% 45% at 88% 65%, oklch(0.78 0.13 75 / 0.08), transparent 70%)",
          filter: "blur(28px)",
        }}
        animate={reduce ? {} : { opacity: [0.5, 0.85, 0.5], x: [0, 40, 0] }}
        transition={{
          duration: 18,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />
    </div>
  );
}

/**
 * Rising ember particles — warm sparks drifting up from the town like chimney
 * glow and campfire embers. Honors prefers-reduced-motion.
 */
function EmberParticles() {
  const reduce = useReducedMotion();
  const embers = [
    { left: "12%", delay: 0, dur: 11, size: 5 },
    { left: "22%", delay: 3, dur: 13, size: 4 },
    { left: "38%", delay: 6, dur: 12, size: 6 },
    { left: "55%", delay: 1.5, dur: 14, size: 4 },
    { left: "68%", delay: 4.5, dur: 11, size: 5 },
    { left: "80%", delay: 7.5, dur: 13, size: 4 },
    { left: "90%", delay: 2.5, dur: 12, size: 6 },
  ];
  if (reduce) return null;
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      {embers.map((e) => (
        <span
          key={e.left}
          className="ember"
          style={{
            left: e.left,
            bottom: "-10px",
            width: e.size,
            height: e.size,
            animationDuration: `${e.dur}s`,
            animationDelay: `${e.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

/**
 * Crystal-glow particles — sapphire/cyan diamond shards drifting upward to
 * represent the DIAMONDS protocol. Honors prefers-reduced-motion.
 */
function CrystalParticles() {
  const reduce = useReducedMotion();
  const crystals = [
    { left: "47%", delay: 6, dur: 19, size: 7 },
    { left: "62%", delay: 1, dur: 16, size: 9 },
    { left: "76%", delay: 5, dur: 18, size: 6 },
    { left: "88%", delay: 3, dur: 17, size: 8 },
  ];
  if (reduce) return null;
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      {crystals.map((c) => (
        <motion.span
          key={c.left}
          className="crystal-glow absolute block rotate-45 rounded-[2px]"
          style={{
            left: c.left,
            bottom: "-20px",
            width: c.size,
            height: c.size,
          }}
          initial={{ y: 0, opacity: 0 }}
          animate={{ y: [-20, -420], opacity: [0, 0.9, 0] }}
          transition={{
            duration: c.dur,
            delay: c.delay,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeOut",
          }}
        />
      ))}
    </div>
  );
}

/**
 * Gold-ore shimmer motes — warm gold flecks drifting up to represent the
 * GOLD protocol. Honors prefers-reduced-motion.
 */
function GoldOreParticles() {
  const reduce = useReducedMotion();
  const motes = [
    { left: "14%", delay: 1.5, dur: 14, size: 5 },
    { left: "28%", delay: 5, dur: 16, size: 4 },
    { left: "42%", delay: 3, dur: 15, size: 6 },
    { left: "58%", delay: 7, dur: 14, size: 4 },
    { left: "72%", delay: 2, dur: 16, size: 5 },
    { left: "84%", delay: 6, dur: 15, size: 6 },
  ];
  if (reduce) return null;
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      {motes.map((m) => (
        <motion.span
          key={m.left}
          className="gold-ore absolute block rounded-full"
          style={{
            left: m.left,
            bottom: "-15px",
            width: m.size,
            height: m.size,
          }}
          initial={{ y: 0, opacity: 0 }}
          animate={{ y: [-15, -380], opacity: [0, 0.85, 0] }}
          transition={{
            duration: m.dur,
            delay: m.delay,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeOut",
          }}
        />
      ))}
    </div>
  );
}

/**
 * Hero section for LIL BLUNT: THE SMOKE REALM. The Lil Blunt logo is mounted
 * as the hero emblem framed in neon-cyan + emerald glow, set against a dusk/
 * night mining town: parallax mountains, town silhouettes with lit windows,
 * drifting four-color smoke, rising embers, sapphire crystal shards, and
 * gold-ore motes — the three protocols present in the air. Environmental
 * motion only — no aggressive zoom or huge text animation.
 *
 * `id="play"` is the navbar anchor target — the navbar logo scrolls here.
 */
export function Hero() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const [walletOpen, setWalletOpen] = useState(false);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const farY = useTransform(scrollYProgress, [0, 1], [0, 70]);
  const nearY = useTransform(scrollYProgress, [0, 1], [0, 150]);

  const fadeUp = (delay: number) => ({
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: {
      duration: 0.7,
      delay,
      ease: "easeOut" as const,
    },
  });

  return (
    <section
      ref={ref}
      id="play"
      data-ocid="section.hero"
      className="relative flex min-h-[100svh] items-center justify-center overflow-hidden px-4 py-24 sm:px-6 lg:px-8"
    >
      {/* Night sky wash — dusk/night with sapphire + emerald + gold undertones */}
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 90% 60% at 50% -10%, oklch(0.62 0.17 250 / 0.22), transparent 60%), radial-gradient(ellipse 60% 50% at 15% 20%, oklch(0.72 0.16 150 / 0.12), transparent 65%), radial-gradient(ellipse 50% 40% at 85% 30%, oklch(0.78 0.13 75 / 0.1), transparent 65%), linear-gradient(180deg, oklch(0.1 0.025 280), oklch(0.13 0.025 270))",
        }}
      />

      {/* Parallax environment */}
      <motion.div
        aria-hidden="true"
        className="absolute inset-0"
        style={{ y: reduce ? 0 : farY }}
      >
        <FarMountains />
      </motion.div>
      <motion.div
        aria-hidden="true"
        className="absolute inset-0"
        style={{ y: reduce ? 0 : nearY }}
      >
        <MiningTown />
      </motion.div>

      <DriftingSmoke />
      <EmberParticles />
      <CrystalParticles />
      <GoldOreParticles />

      {/* BLAZE diamond-on-fire accent — top-right corner glow */}
      <motion.img
        src={BLAZE_LOGO_SRC}
        alt=""
        aria-hidden="true"
        data-ocid="hero.blaze_accent"
        initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.8 }}
        animate={reduce ? { opacity: 0.5 } : { opacity: 0.5, scale: 1 }}
        transition={{ duration: 1.2, delay: 0.6, ease: "easeOut" }}
        className="pointer-events-none absolute right-4 top-20 z-[1] hidden h-24 w-24 select-none object-contain opacity-50 mix-blend-screen sm:block lg:h-32 lg:w-32"
      />

      {/* Content */}
      <div className="relative z-10 mx-auto flex max-w-3xl flex-col items-center text-center">
        {/* Lil Blunt — hero emblem framed in neon-cyan + emerald glow */}
        <motion.div
          {...(reduce
            ? { initial: { opacity: 0 }, animate: { opacity: 1 } }
            : fadeUp(0))}
          className="relative"
          data-ocid="hero.brand_mark"
        >
          {/* Outer emerald glow ring */}
          <div
            aria-hidden="true"
            className="glow-emerald absolute -inset-3 rounded-full"
          />
          {/* Inner cyan glow ring */}
          <div
            aria-hidden="true"
            className="glow-cyan absolute -inset-1.5 rounded-full"
          />
          <div className="glass-panel relative rounded-full p-1.5 sm:p-2">
            <img
              src={LIL_BLUNT_LOGO_SRC}
              alt="Lil Blunt — the bright green frontier outlaw riding his rocket through the Smoke Realm"
              className="relative mx-auto block h-40 w-40 rounded-full object-cover sm:h-52 sm:w-52 lg:h-60 lg:w-60"
              data-ocid="hero.lil_blunt_logo"
            />
          </div>
          {/* Gold shimmer sweep across the emblem */}
          <div
            aria-hidden="true"
            className="gold-shimmer pointer-events-none absolute inset-0 rounded-full opacity-30"
          />
        </motion.div>

        {/* Eyebrow */}
        <motion.div
          {...(reduce
            ? { initial: { opacity: 0 }, animate: { opacity: 1 } }
            : fadeUp(0.12))}
          className="mt-10"
        >
          <span
            className="glass-panel inline-flex items-center gap-2 rounded-full px-4 py-1.5 font-mono text-[11px] uppercase tracking-[0.3em] text-accent sm:text-xs"
            data-ocid="hero.eyebrow"
          >
            <span className="size-1.5 rounded-full bg-gold lantern-flicker" />
            Web3 2D Platformer
          </span>
        </motion.div>

        {/* Headline — premium display typography with realm tri-color gradient */}
        <motion.h1
          {...(reduce
            ? { initial: { opacity: 0 }, animate: { opacity: 1 } }
            : fadeUp(0.2))}
          className="mt-6 font-display text-4xl font-bold leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl"
          data-ocid="hero.headline"
        >
          <span className="text-gradient-realm text-edge-cyan">
            Lil Blunt: The Smoke Realm
          </span>
        </motion.h1>

        {/* CTAs */}
        <motion.div
          {...(reduce
            ? { initial: { opacity: 0 }, animate: { opacity: 1 } }
            : fadeUp(0.42))}
          className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:gap-5"
        >
          <NeonButton
            variant="smoke"
            size="xl"
            href={PLAY_GAME_HREF}
            external
            ariaLabel="Play Lil Blunt: The Smoke Realm on itch.io (opens in a new tab)"
            data-ocid="hero.play_game_button"
          >
            <Gamepad2 className="size-6 transition-transform group-hover:scale-110" />
            Play Game
          </NeonButton>

          <NeonButton
            variant="blue"
            size="lg"
            onClick={() => setWalletOpen(true)}
            ariaLabel="Connect Wallet — sign in with Internet Identity"
            data-ocid="hero.connect_wallet_button"
          >
            <Wallet className="size-5 transition-transform group-hover:scale-110" />
            Connect Wallet
          </NeonButton>
        </motion.div>
      </div>

      {/* Bottom scroll cue */}
      <motion.button
        type="button"
        onClick={() => smoothScroll("#showcase")}
        aria-label="Scroll to the Game Showcase section"
        data-ocid="hero.scroll_chevron"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9, duration: 0.6 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 text-muted-foreground/60 transition-colors hover:text-gold"
      >
        <motion.span
          className="block"
          animate={reduce ? {} : { y: [0, 6, 0] }}
          transition={{
            duration: 1.8,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        >
          <Triangle className="size-5 rotate-90" />
        </motion.span>
      </motion.button>

      {/* Internet Identity connect modal — II only, no MetaMask/Rabby/WalletConnect */}
      <ConnectWalletModal open={walletOpen} onOpenChange={setWalletOpen} />
    </section>
  );
}

export default Hero;
