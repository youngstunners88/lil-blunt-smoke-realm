import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Diamonds } from "@/components/sections/Diamonds";
import { Gold } from "@/components/sections/Gold";
import { DIAMONDS_LOGO_SRC, GOLD_MINE_LOGO_SRC } from "@/lib/brand";

// Gold renders live-ish token metrics via useTokenMetrics, which depends on
// useActor from @caffeineai/core-infrastructure and TanStack Query. Stub the
// repository hook so the section renders in isolation.
vi.mock("@/lib/repository", () => ({
  useTokenMetrics: () => ({
    data: [],
    isLoading: false,
    isError: false,
  }),
}));

/** The circular frame is the img's parent div. */
function logoFrame(logo: HTMLElement): HTMLElement {
  const frame = logo.parentElement;
  if (!frame) throw new Error("logo has no parent frame");
  return frame;
}

describe("DIAMONDS card logo frame", () => {
  it("renders the DIAMONDS logo image with its alt text and brand asset source", () => {
    render(<Diamonds />);

    const logo = screen.getByRole("img", { name: "DIAMONDS logo" });
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute("src", DIAMONDS_LOGO_SRC);
  });

  it("sits in a true circle (rounded-full) with no border or glow on the frame", () => {
    render(<Diamonds />);

    const frame = logoFrame(screen.getByRole("img", { name: "DIAMONDS logo" }));
    expect(frame.className).toContain("rounded-full");
    // The frame must not add a border or glow on top of the logo.
    expect(frame.className).not.toMatch(/\bborder\b/);
    expect(frame.className).not.toMatch(/glow|shadow/);
  });

  it("centers the logo and keeps it un-stretched (object-contain)", () => {
    render(<Diamonds />);

    const frame = logoFrame(screen.getByRole("img", { name: "DIAMONDS logo" }));
    expect(frame.className).toContain("items-center");
    expect(frame.className).toContain("justify-center");

    const logo = screen.getByRole("img", { name: "DIAMONDS logo" });
    expect(logo.className).toContain("object-contain");
  });

  it("keeps the DIAMONDS section heading", () => {
    render(<Diamonds />);

    expect(
      screen.getByRole("heading", { name: /Cut from the Deep/i }),
    ).toBeInTheDocument();
  });
});

describe("GOLD card logo frame", () => {
  it("renders the GOLD MINE logo image with its alt text and brand asset source", () => {
    render(<Gold />);

    const logo = screen.getByRole("img", { name: "GOLD MINE logo" });
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute("src", GOLD_MINE_LOGO_SRC);
  });

  it("sits in a true circle (rounded-full) with no border or glow on the frame", () => {
    render(<Gold />);

    const frame = logoFrame(
      screen.getByRole("img", { name: "GOLD MINE logo" }),
    );
    expect(frame.className).toContain("rounded-full");
    // The frame must not add a border or glow on top of the logo.
    expect(frame.className).not.toMatch(/\bborder\b/);
    expect(frame.className).not.toMatch(/glow|shadow/);
  });

  it("centers the logo and keeps it un-stretched (object-contain)", () => {
    render(<Gold />);

    const frame = logoFrame(
      screen.getByRole("img", { name: "GOLD MINE logo" }),
    );
    expect(frame.className).toContain("items-center");
    expect(frame.className).toContain("justify-center");

    const logo = screen.getByRole("img", { name: "GOLD MINE logo" });
    expect(logo.className).toContain("object-contain");
  });

  it("keeps the GOLD section heading", () => {
    render(<Gold />);

    expect(
      screen.getByRole("heading", { name: /The Vault of the Frontier/i }),
    ).toBeInTheDocument();
  });
});
