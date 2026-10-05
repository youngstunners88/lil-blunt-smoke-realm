import { AmbientAudioPlayer } from "@/components/AmbientAudioPlayer";
import { ContentOverlay } from "@/components/ContentOverlay";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { SmokeBackground } from "@/components/SmokeBackground";
import { SmokeTransition } from "@/components/SmokeTransition";
import { Hero } from "@/components/sections/Hero";
import { OnChainPoints } from "@/components/sections/OnChainPoints";
import { PlayGame } from "@/components/sections/PlayGame";
import { Protocols } from "@/components/sections/Protocols";
import { initAnalytics } from "@/lib/analytics";
import { type ContentPage, findContentPage } from "@/lib/contentPages";
import { useCallback, useEffect, useState } from "react";

/**
 * Lil Blunt: The Smoke Realm — single-route landing page.
 *
 * Page structure (per the design contract):
 *   Hero → Game Showcase → Three Protocols → On-Chain Points/ICP → Footer
 *
 * The dark theme tokens (`.dark`) are applied on mount so every
 * semantic color resolves to the REALM dusk/night OKLCH palette.
 * SmokeBackground + Navbar sit above the background; main holds the
 * five sections separated by SmokeTransition bands.
 *
 * NOTE: Hero, PlayGame (Game Showcase), Protocols, OnChainPoints, and
 * Footer are each owned by dedicated page tasks. This file only owns
 * the section ordering and the shared shell.
 */
export default function App() {
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  // Product analytics: records the pageview, engagement depth, and — via the
  // Play Game CTAs — the click through to the game, all keyed to the campaign
  // that delivered the visitor. Returns its own listener cleanup.
  useEffect(() => initAnalytics(), []);

  // The Docs / About / How-to-Play pages open in-app (ContentOverlay) rather
  // than as a full navigation, so the homepage — and the ambient music
  // mounted on it — never unmounts. The URL still updates via pushState so
  // the address bar and the browser's own back/forward stay meaningful.
  const [overlayPage, setOverlayPage] = useState<ContentPage | null>(null);

  const openContentPage = useCallback((page: ContentPage) => {
    window.history.pushState({}, "", page.href);
    setOverlayPage(page);
  }, []);

  const closeContentPage = useCallback(() => {
    window.history.pushState({}, "", "/");
    setOverlayPage(null);
  }, []);

  useEffect(() => {
    const onPopState = () => {
      setOverlayPage(findContentPage(window.location.pathname) ?? null);
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <SmokeBackground />
      <AmbientAudioPlayer />
      <Navbar />
      <main className="relative z-10">
        {/* 1. Hero — owned by the hero page task */}
        <Hero />
        <SmokeTransition />
        {/* 2. Game Showcase — owned by the showcase page task (PlayGame base) */}
        <PlayGame />
        <SmokeTransition />
        {/* 3. Three Protocols — owned by the protocols page task */}
        <Protocols />
        <SmokeTransition />
        {/* 4. On-Chain Points / ICP — owned by the ICP page task */}
        <OnChainPoints />
      </main>
      {/* 5. Footer — owned by the footer page task */}
      <Footer onOpenContentPage={openContentPage} />
      <ContentOverlay
        src={overlayPage?.href ?? null}
        title={overlayPage?.label ?? ""}
        onClose={closeContentPage}
      />
    </div>
  );
}
