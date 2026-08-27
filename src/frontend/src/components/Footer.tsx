import { LIL_BLUNT_LOGO_SRC, PROTOCOL_LINKS, SOCIAL_LINKS } from "@/lib/brand";
import { ExternalLink } from "lucide-react";
import { SiTelegram, SiX } from "react-icons/si";

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

/** Official community channels — founder-supplied accounts. */
const SOCIAL_CHANNELS: {
  label: string;
  href: string;
  icon: typeof SiX;
  description: string;
}[] = [
  {
    label: "X",
    href: SOCIAL_LINKS.x,
    icon: SiX,
    description: "Follow $SMOKE and Lil Blunt: The Smoke Realm on X",
  },
  {
    label: "Telegram",
    href: SOCIAL_LINKS.telegram,
    icon: SiTelegram,
    description: "Join the Lil Blunt: The Smoke Realm community on Telegram",
  },
];

/**
 * Site footer — clean minimal glass surface in the hybrid dusk/night tone.
 *
 * Left: Lil Blunt logo + "Lil Blunt: The Smoke Realm" wordmark.
 * Right: anchor nav to page sections, outbound protocol links, and the
 * official X and Telegram channels. A cannabis-appropriate risk/age
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

              {/* Official community channels */}
              <nav
                className="flex items-center gap-2"
                aria-label="Community channels"
              >
                {SOCIAL_CHANNELS.map(
                  ({ label, href, icon: Icon, description }) => (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer me"
                      data-ocid={`footer.social.${label.toLowerCase()}`}
                      title={description}
                      className="flex size-9 items-center justify-center rounded-lg border border-border/60 bg-muted/40 text-muted-foreground transition-all duration-200 hover:-translate-y-0.5 hover:border-gold/50 hover:text-gold focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    >
                      <Icon className="size-4" aria-hidden="true" />
                      <span className="sr-only">{description}</span>
                    </a>
                  ),
                )}
              </nav>
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
