import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { Fingerprint, LogOut, Menu } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";

type NavLink = { label: string; href: string };

/**
 * Primary navigation — mapped to the 5-section page structure
 * (Hero → Game Showcase → Three Protocols → On-Chain Points/ICP → Footer).
 * The Hero is the top of page (no anchor); these anchors cover the
 * scrollable sections below it.
 */
const NAV_LINKS: NavLink[] = [
  { label: "Game Showcase", href: "#showcase" },
  { label: "Three Protocols", href: "#protocols" },
  { label: "On-Chain Points", href: "#points" },
];

function smoothScroll(href: string) {
  const el = document.querySelector(href);
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function Logo() {
  return (
    <button
      type="button"
      onClick={() => smoothScroll("#play")}
      className="group flex items-center gap-2.5"
      data-ocid="nav.logo"
      aria-label="Lil Blunt: The Smoke Realm — home"
    >
      <span className="glass-panel glow-cyan relative flex size-9 items-center justify-center rounded-lg transition-transform group-hover:scale-105">
        <span className="font-display text-lg font-bold leading-none text-[oklch(var(--cyan))] text-edge-cyan">
          LB
        </span>
      </span>
      <span className="flex flex-col leading-none">
        <span className="font-display text-base font-semibold tracking-tight text-foreground">
          Lil Blunt
        </span>
        <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-gradient-realm">
          The Smoke Realm
        </span>
      </span>
    </button>
  );
}

function DesktopLinks() {
  return (
    <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
      {NAV_LINKS.map((link) => (
        <a
          key={link.href}
          href={link.href}
          onClick={(e) => {
            e.preventDefault();
            smoothScroll(link.href);
          }}
          data-ocid={`nav.link.${link.href.replace("#", "")}`}
          className="rounded-md px-3 py-2 font-body text-sm text-muted-foreground transition-colors hover:text-[oklch(var(--cyan))] hover:text-edge-cyan"
        >
          {link.label}
        </a>
      ))}
    </nav>
  );
}

function truncatePrincipal(p: string): string {
  if (p.length <= 16) return p;
  return `${p.slice(0, 8)}…${p.slice(-4)}`;
}

/**
 * Connect / disconnect control. Internet Identity ONLY — no MetaMask,
 * Rabby, or WalletConnect. When authenticated, shows the truncated
 * principal and a disconnect action; when not, shows the CONNECT
 * INTERNET IDENTITY button.
 */
function ConnectControl({
  onConnect,
  onDisconnect,
  className,
  isLoggingIn,
  isAuthenticated,
  principal,
}: {
  onConnect: () => void;
  onDisconnect: () => void;
  className?: string;
  isLoggingIn: boolean;
  isAuthenticated: boolean;
  principal: string | null;
}) {
  if (isAuthenticated && principal) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <span
          className="glass-panel glow-cyan inline-flex items-center gap-2 rounded-md px-3 py-2 font-mono text-xs text-[oklch(var(--cyan))]"
          data-ocid="nav.identity_chip"
        >
          <Fingerprint className="size-3.5" aria-hidden="true" />
          {truncatePrincipal(principal)}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onDisconnect}
          aria-label="Disconnect Internet Identity"
          data-ocid="nav.disconnect_button"
          className="border border-border bg-card/40 text-muted-foreground hover:text-destructive"
        >
          <LogOut className="size-4" />
        </Button>
      </div>
    );
  }

  return (
    <Button
      type="button"
      onClick={onConnect}
      disabled={isLoggingIn}
      data-ocid="nav.connect_ii_button"
      aria-label="Connect Internet Identity"
      className={cn(
        "glass-panel glow-cyan border border-[oklch(var(--cyan)/0.5)] bg-[oklch(var(--cyan)/0.12)] text-[oklch(var(--cyan))] hover:bg-[oklch(var(--cyan)/0.22)] hover:text-edge-cyan",
        className,
      )}
    >
      <Fingerprint className="size-4" aria-hidden="true" />
      {isLoggingIn ? "Connecting…" : "Connect Internet Identity"}
    </Button>
  );
}

/**
 * Sticky top navigation for LIL BLUNT: THE SMOKE REALM.
 *
 * Left: brand "Lil Blunt / The Smoke Realm" (glass LB mark with cyan
 * glow + text). Center: anchor links Game Showcase / Three Protocols /
 * On-Chain Points with smooth-scroll. Right: CONNECT INTERNET IDENTITY
 * button using `useInternetIdentity()` — Internet Identity ONLY, no
 * MetaMask/Rabby/WalletConnect. Mobile collapses links into a Sheet
 * menu with the same hierarchy and a persistent Connect action. Framer
 * Motion entrance; honors reduced-motion via the user agent.
 */
export function Navbar() {
  const isMobile = useIsMobile();
  const [sheetOpen, setSheetOpen] = useState(false);
  const { identity, login, clear, isAuthenticated, isLoggingIn } =
    useInternetIdentity();
  const principal = identity?.getPrincipal().toText() ?? null;

  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="sticky top-0 z-50 w-full"
    >
      <div className="glass-panel border-b border-[oklch(var(--cyan)/0.18)]">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Logo />

          <DesktopLinks />

          <div className="flex items-center gap-2">
            <ConnectControl
              onConnect={() => login()}
              onDisconnect={clear}
              isLoggingIn={isLoggingIn}
              isAuthenticated={isAuthenticated}
              principal={principal}
            />

            {isMobile && (
              <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                <SheetTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label="Open navigation menu"
                    data-ocid="nav.menu_button"
                    className="glass-panel border border-[oklch(var(--cyan)/0.3)] lg:hidden"
                  >
                    <Menu className="size-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side="right"
                  className="glass-panel border-l border-[oklch(var(--cyan)/0.25)]"
                  data-ocid="nav.sheet"
                >
                  <SheetHeader>
                    <SheetTitle className="font-display text-lg text-foreground">
                      Navigation
                    </SheetTitle>
                  </SheetHeader>
                  <nav
                    className="flex flex-col gap-1 px-4"
                    aria-label="Mobile primary"
                  >
                    {NAV_LINKS.map((link) => (
                      <a
                        key={link.href}
                        href={link.href}
                        onClick={(e) => {
                          e.preventDefault();
                          smoothScroll(link.href);
                          setSheetOpen(false);
                        }}
                        data-ocid={`nav.sheet.link.${link.href.replace("#", "")}`}
                        className="rounded-lg px-4 py-3 font-body text-base text-muted-foreground transition-colors hover:bg-[oklch(var(--cyan)/0.1)] hover:text-[oklch(var(--cyan))] hover:text-edge-cyan"
                      >
                        {link.label}
                      </a>
                    ))}
                  </nav>
                  <div className="mt-auto px-4 pb-6">
                    <ConnectControl
                      onConnect={() => {
                        setSheetOpen(false);
                        login();
                      }}
                      onDisconnect={() => {
                        setSheetOpen(false);
                        clear();
                      }}
                      isLoggingIn={isLoggingIn}
                      isAuthenticated={isAuthenticated}
                      principal={principal}
                      className="w-full"
                    />
                  </div>
                </SheetContent>
              </Sheet>
            )}
          </div>
        </div>
      </div>
    </motion.header>
  );
}
