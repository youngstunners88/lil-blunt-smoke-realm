import { act, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { SmokeBackground } from "@/components/SmokeBackground";

/**
 * GUARD: the site's background video must not be removed.
 *
 * The founder has asked, repeatedly and explicitly, that this video stay. It is
 * the site's main visual. These tests fail if the <video> element, either of
 * its two sources, or the attributes that let it autoplay are removed.
 *
 * Only an explicit instruction from the founder to remove or replace the video
 * justifies changing or deleting this file. See .claude/skills/keep-the-video.
 */

let playSpy: ReturnType<typeof vi.fn>;

beforeEach(() => {
  // jsdom does not implement media playback.
  playSpy = vi.fn().mockResolvedValue(undefined);
  Object.defineProperty(HTMLMediaElement.prototype, "play", {
    configurable: true,
    value: playSpy,
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("SmokeBackground video guard", () => {
  it("renders the background <video> element", () => {
    const { container } = render(<SmokeBackground />);
    expect(container.querySelector("video")).not.toBeNull();
  });

  it("offers both the MP4 and the WebM source", () => {
    const { container } = render(<SmokeBackground />);
    const types = Array.from(container.querySelectorAll("video source")).map(
      (s) => s.getAttribute("type"),
    );
    expect(types).toContain("video/mp4");
    expect(types).toContain("video/webm");
  });

  it("serves the sources from the pinned jsDelivr commit, not the app origin", () => {
    // Caffeine cannot pull binaries across from the repo, and requests for
    // /assets/video/* on the canister fall through to index.html. A relative
    // path here silently breaks the video.
    const { container } = render(<SmokeBackground />);
    const srcs = Array.from(container.querySelectorAll("video source")).map(
      (s) => s.getAttribute("src") ?? "",
    );
    expect(srcs.length).toBeGreaterThanOrEqual(2);
    for (const src of srcs) {
      expect(src).toMatch(/^https:\/\/cdn\.jsdelivr\.net\/gh\//);
      expect(src).toMatch(/@[0-9a-f]{40}\//); // pinned to a commit SHA
    }
  });

  it("is muted, looping and inline so browsers allow it to autoplay", () => {
    const { container } = render(<SmokeBackground />);
    const video = container.querySelector("video") as HTMLVideoElement;
    expect(video.muted).toBe(true);
    expect(video.loop).toBe(true);
    expect(video.hasAttribute("autoplay")).toBe(true);
    expect(video.hasAttribute("playsinline")).toBe(true);
  });

  it("keeps a still poster so the page is never black while it loads", () => {
    const { container } = render(<SmokeBackground />);
    const video = container.querySelector("video") as HTMLVideoElement;
    expect(video.getAttribute("poster")).toBeTruthy();
  });

  it("starts playback on the first touch or click when autoplay was blocked", async () => {
    // iOS Low Power Mode and data-saver refuse muted autoplay and show the
    // browser's own play button over the page. The first gesture is allowed to
    // start playback, so the video must ask for it then.
    render(<SmokeBackground />);
    playSpy.mockClear();
    await act(async () => {
      window.dispatchEvent(new Event("pointerdown"));
    });
    expect(playSpy).toHaveBeenCalled();
  });
});
