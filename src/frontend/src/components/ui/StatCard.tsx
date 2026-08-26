import { DemoBadge } from "@/components/ui/DemoBadge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { HelpCircle } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

export interface StatCardProps {
  label: string;
  value: string;
  isDemo?: boolean;
  tooltip?: string;
  className?: string;
  /** Optional accent color for the value. */
  accent?: "smoke" | "blue" | "gold";
  "data-ocid"?: string;
}

const ACCENT_TEXT: Record<NonNullable<StatCardProps["accent"]>, string> = {
  smoke: "text-primary text-edge-smoke",
  blue: "text-accent text-edge-blue",
  gold: "text-gold text-edge-gold",
};

/**
 * Stat display tile — label, value, optional DEMO badge, optional tooltip.
 *
 * Used in the tokenomics and ecosystem sections to surface supply, burn,
 * staked, and circulating figures. When `isDemo` is true, a DEMO badge is
 * shown so demo-sourced numbers are never mistaken for live data.
 */
export function StatCard({
  label,
  value,
  isDemo,
  tooltip,
  className,
  accent,
  "data-ocid": dataOcid,
}: StatCardProps) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      initial={!reduce ? { opacity: 0, y: 16 } : false}
      whileInView={!reduce ? { opacity: 1, y: 0 } : undefined}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      data-ocid={dataOcid}
      className={cn(
        "wood flex flex-col gap-2 rounded-xl p-5 transition-all duration-300 hover:edge-smoke hover:border-primary/40",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          {label}
        </span>
        <div className="flex items-center gap-2">
          {isDemo && <DemoBadge />}
          {tooltip && (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  aria-label={`More info about ${label}`}
                  className="text-muted-foreground/60 transition-colors hover:text-primary"
                >
                  <HelpCircle className="size-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent className="max-w-[14rem] border-primary/30 bg-card text-xs text-card-foreground">
                {tooltip}
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>
      <span
        className={cn(
          "font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl",
          accent && ACCENT_TEXT[accent],
        )}
      >
        {value}
      </span>
    </motion.div>
  );
}
