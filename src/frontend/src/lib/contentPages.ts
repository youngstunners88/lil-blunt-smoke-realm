/**
 * The static content pages (real, separate, crawlable HTML documents —
 * see ContentOverlay.tsx) that the homepage can open in-app instead of
 * navigating away to.
 */
export interface ContentPage {
  label: string;
  href: string;
}

export const CONTENT_PAGES: ContentPage[] = [
  { label: "Docs", href: "/docs/" },
  { label: "About the Game", href: "/about/" },
  { label: "How to Play", href: "/how-to-play/" },
];

export function findContentPage(path: string): ContentPage | undefined {
  return CONTENT_PAGES.find((page) => page.href === path);
}
