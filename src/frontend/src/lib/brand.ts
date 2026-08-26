/**
 * Brand asset registry for LIL BLUNT: THE SMOKE REALM.
 *
 * Centralizes every protocol logo path so the four brand identities
 * (Lil Blunt, BLAZE, DIAMONDS, GOLD) render from a single source of
 * truth. The supplied Lil Blunt and DIAMONDS logos are committed under
 * `public/assets/brand/`; the GOLD and BLAZE assets are being supplied
 * by page tasks and will land at the paths below.
 */

/** Supplied Lil Blunt logo — bright green muscular character, neon ring, rocket. */
export const LIL_BLUNT_LOGO_SRC = "/assets/brand/lil-blunt/lil-blunt-logo.jpeg";

/** Supplied DIAMONDS logo — luminous green ring, crystalline blue diamond, metallic wordmark. */
export const DIAMONDS_LOGO_SRC = "/assets/brand/diamonds/diamonds-logo.png";

/** BLAZE logo — diamond-on-fire visual (supplied by a page task at this path). */
export const BLAZE_LOGO_SRC = "/assets/brand/blaze/blaze-logo.png";

/** GOLD / Gold Mine 'GM' logo (supplied by a page task at this path). */
export const GOLD_MINE_LOGO_SRC = "/assets/brand/gold/gold-mine-logo.png";

/**
 * External protocol site URLs — the three pillars of the Smoke Realm
 * ecosystem. Used by the Three Protocols section to link out to each
 * protocol's own site.
 */
export const PROTOCOL_LINKS = {
  smoke: "https://lilblunt.win/",
  diamonds: "https://diamonds1111.win/",
  gold: "https://mine4gold.app/",
} as const;

export type ProtocolKey = keyof typeof PROTOCOL_LINKS;

/**
 * @deprecated Legacy placeholder labels retained for backward compatibility
 * with unmounted section components. The BLAZE and GOLD assets are now
 * supplied at the paths above; these constants are no longer used to gate
 * rendering and will be removed when the legacy sections are cleaned up.
 */
export const BLAZE_LOGO_ASSET_REQUIRED =
  "BLAZE logo asset required — official logo not yet supplied";

/** @deprecated See {@link BLAZE_LOGO_ASSET_REQUIRED}. */
export const GOLD_MINE_LOGO_ASSET_REQUIRED =
  "GOLD MINE logo asset required — official logo not yet supplied";
