import { AmbientAudioPlayer } from "@/components/AmbientAudioPlayer";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { SmokeBackground } from "@/components/SmokeBackground";
import { SmokeTransition } from "@/components/SmokeTransition";
import { Hero } from "@/components/sections/Hero";
import { OnChainPoints } from "@/components/sections/OnChainPoints";
import { PlayGame } from "@/components/sections/PlayGame";
import { Protocols } from "@/components/sections/Protocols";
import { useEffect } from "react";

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
      <Footer />
    </div>
  );
}
