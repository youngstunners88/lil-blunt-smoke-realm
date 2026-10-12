/**
 * Minimal, dependency-free product analytics for the Smoke Realm site.
 *
 * Why hand-rolled instead of `posthog-js`: the Caffeine project and this repo
 * are separate codebases with separate installs, so every new npm dependency
 * is a chance for the deployed build to break on a package Caffeine never
 * installed. This module talks to PostHog's public capture endpoint over
 * `fetch` and has no imports at all, so it ports across as a single file.
 *
 * What it exists for: without this, a paid ad can only ever tell you how many
 * people clicked it. The question that actually matters — how many of those
 * people went on to open the game — lives on this side of the click. This
 * records that, keyed to the ad that delivered the visitor.
 *
 * Privacy: no names, no emails, no addresses, nothing typed by the visitor.
 * Just an anonymous random id, the page, and which ad referred them.
 */

const POSTHOG_HOST = "https://us.i.posthog.com";

/**
 * Publishable project key. This is the client-side write-only token that is
 * *designed* to ship in browser bundles — it can send events and nothing
 * else. It is not the personal API key, which reads data and must never
 * appear in frontend code.
 */
const POSTHOG_KEY = "phc_CYRoB5eHAvMLqg7nZuKVjsM3ZZyrtxKXDjEQgq3Qvqn5";

const DISTINCT_ID_KEY = "sr_did";
const ATTRIBUTION_KEY = "sr_attr";

/** UTM keys we persist, plus the click ids the ad platforms append. */
const UTM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "twclid", // X
  "ttclid", // TikTok
  "fbclid", // Meta
  "gclid", // Google
] as const;

type Props = Record<string, unknown>;

/** localStorage throws in some embedded/private contexts — never let it break the page. */
function safeGet(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSet(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Storage unavailable; analytics degrades to per-pageview only.
  }
}

function getDistinctId(): string {
  const existing = safeGet(DISTINCT_ID_KEY);
  if (existing) return existing;
  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `sr_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  safeSet(DISTINCT_ID_KEY, id);
  return id;
}

/**
 * First-touch attribution.
 *
 * The UTMs are only on the URL of the *landing* page. By the time someone
 * clicks through to the game they may have navigated, so the campaign that
 * delivered them is stored on arrival and replayed onto every later event.
 * First touch wins: a visitor who arrives from an ad and returns directly a
 * day later still counts toward the ad that found them.
 */
function resolveAttribution(): Props {
  const stored = safeGet(ATTRIBUTION_KEY);
  if (stored) {
    try {
      return JSON.parse(stored) as Props;
    } catch {
      // Fall through and re-derive from the URL.
    }
  }

  const params = new URLSearchParams(window.location.search);
  const attribution: Props = {};
  for (const key of UTM_KEYS) {
    const value = params.get(key);
    if (value) attribution[key] = value;
  }

  if (Object.keys(attribution).length > 0) {
    attribution.landing_page = window.location.pathname;
    attribution.first_referrer = document.referrer || "(direct)";
    safeSet(ATTRIBUTION_KEY, JSON.stringify(attribution));
  }
  return attribution;
}

let attribution: Props = {};
let initialized = false;

/**
 * Send one event. Fire-and-forget: analytics must never delay the UI or
 * surface an error to a visitor, so every failure is swallowed.
 *
 * `keepalive` lets the request survive the page unloading, which is exactly
 * what happens on the play click — the most important event we record.
 */
export function track(event: string, props: Props = {}): void {
  if (typeof window === "undefined") return;
  try {
    const body = JSON.stringify({
      api_key: POSTHOG_KEY,
      event,
      distinct_id: getDistinctId(),
      properties: {
        ...attribution,
        ...props,
        $current_url: window.location.href,
        $pathname: window.location.pathname,
        $referrer: document.referrer || "(direct)",
        $screen_width: window.innerWidth,
      },
      timestamp: new Date().toISOString(),
    });

    void fetch(`${POSTHOG_HOST}/i/v0/e/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
      mode: "cors",
    }).catch(() => {});
  } catch {
    // Never let instrumentation break the page.
  }
}

/**
 * Start analytics. Safe to call more than once.
 *
 * Records the pageview plus two engagement milestones. Scroll depth is the
 * cheapest honest signal of whether the landing page held attention: an ad
 * with a good click-through but no one reaching halfway means the ad promised
 * something the page did not deliver.
 */
export function initAnalytics(): () => void {
  if (typeof window === "undefined" || initialized) return () => {};
  initialized = true;

  attribution = resolveAttribution();
  track("$pageview");

  const reached = new Set<number>();
  const onScroll = () => {
    const doc = document.documentElement;
    const scrollable = doc.scrollHeight - window.innerHeight;
    if (scrollable <= 0) return;
    const pct = Math.round((window.scrollY / scrollable) * 100);
    for (const milestone of [25, 50, 75, 90]) {
      if (pct >= milestone && !reached.has(milestone)) {
        reached.add(milestone);
        track("scroll_depth", { depth_pct: milestone });
      }
    }
  };

  const start = Date.now();
  const onLeave = () => {
    if (document.visibilityState !== "hidden") return;
    track("page_leave", {
      seconds_on_page: Math.round((Date.now() - start) / 1000),
      max_scroll_pct: reached.size ? Math.max(...reached) : 0,
    });
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  document.addEventListener("visibilitychange", onLeave);

  return () => {
    window.removeEventListener("scroll", onScroll);
    document.removeEventListener("visibilitychange", onLeave);
  };
}

/**
 * The conversion.
 *
 * Everything else on this page is a leading indicator; this is the action the
 * whole site exists to produce. Cost per `play_click`, broken down by
 * `utm_content`, is the number that says which ad actually worked — as opposed
 * to which ad merely got clicked.
 */
export function trackPlayClick(location: string): void {
  track("play_click", { cta_location: location });
}
