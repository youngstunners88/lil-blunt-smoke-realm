import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Crown,
  type LucideIcon,
  Rocket,
  Skull,
  Sparkles,
  Vault,
} from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

/**
 * Proof of Play NFT Feats gallery.
 *
 * A responsive 2x2 grid of collector's cards / wanted posters. Each card flips
 * on hover (and on tap for touch devices) to reveal the feat requirement. Cards
 * fade in with a staggered scroll-reveal. Materials are frontier — wood, iron,
 * brass, and parchment — with warm edge highlights instead of neon glass.
 */

type FeatTier = "smoke" | "blue" | "gold" | "vip";

interface Feat {
  id: string;
  name: string;
  icon: LucideIcon;
  requirement: string;
  tier: FeatTier;
  /** Decorative glyph shown behind the icon on the front face. */
  sigil: string;
}

const FEATS: Feat[] = [
  {
    id: "auditor-slayer",
    name: "The Auditor Slayer",
    icon: Skull,
    requirement: "Defeat the Stage 1 Boss without taking damage.",
    tier: "smoke",
    sigil: "✦",
  },
  {
    id: "blaze-rush-champion",
    name: "Blaze Rush Champion",
    icon: Rocket,
    requirement:
      "Complete the Geometry-Dash bonus corridor with 100% coin collection.",
    tier: "blue",
    sigil: "◈",
  },
  {
    id: "fort-knox-whale",
    name: "Fort Knox Whale",
    icon: Vault,
    requirement: "Stake 10,000+ GOLD in the Vault.",
    tier: "gold",
    sigil: "❖",
  },
  {
    id: "smoke-lounge-vip",
    name: "Smoke Lounge VIP",
    icon: Crown,
    requirement:
      "Hold the Smoke Lounge NFT (Grants access to weekly multi-chain Bong Parties).",
    tier: "vip",
    sigil: "♛",
  },
];

const TIER_STYLES: Record<
  FeatTier,
  {
    material: string;
    edge: string;
    accent: string;
    badge: string;
    sigilColor: string;
    seal: string;
    ink: string;
    mutedInk: string;
  }
> = {
  smoke: {
    material: "wood",
    edge: "edge-smoke",
    accent: "text-primary",
    badge: "border-primary/40 text-primary",
    sigilColor: "text-primary/25",
    seal: "border-primary/40",
    ink: "text-foreground",
    mutedInk: "text-muted-foreground",
  },
  blue: {
    material: "iron",
    edge: "edge-blue",
    accent: "text-accent",
    badge: "border-accent/40 text-accent",
    sigilColor: "text-accent/25",
    seal: "border-accent/40",
    ink: "text-foreground",
    mutedInk: "text-muted-foreground",
  },
  gold: {
    material: "brass",
    edge: "edge-gold",
    accent: "text-gold",
    badge: "border-gold/40 text-gold",
    sigilColor: "text-gold/25",
    seal: "border-gold/40",
    ink: "text-foreground",
    mutedInk: "text-muted-foreground",
  },
  vip: {
    // Parchment wanted poster — dark ink on warm paper.
    material: "parchment",
    edge: "edge-smoke",
    accent: "text-[oklch(0.28_0.05_45)]",
    badge: "border-[oklch(0.4_0.05_45)]/50 text-[oklch(0.28_0.05_45)]",
    sigilColor: "text-[oklch(0.28_0.05_45)]/20",
    seal: "border-[oklch(0.4_0.05_45)]/50",
    ink: "text-[oklch(0.24_0.04_45)]",
    mutedInk: "text-[oklch(0.35_0.04_45)]",
  },
};

function NFTCard({ feat, index }: { feat: Feat; index: number }) {
  const reduceMotion = useReducedMotion();
  const Icon = feat.icon;
  const styles = TIER_STYLES[feat.tier];

  return (
    <motion.div
      data-ocid={`nft.card.${index + 1}`}
      initial={
        reduceMotion ? { opacity: 1 } : { opacity: 0, scale: 0.92, y: 24 }
      }
      whileInView={reduceMotion ? undefined : { opacity: 1, scale: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{
        duration: 0.6,
        delay: index * 0.12,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="group [perspective:1400px]"
    >
      <button
        type="button"
        aria-label={`${feat.name} — tap to reveal requirement`}
        className={cn(
          "relative flex h-[22rem] w-full cursor-pointer items-stretch outline-none transition-transform duration-700 [transform-style:preserve-3d]",
          "group-hover:[transform:rotateY(180deg)] group-focus-visible:[transform:rotateY(180deg)]",
          reduceMotion && "animate-none",
        )}
      >
        {/* Front face — collector's card / wanted poster */}
        <div
          className={cn(
            "absolute inset-0 flex flex-col items-center justify-between rounded-2xl p-6 [backface-visibility:hidden]",
            styles.material,
          )}
        >
          {/* Decorative sigil watermark */}
          <span
            aria-hidden="true"
            className={cn(
              "pointer-events-none absolute inset-0 flex items-center justify-center font-display text-[10rem] leading-none select-none",
              styles.sigilColor,
            )}
          >
            {feat.sigil}
          </span>

          <div className="relative z-10 flex w-full items-center justify-between">
            <Badge
              variant="outline"
              className={cn(
                "gap-1 border bg-background/20 font-mono text-[0.6rem] uppercase tracking-[0.2em]",
                styles.badge,
              )}
            >
              <Sparkles className="h-3 w-3" />
              Proof of Play NFT
            </Badge>
            <span
              className={cn(
                "font-mono text-[0.6rem] uppercase tracking-[0.2em]",
                styles.mutedInk,
              )}
            >
              #{String(index + 1).padStart(2, "0")}
            </span>
          </div>

          <div className="relative z-10 flex flex-col items-center gap-4">
            <div
              className={cn(
                "flex h-24 w-24 items-center justify-center rounded-full border-2 border-dashed bg-background/20",
                styles.seal,
                styles.accent,
              )}
            >
              <Icon className="h-12 w-12" strokeWidth={1.5} />
            </div>
            <h3
              className={cn(
                "text-center font-display text-2xl font-semibold leading-tight",
                styles.ink,
              )}
            >
              {feat.name}
            </h3>
          </div>

          <p
            className={cn(
              "relative z-10 font-mono text-[0.65rem] uppercase tracking-[0.25em]",
              styles.mutedInk,
            )}
          >
            ◦ flip to reveal ◦
          </p>
        </div>

        {/* Back face — the requirement */}
        <div
          className={cn(
            "absolute inset-0 flex flex-col items-center justify-center gap-5 rounded-2xl p-7 text-center [backface-visibility:hidden] [transform:rotateY(180deg)]",
            styles.material,
            styles.edge,
          )}
        >
          {/* Decorative border ring on the back */}
          <span
            aria-hidden="true"
            className={cn(
              "pointer-events-none absolute inset-3 rounded-xl border",
              styles.seal,
            )}
          />
          <div className="relative z-10 flex flex-col items-center gap-4">
            <span
              className={cn(
                "font-mono text-[0.65rem] uppercase tracking-[0.3em]",
                styles.accent,
              )}
            >
              Requirement
            </span>
            <Icon className={cn("h-8 w-8", styles.accent)} strokeWidth={1.5} />
            <p
              className={cn(
                "max-w-[16rem] font-body text-base leading-relaxed",
                styles.ink,
              )}
            >
              {feat.requirement}
            </p>
            <span
              className={cn(
                "mt-2 font-display text-lg font-medium",
                styles.accent,
              )}
            >
              {feat.name}
            </span>
          </div>
        </div>
      </button>
    </motion.div>
  );
}

export function NFTGallery() {
  return (
    <section
      id="nfts"
      data-ocid="section.nfts"
      className="relative z-10 px-4 py-24 sm:py-32"
    >
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mb-14 text-center"
        >
          <p className="font-mono text-xs uppercase tracking-[0.35em] text-primary/70 text-edge-smoke">
            Smoke Realm Collection
          </p>
          <h2 className="mt-3 font-display text-4xl font-bold text-gradient-smoke sm:text-5xl">
            Proof of Play
          </h2>
          <p className="mx-auto mt-4 max-w-xl font-body text-base text-muted-foreground">
            NFT Feats earned in the Smoke Realm — on-chain trophies minted only
            to those who prove their smoke.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
          {FEATS.map((feat, i) => (
            <NFTCard key={feat.id} feat={feat} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default NFTGallery;
