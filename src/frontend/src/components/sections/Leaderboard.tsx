import { LeaderboardTable } from "@/components/ui/LeaderboardTable";
import { NeonButton } from "@/components/ui/NeonButton";
import { useLeaderboard, usePlayerProfile } from "@/lib/repository";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import {
  Fingerprint,
  Loader2,
  LogOut,
  ShieldCheck,
  Trophy,
} from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

/**
 * THE WANTED BOARD — the Smoke Frontier leaderboard.
 *
 * Renders the top outlaws of the frontier via the shared `LeaderboardTable`
 * (columns Rank / Player / Score / Stage / Bosses Defeated / Achievements,
 * responsive table→cards, rank tier colors, DEMO LEADERBOARD label). Data is
 * fetched read-only from the backend through the `useLeaderboard()` repository
 * hook — browser-submitted scores are never treated as authoritative; the
 * backend validates and ranks. All rows are demo data (`isDemo=true`) until a
 * live canister is wired.
 *
 * A CONNECT INTERNET IDENTITY action lives in the board area. Internet
 * Identity is the ONLY auth method — no MetaMask/Rabby/WalletConnect. After
 * auth, the player's principal is associated with their profile via the
 * backend `getPlayerProfile(principal)` repository hook, and the alias is
 * surfaced in the header strip.
 */
export function Leaderboard() {
  const reduce = useReducedMotion();
  const { identity, login, clear, isAuthenticated, isLoggingIn, isLoginError } =
    useInternetIdentity();
  const principal = identity?.getPrincipal().toText() ?? null;

  // Read-only leaderboard fetch — never writes scores. The backend is the
  // source of truth; the browser only displays what the canister returns.
  const { data: entries, isLoading, isError } = useLeaderboard();

  // Associate the authenticated principal with their player profile. The
  // backend owns this mapping; the UI only displays it.
  const { data: profile } = usePlayerProfile(identity?.getPrincipal());

  const isDemo = entries?.some((e) => e.isDemo) ?? true;
  const alias = profile?.alias ?? null;

  return (
    <section
      id="leaderboard"
      data-ocid="section.leaderboard"
      className="relative z-10 px-4 py-24 sm:py-28"
    >
      <div className="mx-auto w-full max-w-6xl">
        {/* Heading */}
        <motion.div
          initial={!reduce ? { opacity: 0, y: 24 } : false}
          whileInView={!reduce ? { opacity: 1, y: 0 } : undefined}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-10 text-center"
        >
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-gold text-edge-gold">
            The Smoke Frontier · On-chain
          </p>
          <h2 className="mt-3 font-display text-4xl font-bold tracking-tight text-gradient-gold sm:text-5xl">
            The Wanted Board
          </h2>
          <p className="mx-auto mt-4 max-w-2xl font-body text-base text-muted-foreground sm:text-lg">
            The most-wanted outlaws of the frontier, ranked by highest score.
            Scores are validated server-side by the canister — the browser never
            submits authoritative runs. Ride tall, or don&apos;t ride at all.
          </p>
        </motion.div>

        {/* Identity / connect strip */}
        <motion.div
          initial={!reduce ? { opacity: 0, y: 16 } : false}
          whileInView={!reduce ? { opacity: 1, y: 0 } : undefined}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
          className="mb-8 flex flex-col items-center justify-center gap-4 sm:flex-row sm:justify-between"
        >
          {isAuthenticated && principal ? (
            <div
              className="wood flex w-full max-w-2xl flex-col gap-3 rounded-2xl p-4 sm:flex-row sm:items-center sm:justify-between"
              data-ocid="leaderboard.identity_panel"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span
                  className="flex size-10 shrink-0 items-center justify-center rounded-full border border-gold/50 bg-gold/15 text-gold text-edge-gold"
                  aria-hidden="true"
                >
                  <ShieldCheck className="size-5" />
                </span>
                <div className="flex min-w-0 flex-col gap-0.5">
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-gold">
                    {alias ? `Profile · ${alias}` : "Internet Identity linked"}
                  </span>
                  <span className="break-all font-mono text-xs text-foreground">
                    {principal}
                  </span>
                  <span className="font-mono text-[10px] text-muted-foreground/80">
                    {alias
                      ? "Your profile is associated with this identity."
                      : "No profile yet — your identity is ready to be linked."}
                  </span>
                </div>
              </div>
              <NeonButton
                variant="gold"
                size="sm"
                onClick={() => clear()}
                ariaLabel="Disconnect Internet Identity"
                data-ocid="leaderboard.disconnect_button"
                className="shrink-0"
              >
                <LogOut className="size-4" aria-hidden="true" />
                Disconnect
              </NeonButton>
            </div>
          ) : (
            <div className="flex w-full max-w-2xl flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <NeonButton
                variant="gold"
                size="md"
                onClick={() => login()}
                disabled={isLoggingIn}
                ariaLabel="Connect Internet Identity"
                data-ocid="leaderboard.connect_button"
              >
                {isLoggingIn ? (
                  <Loader2 className="size-5 animate-spin" aria-hidden="true" />
                ) : (
                  <Fingerprint className="size-5" aria-hidden="true" />
                )}
                {isLoggingIn ? "Connecting…" : "Connect Internet Identity"}
              </NeonButton>
              <p className="text-center font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground/80 sm:text-left">
                Internet Identity only · no wallets
              </p>
            </div>
          )}
        </motion.div>

        {isLoginError && (
          <p
            className="mx-auto mb-6 max-w-2xl rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-center font-mono text-xs text-destructive"
            data-ocid="leaderboard.error"
          >
            Sign-in failed. Try again — the haze will clear.
          </p>
        )}

        {/* Table / loading / error / empty */}
        {isLoading ? (
          <LoadingState />
        ) : isError ? (
          <ErrorState />
        ) : entries && entries.length > 0 ? (
          <motion.div
            initial={!reduce ? { opacity: 0 } : false}
            whileInView={!reduce ? { opacity: 1 } : undefined}
            viewport={{ once: true }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <LeaderboardTable
              entries={entries}
              isDemo={isDemo}
              data-ocid="leaderboard.table"
            />
          </motion.div>
        ) : (
          <EmptyState />
        )}

        {/* Read-only / demo disclaimer */}
        <p
          className="mx-auto mt-6 max-w-3xl text-center font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground/70"
          data-ocid="leaderboard.disclaimer"
        >
          Read-only demo data · scores are validated by the canister, never
          submitted by the browser
        </p>
      </div>
    </section>
  );
}

/** Stable keys for the loading skeleton rows (static, non-indexed). */
const SKELETON_KEYS = ["sk-1", "sk-2", "sk-3", "sk-4", "sk-5", "sk-6"] as const;

function LoadingState() {
  return (
    <div
      data-ocid="leaderboard.loading_state"
      className="wood mx-auto max-w-6xl overflow-hidden rounded-2xl"
    >
      <div className="space-y-2 p-4 sm:p-6">
        {SKELETON_KEYS.map((skeletonKey) => (
          <div
            key={skeletonKey}
            className="flex items-center gap-4 rounded-md border border-gold/20 bg-card/40 px-4 py-3"
          >
            <div className="size-9 animate-pulse rounded-md bg-gold/20" />
            <div className="h-4 w-32 animate-pulse rounded bg-muted/60" />
            <div className="ml-auto h-4 w-20 animate-pulse rounded bg-muted/60" />
            <div className="h-4 w-16 animate-pulse rounded bg-muted/40" />
            <div className="h-4 w-12 animate-pulse rounded bg-muted/40" />
          </div>
        ))}
      </div>
    </div>
  );
}

function ErrorState() {
  return (
    <div
      data-ocid="leaderboard.error_state"
      className="wood mx-auto flex max-w-2xl flex-col items-center rounded-2xl px-8 py-16 text-center"
    >
      <div className="mb-6 flex size-16 items-center justify-center rounded-full border border-destructive/40 bg-destructive/10">
        <Trophy className="size-7 text-destructive" aria-hidden="true" />
      </div>
      <h3 className="font-display text-xl font-semibold text-foreground">
        The haze is thick
      </h3>
      <p className="mt-3 max-w-md font-body text-sm text-muted-foreground">
        Couldn&apos;t pull the wanted board from the canister. The frontier is
        still there — refresh and we&apos;ll try again.
      </p>
    </div>
  );
}

function EmptyState() {
  return (
    <motion.div
      initial={false}
      animate={{ opacity: 1 }}
      data-ocid="leaderboard.empty_state"
      className="wood mx-auto flex max-w-2xl flex-col items-center rounded-2xl px-8 py-16 text-center"
    >
      <div className="mb-6 flex size-16 items-center justify-center rounded-full border border-gold/40 bg-gold/10 edge-gold">
        <Trophy className="size-7 text-gold" aria-hidden="true" />
      </div>
      <h3 className="font-display text-xl font-semibold text-foreground">
        No outlaws yet
      </h3>
      <p className="mt-3 max-w-md font-body text-sm text-muted-foreground">
        The wanted board is empty for now. Be the first to leave a trail across
        the frontier.
      </p>
    </motion.div>
  );
}

export default Leaderboard;
