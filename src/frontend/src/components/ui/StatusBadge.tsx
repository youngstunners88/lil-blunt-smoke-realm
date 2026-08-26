import type { VaultStatus } from "@/backend";
import { cn } from "@/lib/utils";

const STATUS_STYLE: Record<VaultStatus, string> = {
  LIVE: "status-live",
  IN_DEVELOPMENT: "status-dev",
  LORE: "status-lore",
  COMING_SOON: "status-soon",
};

const STATUS_LABEL: Record<VaultStatus, string> = {
  LIVE: "LIVE",
  IN_DEVELOPMENT: "IN DEVELOPMENT",
  LORE: "LORE",
  COMING_SOON: "COMING SOON",
};

export interface StatusBadgeProps {
  status: VaultStatus;
  className?: string;
  "data-ocid"?: string;
}

/**
 * Vault status badge — uses the `.status-*` utilities from index.css.
 *
 * LIVE → smoke green, IN DEVELOPMENT → gold, LORE → diamond blue,
 * COMING SOON → muted. Rendered as a small pill so it can sit on any vault
 * card without disrupting the layout.
 */
export function StatusBadge({
  status,
  className,
  "data-ocid": dataOcid,
}: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.15em]",
        STATUS_STYLE[status],
        className,
      )}
      data-ocid={dataOcid}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}
