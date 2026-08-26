/**
 * Frontend domain models for the Smoke Realm.
 *
 * These types are the UI-facing shape of all game data. They are intentionally
 * decoupled from the generated backend bindings (`@/backend`) so that demo
 * data can be swapped for live canister responses without touching the render
 * layer. The repository layer (`@/lib/repository`) is responsible for mapping
 * backend types → frontend types.
 *
 * Re-exports the backend enums (Rarity, VaultCategory, VaultStatus) so pages
 * can import the full domain vocabulary from a single module.
 */

import type { Rarity, VaultCategory, VaultStatus } from "@/backend";

export type { Rarity, VaultCategory, VaultStatus };

/** A token in the Smoke Realm ecosystem (BLAZE, DIAMONDS, GOLD, …). */
export interface Token {
  id: string;
  name: string;
  symbol: string;
  utility: string;
}

/** Live-ish metrics for a single token. `isDemo` flags demo-sourced rows. */
export interface TokenMetric {
  tokenId: string;
  supply: bigint;
  circulating: bigint;
  burned: bigint;
  locked: bigint;
  staked: bigint;
  utility: string;
  source: string;
  lastUpdated: bigint;
  isDemo: boolean;
  /** Optional human-readable tooltip shown over the metric. */
  tooltip?: string;
}

/** A player's profile — pulled from the canister by principal. */
export interface PlayerProfile {
  principal: string;
  alias: string;
  stageReached: bigint;
  bossesDefeated: bigint;
  achievements: Achievement[];
  isDemo: boolean;
}

/** A single leaderboard row — the player's best run summary. */
export interface PlayerScore {
  principal: string;
  score: bigint;
  stage: bigint;
  bossesDefeated: bigint;
  achievements: number;
  timestamp: bigint;
  isDemo: boolean;
}

/** A single run record — granular per-attempt data. */
export interface RunRecord {
  principal: string;
  score: bigint;
  stage: bigint;
  bossesDefeated: bigint;
  damageTaken: bigint;
  timestamp: bigint;
  isDemo: boolean;
}

/** A Proof of Play achievement. Rarity drives the border/glow tier. */
export interface Achievement {
  id: string;
  title: string;
  description: string;
  rarity: Rarity;
  requirement: string;
  unlocked: boolean;
  progress: bigint;
  isDemo: boolean;
}

/** A leaderboard entry — rank + player summary. */
export interface LeaderboardEntry {
  rank: number;
  playerAlias: string;
  principal: string;
  score: bigint;
  stage: bigint;
  bossesDefeated: bigint;
  achievements: number;
  isDemo: boolean;
}

/** A Vault entry — lore, mechanic, or coming-soon content. */
export interface VaultEntry {
  id: string;
  title: string;
  description: string;
  category: VaultCategory;
  status: VaultStatus;
  isDemo: boolean;
}

/** A game world / realm. */
export interface World {
  id: string;
  name: string;
  theme: string;
  description: string;
  isDemo: boolean;
}
