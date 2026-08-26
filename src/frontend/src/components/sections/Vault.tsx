import { DemoBadge } from "@/components/ui/DemoBadge";
import { GlassCard } from "@/components/ui/GlassCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useVaultData } from "@/lib/repository";
import type { VaultCategory, VaultEntry } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  ChevronDown,
  Eye,
  Lock,
  PartyPopper,
  Pickaxe,
  Sofa,
  User,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

/* -------------------------------------------------------------------------- */
/* Static presentation metadata — icon + accent per entry id.                  */
/* Data (title, description, category, status) always comes from the           */
/* repository hook; only the visual treatment is keyed here.                  */
/* -------------------------------------------------------------------------- */

type Accent = "smoke" | "blue" | "gold";

const ENTRY_META: Record<string, { icon: LucideIcon; accent: Accent }> = {
  "the-handler": { icon: User, accent: "blue" },
  "bong-parties": { icon: PartyPopper, accent: "smoke" },
  "the-lounge": { icon: Sofa, accent: "gold" },
  "fort-knox": { icon: Lock, accent: "gold" },
  "gold-rush": { icon: Pickaxe, accent: "smoke" },
};

const DEFAULT_META: { icon: LucideIcon; accent: Accent } = {
  icon: Eye,
  accent: "blue",
};

const CATEGORY_LABEL: Record<VaultCategory, string> = {
  LORE: "LORE",
  GAME_MECHANIC: "GAME MECHANIC",
  ECONOMIC_MECHANIC: "ECONOMIC MECHANIC",
};

const ACCENT: Record<
  Accent,
  {
    hover: string;
    iconWrap: string;
    iconColor: string;
    titleColor: string;
    divider: string;
    categoryTag: string;
    expandedBorder: string;
  }
> = {
  smoke: {
    hover: "hover:edge-smoke hover:border-primary/60",
    iconWrap: "border-primary/40 bg-primary/10",
    iconColor: "text-primary text-edge-smoke",
    titleColor: "text-primary text-edge-smoke",
    divider: "bg-gradient-to-r from-transparent via-primary/50 to-transparent",
    categoryTag: "border-primary/40 bg-primary/10 text-primary",
    expandedBorder:
      "data-[state=open]:edge-smoke data-[state=open]:border-primary/60",
  },
  blue: {
    hover: "hover:edge-blue hover:border-accent/60",
    iconWrap: "border-accent/40 bg-accent/10",
    iconColor: "text-accent text-edge-blue",
    titleColor: "text-accent text-edge-blue",
    divider: "bg-gradient-to-r from-transparent via-accent/50 to-transparent",
    categoryTag: "border-accent/40 bg-accent/10 text-accent",
    expandedBorder:
      "data-[state=open]:edge-blue data-[state=open]:border-accent/60",
  },
  gold: {
    hover: "hover:edge-gold hover:border-gold/60",
    iconWrap: "border-gold/40 bg-gold/10",
    iconColor: "text-gold text-edge-gold",
    titleColor: "text-gold text-edge-gold",
    divider: "bg-gradient-to-r from-transparent via-gold/50 to-transparent",
    categoryTag: "border-gold/40 bg-gold/10 text-gold",
    expandedBorder:
      "data-[state=open]:edge-gold data-[state=open]:border-gold/60",
  },
};

function VaultItem({ entry, index }: { entry: VaultEntry; index: number }) {
  const meta = ENTRY_META[entry.id] ?? DEFAULT_META;
  const styles = ACCENT[meta.accent];
  const Icon = meta.icon;

  return (
    <GlassCard
      variant={
        meta.accent === "blue"
          ? "blue"
          : meta.accent === "gold"
            ? "gold"
            : "smoke"
      }
      revealAmount={0}
      className="mb-4 p-0"
    >
      <AccordionItem
        value={entry.id}
        data-ocid={`vault.item.${index + 1}`}
        className={cn(
          "overflow-hidden rounded-2xl border border-border/60 transition-all duration-300",
          styles.hover,
          styles.expandedBorder,
        )}
      >
        <AccordionTrigger
          className={cn(
            "group relative w-full gap-4 rounded-2xl px-5 py-5 text-left no-underline hover:no-underline sm:px-7 sm:py-6",
            "[&>svg:last-child]:hidden",
          )}
        >
          <span
            className={cn(
              "flex size-12 shrink-0 items-center justify-center rounded-xl border-2 transition-transform duration-300 group-data-[state=open]:scale-110",
              styles.iconWrap,
            )}
          >
            <Icon
              className={cn("size-6", styles.iconColor)}
              aria-hidden="true"
            />
          </span>

          <span className="flex flex-1 flex-col gap-1.5 min-w-0">
            <span
              className={cn(
                "font-display text-xl font-semibold tracking-tight sm:text-2xl truncate",
                styles.titleColor,
              )}
            >
              {entry.title}
            </span>
            <span className="flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  "inline-flex items-center rounded-md border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.15em]",
                  styles.categoryTag,
                )}
              >
                {CATEGORY_LABEL[entry.category]}
              </span>
              <StatusBadge
                status={entry.status}
                data-ocid={`vault.status.${index + 1}`}
              />
            </span>
          </span>

          <ChevronDown
            className={cn(
              "size-5 shrink-0 text-muted-foreground transition-transform duration-300 group-data-[state=open]:rotate-180",
              styles.iconColor,
            )}
            aria-hidden="true"
          />
        </AccordionTrigger>

        <AccordionContent className="px-5 pb-6 sm:px-7">
          {/* Warm divider */}
          <div
            aria-hidden="true"
            className={cn("mb-5 h-px w-full", styles.divider)}
          />

          <p className="font-body text-base leading-relaxed text-foreground/90 sm:text-lg">
            {entry.description}
          </p>
        </AccordionContent>
      </AccordionItem>
    </GlassCard>
  );
}

/**
 * The Vault — a fortified gold reserve of lore & mechanics.
 *
 * Renders an expandable accordion of VaultEntry rows sourced from the
 * useVaultData() repository hook (backend getVaultData()). Each entry shows
 * its title, lore-flavored description, a category tag (LORE / GAME MECHANIC /
 * ECONOMIC MECHANIC), and a StatusBadge (LIVE / IN DEVELOPMENT / LORE /
 * COMING SOON). The status badges enforce honesty — no mechanism is implied
 * as live unless it actually exists. All data is demo (isDemo=true) and is
 * clearly labeled with a DemoBadge.
 *
 * Styled as a fortified gold reserve: brass-plated heading, gold shimmer
 * sweep, and wood/brass/parchment material surfaces.
 */
export function Vault() {
  const reduce = useReducedMotion();
  const { data, isLoading, isError } = useVaultData();
  const entries = data ?? [];

  const fadeUp = (delay: number) => ({
    initial: { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.7, delay, ease: "easeOut" as const },
  });

  return (
    <section
      id="vault"
      data-ocid="section.vault"
      className="relative z-10 px-4 py-24 sm:px-6 sm:py-32 lg:px-8"
    >
      <div className="mx-auto w-full max-w-3xl">
        {/* Section heading */}
        <motion.div
          {...(reduce
            ? { initial: { opacity: 0 }, animate: { opacity: 1 } }
            : fadeUp(0))}
          className="mb-12 text-center sm:mb-16"
        >
          <span className="brass inline-flex items-center gap-2 rounded-full px-4 py-1.5 font-mono text-[11px] uppercase tracking-[0.3em] text-gold">
            <Lock className="size-3.5 text-edge-gold" aria-hidden="true" />
            Fortified Gold Reserve
          </span>
          <h2
            className="mt-6 font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl"
            data-ocid="vault.heading"
          >
            <span className="text-gradient-gold text-edge-gold">THE VAULT</span>
          </h2>
          <p
            className="mt-4 font-body text-base font-light text-muted-foreground sm:text-lg"
            data-ocid="vault.subtitle"
          >
            Lore &amp; Mechanics of the Smoke Frontier
          </p>
          <div className="mt-5 flex justify-center">
            <DemoBadge label="DEMO DATA" data-ocid="vault.demo_badge" />
          </div>
        </motion.div>

        {/* Accordion container */}
        <motion.div
          {...(reduce
            ? { initial: { opacity: 0 }, animate: { opacity: 1 } }
            : fadeUp(0.15))}
        >
          {isError ? (
            <div
              className="wood rounded-2xl p-8 text-center"
              data-ocid="vault.error_state"
            >
              <p className="font-mono text-sm uppercase tracking-[0.2em] text-destructive/80">
                Couldn&apos;t crack the Vault. Chill — try again in a moment.
              </p>
            </div>
          ) : isLoading ? (
            <div
              className="wood rounded-2xl p-8 text-center"
              data-ocid="vault.loading_state"
            >
              <p className="font-mono text-sm uppercase tracking-[0.2em] text-muted-foreground/70">
                Cracking the Vault open…
              </p>
            </div>
          ) : entries.length === 0 ? (
            <div
              className="wood rounded-2xl p-8 text-center"
              data-ocid="vault.empty_state"
            >
              <p className="font-mono text-sm uppercase tracking-[0.2em] text-muted-foreground/70">
                The Vault is sealed for now. Check back soon.
              </p>
            </div>
          ) : (
            <Accordion
              type="single"
              collapsible
              className="w-full"
              defaultValue=""
            >
              {entries.map((entry, index) => (
                <VaultItem key={entry.id} entry={entry} index={index} />
              ))}
            </Accordion>
          )}
        </motion.div>

        {/* Footer note */}
        <motion.p
          {...(reduce
            ? { initial: { opacity: 0 }, animate: { opacity: 1 } }
            : fadeUp(0.3))}
          className="mt-10 text-center font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground/60"
        >
          Chill vibes only. You can&apos;t tax the vibe.
        </motion.p>
      </div>
    </section>
  );
}
