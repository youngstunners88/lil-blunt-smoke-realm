import {
  DIAMONDS_LOGO_SRC,
  GOLD_MINE_LOGO_SRC,
  LIL_BLUNT_LOGO_SRC,
  PROTOCOL_LINKS,
} from "@/lib/brand";
import { Gem, Leaf, Pickaxe } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import type { ComponentType, SVGProps } from "react";

/**
 * THREE PROTOCOLS section — the three pillars of the Smoke Realm.
 *
 * Each protocol gets its own period-appropriate material surface instead
 * of a shared neon-glass treatment: SMOKE sits in a hazy green smoke-den
 * (cannabis lounge), DIAMONDS sits on cold iron in a lantern-lit mine
 * shaft, and GOLD sits on warm saloon wood with a brass trim — the same
 * .wood / .iron / .smoke-den materials used across the rest of the site.
 * A large, faint watermark icon (leaf / pickaxe+gem / pickaxe+coins)
 * grounds each card in its world without touching the supplied logos.
 *
 * Honors prefers-reduced-motion: entrance transforms are dropped when
 * the user prefers reduced motion (opacity-only fade), and the global
 * reduced-motion CSS disables the decorative animations.
 */

type ProtocolCard = {
  /** Stable id used for data-ocid markers and motion keys. */
  id: "smoke" | "diamonds" | "gold";
  /** Display name shown as the card eyebrow. */
  name: string;
  /** Logo asset path from lib/brand. */
  logoSrc: string;
  /** Accessible description of the logo artwork. */
  logoAlt: string;
  /** External protocol site URL. */
  href: string;
  /** One-line protocol descriptor shown beneath the logo. */
  descriptor: string;
  /** Tailwind classes applied to the card surface (material + base edge). */
  surfaceClass: string;
  /** Tailwind classes applied on hover (lift + themed edge). */
  hoverClass: string;
  /** Tailwind text color class for the protocol name. */
  nameTextClass: string;
  /** Tailwind classes for the circular logo frame's themed bezel. */
  ringClass: string;
  /** Decorative ambient glow class layered behind the logo. */
  ambientClass: string;
  /** Large, low-opacity watermark icon(s) grounding the card's world. */
  watermark: ComponentType<SVGProps<SVGSVGElement>>;
};

const PROTOCOLS: readonly ProtocolCard[] = [
  {
    id: "smoke",
    name: "SMOKE",
    logoSrc: LIL_BLUNT_LOGO_SRC,
    logoAlt:
      "Lil Blunt logo — muscular green creature smoking a cigar while riding a rocket, framed by a cyan ring",
    href: PROTOCOL_LINKS.smoke,
    descriptor: "Cannabis-green haze, blunt smoke curling through the lounge.",
    surfaceClass: "smoke-den",
    hoverClass:
      "hover:-translate-y-1.5 hover:edge-smoke focus-visible:-translate-y-1.5 focus-visible:edge-smoke",
    nameTextClass: "text-[oklch(var(--realm-smoke))]",
    ringClass: "ring-2 ring-[oklch(var(--realm-smoke)/0.55)]",
    ambientClass:
      "bg-[radial-gradient(circle,oklch(var(--realm-smoke)/0.18),transparent_70%)]",
    watermark: Leaf,
  },
  {
    id: "diamonds",
    name: "DIAMONDS",
    logoSrc: DIAMONDS_LOGO_SRC,
    logoAlt:
      "DIAMONDS logo — faceted blue diamond with a silver DIAMONDS wordmark, enclosed by a green ring",
    href: PROTOCOL_LINKS.diamonds,
    descriptor:
      "1800s mining town, lantern-lit shaft, crystal-blue veins in the rock.",
    surfaceClass: "iron",
    hoverClass:
      "hover:-translate-y-1.5 hover:edge-blue focus-visible:-translate-y-1.5 focus-visible:edge-blue",
    nameTextClass: "text-[oklch(var(--realm-blue))]",
    ringClass: "ring-2 ring-[oklch(var(--realm-blue)/0.55)]",
    ambientClass:
      "bg-[radial-gradient(circle,oklch(var(--realm-blue)/0.18),transparent_70%)]",
    watermark: Gem,
  },
  {
    id: "gold",
    name: "GOLD",
    logoSrc: GOLD_MINE_LOGO_SRC,
    logoAlt:
      "Gold Mine 'GM' logo — golden chain circle framing a 3D gold GM wordmark with a pickaxe and Bitcoin symbol over mountain peaks",
    href: PROTOCOL_LINKS.gold,
    descriptor:
      "Wild West gold rush, dusty saloon boards, Fort Knox weight in ore.",
    surfaceClass: "wood",
    hoverClass:
      "hover:-translate-y-1.5 hover:edge-gold focus-visible:-translate-y-1.5 focus-visible:edge-gold",
    nameTextClass: "text-[oklch(var(--realm-gold))]",
    ringClass: "ring-2 ring-[oklch(var(--realm-gold)/0.55)]",
    ambientClass:
      "bg-[radial-gradient(circle,oklch(var(--realm-gold)/0.2),transparent_70%)]",
    watermark: Pickaxe,
  },
] as const;

export function Protocols() {
  const reduce = useReducedMotion();
  const shouldReveal = !reduce;

  return (
    <section
      id="protocols"
      data-ocid="section.protocols"
      className="relative z-10 mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8"
    >
      {/* Section header */}
      <motion.div
        initial={shouldReveal ? { opacity: 0, y: 20 } : { opacity: 0 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="mx-auto max-w-3xl text-center"
      >
        <span
          className="iron inline-flex items-center gap-2 rounded-full px-4 py-1.5 font-mono text-[11px] uppercase tracking-[0.3em] text-[oklch(var(--cyan))]"
          data-ocid="protocols.eyebrow"
        >
          <span className="size-1.5 rounded-full bg-[oklch(var(--cyan))] neon-flicker" />
          Three Protocols
        </span>
        <h2
          className="mt-6 font-display text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl lg:text-5xl"
          data-ocid="protocols.headline"
        >
          One realm.{" "}
          <span className="text-gradient-realm">Three protocols.</span>
        </h2>
        <p
          className="mx-auto mt-4 max-w-xl font-body text-base font-light leading-relaxed text-muted-foreground sm:text-lg"
          data-ocid="protocols.tagline"
        >
          SMOKE, DIAMONDS, and GOLD — the three pillars of the Smoke Realm
          ecosystem. Each protocol powers a different facet of the frontier.
        </p>
      </motion.div>

      {/* Protocol cards — stack on mobile, row on desktop */}
      <div
        className="mt-14 grid grid-cols-1 gap-6 sm:gap-7 lg:grid-cols-3"
        data-ocid="protocols.card.list"
      >
        {PROTOCOLS.map((protocol, index) => (
          <motion.a
            key={protocol.id}
            href={protocol.href}
            target="_blank"
            rel="noopener noreferrer"
            data-ocid={`protocols.card.${protocol.id}`}
            aria-label={`Visit the ${protocol.name} protocol site — ${protocol.descriptor}`}
            initial={shouldReveal ? { opacity: 0, y: 28 } : { opacity: 0 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{
              duration: 0.6,
              ease: [0.22, 1, 0.36, 1],
              delay: shouldReveal ? index * 0.12 : 0,
            }}
            className={`group relative flex flex-col items-center overflow-hidden rounded-2xl p-7 text-center transition-all duration-300 will-change-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:p-8 ${protocol.surfaceClass} ${protocol.hoverClass}`}
          >
            {/* World watermark — large, faint icon grounding the card's setting */}
            <protocol.watermark
              aria-hidden="true"
              strokeWidth={1}
              className="pointer-events-none absolute -bottom-6 -right-6 size-36 text-foreground/[0.05] transition-transform duration-500 group-hover:scale-105"
            />

            {/* Protocol name eyebrow */}
            <span
              className={`relative font-mono text-xs font-semibold uppercase tracking-[0.35em] ${protocol.nameTextClass}`}
              data-ocid={`protocols.card.${protocol.id}.name`}
            >
              {protocol.name}
            </span>

            {/* Circular logo frame with themed ambient glow */}
            <div className="relative z-[1] mt-6 flex items-center justify-center">
              <div
                aria-hidden="true"
                className={`absolute inset-0 -z-10 size-32 rounded-full blur-2xl ${protocol.ambientClass}`}
              />
              <div
                className={`flex size-32 items-center justify-center overflow-hidden rounded-full bg-black/60 ${protocol.ringClass} transition-transform duration-300 group-hover:scale-[1.04] group-focus-visible:scale-[1.04]`}
              >
                <img
                  src={protocol.logoSrc}
                  alt={protocol.logoAlt}
                  loading="lazy"
                  decoding="async"
                  className="size-full object-contain object-center p-1.5"
                  data-ocid={`protocols.card.${protocol.id}.logo`}
                />
              </div>
            </div>

            {/* One-line descriptor */}
            <p
              className="relative mt-6 max-w-[16rem] font-body text-sm font-light leading-relaxed text-muted-foreground"
              data-ocid={`protocols.card.${protocol.id}.descriptor`}
            >
              {protocol.descriptor}
            </p>

            {/* External-link affordance */}
            <span
              className="relative mt-6 inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.2em] text-foreground/70 transition-colors duration-300 group-hover:text-foreground"
              data-ocid={`protocols.card.${protocol.id}.link`}
            >
              Enter {protocol.name}
              <svg
                aria-hidden="true"
                viewBox="0 0 16 16"
                className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M6 3h7v7" />
                <path d="M13 3 6 10" />
                <path d="M10 13H4a1 1 0 0 1-1-1V6" />
              </svg>
            </span>
          </motion.a>
        ))}
      </div>
    </section>
  );
}

export default Protocols;
