import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { Fingerprint, LogOut, Sparkles } from "lucide-react";

/**
 * Internet Identity sign-in modal. Internet Identity ONLY — no MetaMask,
 * Rabby, or WalletConnect buttons anywhere. Triggers II sign-in via
 * `useInternetIdentity().login()`, shows the principal on success, and
 * offers a disconnect action via `clear()`.
 *
 * The Navbar handles II directly via its own ConnectControl, so this modal is
 * a secondary surface kept for explicit "connect" flows. It exists to ensure
 * there is exactly one auth method surfaced to the user.
 */
export function ConnectWalletModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { identity, login, clear, isAuthenticated, isLoggingIn, isLoginError } =
    useInternetIdentity();
  const principal = identity?.getPrincipal().toText() ?? null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="glass border-primary/30 sm:max-w-md"
        data-ocid="connect_wallet.modal"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display text-2xl">
            <Sparkles className="size-5 text-primary text-glow-smoke" />
            <span className="text-gradient-smoke">Internet Identity</span>
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Sign in with Internet Identity — the ICP-native passwordless
            identity. No browser wallets, no extensions, no seed phrases. Chill
            vibes only.
          </DialogDescription>
        </DialogHeader>

        {isAuthenticated && principal ? (
          <div className="mt-4 flex flex-col gap-4">
            <div
              className="flex items-center gap-3 rounded-xl border border-primary/40 bg-primary/10 p-4"
              data-ocid="connect_wallet.connected"
            >
              <Fingerprint
                className="size-6 text-primary text-glow-smoke"
                aria-hidden="true"
              />
              <div className="flex min-w-0 flex-col gap-0.5">
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  Connected principal
                </span>
                <span className="break-all font-mono text-xs text-primary">
                  {principal}
                </span>
              </div>
            </div>
            <Button
              type="button"
              onClick={() => {
                clear();
                onOpenChange(false);
              }}
              data-ocid="connect_wallet.disconnect_button"
              className="glow-smoke border border-primary/40 bg-primary/15 text-primary hover:bg-primary/25"
            >
              <LogOut className="size-4" aria-hidden="true" />
              Disconnect
            </Button>
          </div>
        ) : (
          <div className="mt-4 flex flex-col gap-4">
            {isLoginError && (
              <p
                className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 font-mono text-xs text-destructive"
                data-ocid="connect_wallet.error"
              >
                Sign-in failed. Try again — the haze will clear.
              </p>
            )}
            <Button
              type="button"
              onClick={() => login()}
              disabled={isLoggingIn}
              data-ocid="connect_wallet.sign_in_button"
              className="glow-smoke h-12 border border-primary/40 bg-primary/15 text-primary hover:bg-primary/25 hover:text-glow-smoke"
            >
              <Fingerprint className="size-5" aria-hidden="true" />
              {isLoggingIn
                ? "Opening Internet Identity…"
                : "Sign in with Internet Identity"}
            </Button>
          </div>
        )}

        <p className="mt-2 text-center font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground/70">
          You can&apos;t tax the vibe.
        </p>
      </DialogContent>
    </Dialog>
  );
}
