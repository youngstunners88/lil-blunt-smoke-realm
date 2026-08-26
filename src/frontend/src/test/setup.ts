import "@testing-library/jest-dom/vitest";
import { configure } from "@testing-library/react";

// Generated components use `data-ocid` as their deterministic test marker.
configure({ testIdAttribute: "data-ocid" });

// jsdom does not implement IntersectionObserver. motion/react's `whileInView`
// reads it to trigger scroll-into-view animations; stub it so sections that use
// `whileInView` (Diamonds, Gold, …) render in isolation.
if (!("IntersectionObserver" in window)) {
  class IntersectionObserverMock {
    readonly root: Element | null = null;
    readonly rootMargin: string = "";
    readonly thresholds: ReadonlyArray<number> = [];
    observe = () => {};
    unobserve = () => {};
    disconnect = () => {};
    takeRecords = () => [];
  }
  Object.defineProperty(window, "IntersectionObserver", {
    writable: true,
    value: IntersectionObserverMock,
  });
}

// jsdom does not implement matchMedia. motion/react's useReducedMotion reads
// it; default to "no-preference" so decorative particle layers render.
if (!window.matchMedia) {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  });
}
