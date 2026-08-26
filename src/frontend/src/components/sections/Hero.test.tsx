import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Hero } from "@/components/sections/Hero";

// ConnectWalletModal calls useInternetIdentity(), which requires an
// InternetIdentityProvider (and would otherwise attempt network config
// loading). Stub the hook so the hero renders in isolation.
vi.mock("@caffeineai/core-infrastructure", () => ({
  useInternetIdentity: () => ({
    identity: null,
    login: vi.fn(),
    clear: vi.fn(),
    loginStatus: "idle",
    isInitializing: false,
    isLoginIdle: true,
    isLoggingIn: false,
    isLoginSuccess: false,
    isLoginError: false,
    isAuthenticated: false,
    loginError: null,
  }),
}));

function renderHero() {
  return render(<Hero />);
}

/** The decorative crystal shards are motion.spans with class `crystal-glow`. */
function crystalShards() {
  return Array.from(document.querySelectorAll<HTMLElement>(".crystal-glow"));
}

describe("Hero", () => {
  it("renders the PLAY button and Connect Wallet button", () => {
    renderHero();

    const play = screen.getByRole("link", {
      name: "Play Lil Blunt: The Smoke Realm on itch.io (opens in a new tab)",
    });
    expect(play).toBeInTheDocument();
    expect(play).toHaveAttribute(
      "href",
      "https://youngstunners88.itch.io/lil-blunt-adventure",
    );
    expect(play).toHaveAttribute("target", "_blank");

    expect(
      screen.getByRole("button", {
        name: "Connect Wallet — sign in with Internet Identity",
      }),
    ).toBeInTheDocument();
  });

  it("renders the center/right decorative crystal shards", () => {
    renderHero();

    const shards = crystalShards();
    const lefts = shards.map((s) => s.style.left).sort();

    // The four remaining shards sit at 47%/62%/76%/88% (center/right).
    expect(lefts).toEqual(["47%", "62%", "76%", "88%"]);
  });

  it("renders no crystal shard at the removed left positions (8%/18%/32%)", () => {
    renderHero();

    const lefts = crystalShards().map((s) => s.style.left);
    for (const removed of ["8%", "18%", "32%"]) {
      expect(lefts).not.toContain(removed);
    }
  });
});
