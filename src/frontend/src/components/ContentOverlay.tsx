import { JointBackIcon } from "@/components/icons/JointBackIcon";
import { useEffect } from "react";

interface ContentOverlayProps {
  /** Path of the static page to show (e.g. "/about/"), or null when closed. */
  src: string | null;
  title: string;
  onClose: () => void;
}

/**
 * Shows one of the static content pages (About, How to Play, Docs) as an
 * in-app overlay instead of a full page navigation.
 *
 * Those pages stay real, separate, crawlable documents at their own URLs —
 * that is what lets search and AI crawlers read them without JavaScript.
 * But a full `<a href>` navigation to one from the homepage tears down the
 * whole React app, which kills the ambient background music and leaves the
 * browser's native Back button as the only way home.
 *
 * Loading the page in an iframe instead keeps the homepage (and the
 * <AmbientAudioPlayer/> mounted there) alive underneath, so the music never
 * stops, and gives a persistent, on-brand back control instead of relying
 * on browser chrome.
 */
export function ContentOverlay({ src, title, onClose }: ContentOverlayProps) {
  useEffect(() => {
    if (!src) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [src, onClose]);

  if (!src) return null;

  return (
    // biome-ignore lint/a11y/useSemanticElements: a native <dialog> needs imperative showModal()/close() and its own backdrop; this is a full-viewport fixed layer with app-controlled open state instead.
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-[60] flex flex-col bg-background"
      data-ocid="content_overlay"
    >
      <div className="wood flex items-center gap-3 border-b border-[oklch(var(--realm-gold)/0.35)] px-4 py-3">
        <button
          type="button"
          onClick={onClose}
          data-ocid="content_overlay.back"
          aria-label="Back to Lil Blunt: The Smoke Realm"
          className="group flex items-center gap-2 rounded-lg px-2 py-1.5 text-muted-foreground transition-colors hover:text-[oklch(var(--cyan))] focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <JointBackIcon className="size-7 -scale-x-100 text-[oklch(var(--realm-gold))] transition-transform duration-200 group-hover:-translate-x-1" />
          <span className="font-mono text-xs uppercase tracking-[0.2em]">
            Back
          </span>
        </button>
        <span className="ml-auto font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground/70">
          {title}
        </span>
      </div>
      <iframe
        src={src}
        title={title}
        className="h-full w-full flex-1 border-0"
        data-ocid="content_overlay.frame"
      />
    </div>
  );
}

export default ContentOverlay;
