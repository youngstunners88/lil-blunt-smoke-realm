import { LIL_BLUNT_LOGO_SRC, PROTOCOL_LINKS } from "@/lib/brand";
import { ExternalLink } from "lucide-react";
import { SiGithub, SiTelegram, SiX } from "react-icons/si";

/** Internal anchor nav — aligned with the Navbar's section targets. */
const SECTION_LINKS: { label: string; href: string }[] = [
  { label: "Game Showcase", href: "#showcase" },
  { label: "Three Protocols", href: "#protocols" },
  { label: "On-Chain Points", href: "#points" },
];

/** Outbound protocol sites — the three pillars of the Smoke Realm. */
const PROTOCOL_SITES: { label: string; href: string }[] = [
  { label: "SMOKE", href: PROTOCOL_LINKS.smoke },
  { label: "DIAMONDS", href: PROTOCOL_LINKS.diamonds },
  { label: "GOLD", href: PROTOCOL_LINKS.gold },
];

/** Social links are disabled placeholders — no fabricated URLs. */
const SOCIAL_LINKS: { label: string; icon: typeof SiGithub }[] = [
  { label: "X", icon: SiX },
  { label: "Telegram", icon: SiTelegram },
  { label: "GitHub", icon: SiGithub },
];

/**
 * Site footer — clean minimal glass surface in the hybrid dusk/night tone.
 *
 * Left: Lil Blunt logo + "Lil Blunt: The Smoke Realm" wordmark.
 * Right: anchor nav to page sections, outbound protocol links, and
 * disabled social placeholders. A cannabis-appropriate risk/age
 * disclaimer sits above the neutral copyright line. No third-party
 * platform branding appears anywhere on the surface.
 */
export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      className="relative z-10 border-t border-border/60 bg-card/40"
      data-ocid="footer"
    >
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="glass-panel rounded-2xl px-6 py-8 sm:px-8 sm:py-10">
          <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between">
            {/* Brand */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <img
                  src={LIL_BLUNT_LOGO_SRC}
                  alt="Lil Blunt logo"
                  className="size-12 rounded-lg border border-gold/30 object-cover glow-gold"
                  loading="lazy"
                />
                <span className="flex flex-col leading-tight">
                  <span className="font-display text-lg font-semibold tracking-tight text-foreground">
                    Lil Blunt
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-gold">
                    The Smoke Realm
                  </span>
                </span>
              </div>
              <p className="max-w-xs font-body text-sm text-muted-foreground">
                A stoner-chill old-west Web3 arcade. Chill vibes only — you
                can&apos;t tax the vibe.
              </p>

              {/* Social placeholders — disabled, no fabricated URLs */}
              <div className="flex items-center gap-2">
                {SOCIAL_LINKS.map(({ label, icon: Icon }) => (
                  <button
                    key={label}
                    type="button"
                    disabled
                    data-ocid={`footer.social.${label.toLowerCase()}`}
                    title="Coming soon"
                    className="flex size-9 cursor-not-allowed items-center justify-center rounded-lg border border-border/60 bg-muted/40 text-muted-foreground/40"
                  >
                    <Icon className="size-4" />
                    <span className="sr-only">{label} (coming soon)</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Link columns */}
            <div className="grid grid-cols-2 gap-x-10 gap-y-8 sm:grid-cols-2">
              {/* Page sections */}
              <nav className="flex flex-col gap-3" aria-label="Page sections">
                <h2 className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground/70">
                  Explore
                </h2>
                {SECTION_LINKS.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    data-ocid={`footer.link.${link.href.replace("#", "")}`}
                    className="font-body text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    {link.label}
                  </a>
                ))}
              </nav>

              {/* Protocol sites */}
              <nav className="flex flex-col gap-3" aria-label="Protocol sites">
                <h2 className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground/70">
                  Ecosystem
                </h2>
                {PROTOCOL_SITES.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-ocid={`footer.protocol.${link.label.toLowerCase()}`}
                    className="group inline-flex items-center gap-1.5 font-body text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    {link.label}
                    <ExternalLink className="size-3 opacity-50 transition-opacity group-hover:opacity-100" />
                  </a>
                ))}
              </nav>
            </div>
          </div>

          {/* Disclaimers */}
          <div className="mt-10 flex flex-col gap-2 border-t border-border/50 pt-6">
            <p className="font-mono text-xs text-muted-foreground/80">
              For entertainment purposes only. 21+. Not financial advice.
            </p>
            <p className="font-mono text-xs text-muted-foreground/70">
              Web3 gaming involves risk. Play responsibly.
            </p>
          </div>

          {/* Copyright */}
          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p
              className="font-mono text-xs text-muted-foreground/70"
              data-ocid="footer.copyright"
            >
              © {year}. Lil Blunt — The Smoke Realm. Chill vibes only.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
