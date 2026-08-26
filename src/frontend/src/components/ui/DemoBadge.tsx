import { cn } from "@/lib/utils";

export interface DemoBadgeProps {
  className?: string;
  /** Override the default "DEMO" label (e.g. "DEMO DATA"). */
  label?: string;
  "data-ocid"?: string;
}

/**
 * Small DEMO pill built on the `.demo-label` utility.
 *
 * Used wherever demo-sourced data is shown — token metrics, leaderboard
 * rows, vault entries — so demo data is never mistaken for live economic
 * data. The styling is intentionally subtle but unmistakable.
 */
export function DemoBadge({
  className,
  label = "DEMO",
  "data-ocid": dataOcid,
}: DemoBadgeProps) {
  return (
    <span
      className={cn("demo-label inline-flex items-center", className)}
      data-ocid={dataOcid}
    >
      {label}
    </span>
  );
}
