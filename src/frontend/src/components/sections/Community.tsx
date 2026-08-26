import { GlassCard } from "@/components/ui/GlassCard";
import { cn } from "@/lib/utils";
import { motion, useReducedMotion } from "motion/react";
import { type ComponentType, useState } from "react";
import { SiDiscord, SiGithub, SiTelegram, SiX } from "react-icons/si";

type CommunityAccent = "smoke" | "blue" | "gold";

interface CommunityChannel {
  id: string;
  name: string;
  /** react-icons/si brand component — clean, recognizable glyphs. */
  Icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  accent: CommunityAccent;
  /** Real URL. When absent, the card renders as a disabled "coming soon" tile. */
  href?: string;
  blurb: string;
}

/**
 * Community channels for the Smoke Frontier.
 *
 * URLs are intentionally omitted — no fabricated links. Each channel renders
 * as a disabled "coming soon" tile until a real URL is provided. Drop a real
 * `href` into the entry below and the card automatically becomes a live link.
 */
const CHANNELS: CommunityChannel[] = [
  {
    id: "x",
    name: "X / Twitter",
    Icon: SiX,
    accent: "smoke",
    blurb: "Hot drops, patch notes, and frontier announcements.",
  },
  {
    id: "telegram",
    name: "Telegram",
    Icon: SiTelegram,
    accent: "blue",
    blurb: "The saloon. Real-time chatter with the devs and the realm.",
  },
  {
    id: "github",
    name: "GitHub",
    Icon: SiGithub,
    accent: "gold",
    blurb: "Open lore, contracts, and the source of the smoke.",
  },
  {
    id: "discord",
    name: "Discord",
    Icon: SiDiscord,
    accent: "smoke",
    blurb: "Find your crew, plan bong parties, and trade run strats.",
  },
];

const ACCENT: Record<
  CommunityAccent,
  { iconColor: string; iconWrap: string; glow: string; label: string }
> = {
  smoke: {
    iconColor: "text-primary text-edge-smoke",
    iconWrap: "border-primary/40 bg-primary/10",
    glow: "group-hover:edge-smoke group-hover:border-primary/60",
    label: "text-primary",
  },
  blue: {
    iconColor: "text-accent text-edge-blue",
    iconWrap: "border-accent/40 bg-accent/10",
    glow: "group-hover:edge-blue group-hover:border-accent/60",
    label: "text-accent",
  },
  gold: {
    iconColor: "text-gold text-edge-gold",
    iconWrap: "border-gold/40 bg-gold/10",
    glow: "group-hover:edge-gold group-hover:border-gold/60",
    label: "text-gold",
  },
};

function ChannelCard({
  channel,
  index,
}: {
  channel: CommunityChannel;
  index: number;
}) {
  const reduce = useReducedMotion();
  const [hovered, setHovered] = useState(false);
  const { Icon } = channel;
  const styles = ACCENT[channel.accent];
  const live = Boolean(channel.href);

  const card = (
    <GlassCard
      variant={channel.accent}
      revealAmount={0}
      className={cn(
        "group relative flex h-full flex-col items-center gap-4 p-7 text-center sm:p-8",
        !live && "opacity-75",
      )}
    >
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 18 }}
        whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{
          duration: 0.5,
          ease: "easeOut",
          delay: index * 0.08,
        }}
        className="flex w-full flex-col items-center gap-4"
      >
        <span
          className={cn(
            "flex size-16 items-center justify-center rounded-2xl border-2 transition-transform duration-300",
            styles.iconWrap,
            styles.glow,
            !reduce && live && "group-hover:scale-110",
          )}
        >
          <Icon className={cn("size-8", styles.iconColor)} aria-hidden={true} />
        </span>

        <div className="flex flex-col gap-1.5">
          <h3
            className={cn(
              "font-display text-lg font-semibold tracking-tight sm:text-xl",
              live ? styles.label : "text-muted-foreground",
            )}
          >
            {channel.name}
          </h3>
          <p className="font-body text-sm leading-relaxed text-muted-foreground/90">
            {channel.blurb}
          </p>
        </div>

        <span
          className={cn(
            "mt-auto inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em]",
            live
              ? "border-primary/40 bg-primary/10 text-primary"
              : "border-border/50 bg-muted/30 text-muted-foreground/70",
          )}
        >
          {live ? "Join now" : "Coming soon"}
        </span>
      </motion.div>
    </GlassCard>
  );

  if (!live) {
    return (
      <div
        data-ocid={`community.channel.${channel.id}`}
        role="img"
        aria-label={`${channel.name} — coming soon`}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="h-full"
      >
        {card}
        {/* Accessible tooltip on hover/focus for the disabled state */}
        {hovered && (
          <span role="tooltip" className="sr-only">
            {channel.name} link is coming soon.
          </span>
        )}
      </div>
    );
  }

  return (
    <a
      href={channel.href}
      target="_blank"
      rel="noopener noreferrer"
      data-ocid={`community.channel.${channel.id}`}
      aria-label={`Join the Smoke Frontier on ${channel.name}`}
      className="block h-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-2xl"
    >
      {card}
    </a>
  );
}

/**
 * Community — the gathering place for the Smoke Frontier.
 *
 * Clean icon tiles for X, Telegram, GitHub, and Discord, styled in the
 * wood/brass/parchment material system. No URLs are fabricated: every channel
 * renders as a disabled "coming soon" tile until a real `href` is provided.
 * Chill, inviting tone — game first, world second, ecosystem third.
 */
export function Community() {
  const reduce = useReducedMotion();

  const fadeUp = (delay: number) => ({
    initial: reduce ? { opacity: 0 } : { opacity: 0, y: 24 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-80px" },
    transition: { duration: 0.6, ease: "easeOut" as const, delay },
  });

  return (
    <section
      id="community"
      data-ocid="section.community"
      className="relative z-10 px-4 py-24 sm:px-6 sm:py-32 lg:px-8"
    >
      <div className="mx-auto w-full max-w-5xl">
        {/* Heading */}
        <motion.div {...fadeUp(0)} className="mb-12 text-center sm:mb-16">
          <span className="brass inline-flex items-center gap-2 rounded-full px-4 py-1.5 font-mono text-[11px] uppercase tracking-[0.3em] text-gold">
            <span
              className="size-1.5 rounded-full bg-gold text-edge-gold"
              aria-hidden="true"
            />
            The Saloon
          </span>
          <h2
            className="mt-6 font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl"
            data-ocid="community.heading"
          >
            <span className="text-gradient-gold text-edge-gold">
              Join the Frontier
            </span>
          </h2>
          <p
            className="mx-auto mt-4 max-w-2xl font-body text-base font-light text-muted-foreground sm:text-lg"
            data-ocid="community.subtitle"
          >
            Pull up. The smoke is always lit and the crew is always chill. Find
            your people across the Smoke Frontier.
          </p>
        </motion.div>

        {/* Channel grid — 2x2 on mobile, 4-up on larger screens */}
        <motion.div
          {...fadeUp(0.1)}
          className="grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4"
          data-ocid="community.grid"
        >
          {CHANNELS.map((channel, index) => (
            <ChannelCard key={channel.id} channel={channel} index={index} />
          ))}
        </motion.div>

        {/* Footer note */}
        <motion.p
          {...fadeUp(0.25)}
          className="mt-12 text-center font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground/60"
        >
          Chill vibes only. You can&apos;t tax the vibe.
        </motion.p>
      </div>
    </section>
  );
}

export default Community;
