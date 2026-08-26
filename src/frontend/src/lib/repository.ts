/**
 * Repository layer for the Smoke Realm.
 *
 * Every backend query flows through TanStack Query hooks defined here. Each
 * hook calls the backend actor via `useActor(createActor)` and maps the
 * generated backend types into the frontend domain models from `@/lib/types`.
 * This is the only place that knows about the backend's raw shape — pages
 * consume the mapped types and stay canister-ready.
 */

import { createActor } from "@/backend";
import type {
  Achievement as BackendAchievement,
  LeaderboardEntry as BackendLeaderboardEntry,
  PlayerProfile as BackendPlayerProfile,
  TokenMetric as BackendTokenMetric,
  VaultEntry as BackendVaultEntry,
  World as BackendWorld,
} from "@/backend";
import type {
  Achievement,
  LeaderboardEntry,
  PlayerProfile,
  TokenMetric,
  VaultEntry,
  World,
} from "@/lib/types";
import { useActor } from "@caffeineai/core-infrastructure";
import type { Principal } from "@icp-sdk/core/principal";
import { useQuery } from "@tanstack/react-query";

/* -------------------------------------------------------------------------- */
/* Mappers — backend shape → frontend shape                                   */
/* -------------------------------------------------------------------------- */

function mapAchievement(a: BackendAchievement): Achievement {
  return {
    id: a.id,
    title: a.title,
    description: a.description,
    rarity: a.rarity,
    requirement: a.requirement,
    unlocked: a.unlocked,
    progress: a.progress,
    isDemo: a.isDemo,
  };
}

function mapLeaderboardEntry(e: BackendLeaderboardEntry): LeaderboardEntry {
  return {
    rank: Number(e.rank),
    playerAlias: e.playerAlias,
    principal: e.principal.toText(),
    score: e.score,
    stage: e.stage,
    bossesDefeated: e.bossesDefeated,
    achievements: e.achievements.length,
    isDemo: e.isDemo,
  };
}

function mapPlayerProfile(p: BackendPlayerProfile): PlayerProfile {
  return {
    principal: p.principal.toText(),
    alias: p.alias,
    stageReached: p.stageReached,
    bossesDefeated: p.bossesDefeated,
    achievements: p.achievements.map(mapAchievement),
    isDemo: p.isDemo,
  };
}

function mapTokenMetric(m: BackendTokenMetric): TokenMetric {
  return {
    tokenId: m.tokenId,
    supply: m.supply,
    circulating: m.circulating,
    burned: m.burned,
    locked: m.locked,
    staked: m.staked,
    utility: m.utility,
    source: m.source,
    lastUpdated: m.lastUpdated,
    isDemo: m.isDemo,
  };
}

function mapVaultEntry(v: BackendVaultEntry): VaultEntry {
  return {
    id: v.id,
    title: v.title,
    description: v.description,
    category: v.category,
    status: v.status,
    isDemo: v.isDemo,
  };
}

function mapWorld(w: BackendWorld): World {
  return {
    id: w.id,
    name: w.name,
    theme: w.theme,
    description: w.description,
    isDemo: w.isDemo,
  };
}

/* -------------------------------------------------------------------------- */
/* Hooks                                                                       */
/* -------------------------------------------------------------------------- */

/** Top 10 leaderboard rows. */
export function useLeaderboard() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["leaderboard"],
    queryFn: async (): Promise<LeaderboardEntry[]> => {
      if (!actor) return [];
      const rows = await actor.getLeaderboard();
      return rows.map(mapLeaderboardEntry);
    },
    enabled: !!actor && !isFetching,
  });
}

/** A single player's profile by principal. */
export function usePlayerProfile(principal: Principal | null | undefined) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["playerProfile", principal?.toText() ?? null],
    queryFn: async (): Promise<PlayerProfile | null> => {
      if (!actor || !principal) return null;
      const profile = await actor.getPlayerProfile(principal);
      return profile ? mapPlayerProfile(profile) : null;
    },
    enabled: !!actor && !isFetching && !!principal,
  });
}

/** All Proof of Play achievements. */
export function useAchievements() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["achievements"],
    queryFn: async (): Promise<Achievement[]> => {
      if (!actor) return [];
      const rows = await actor.getAchievements();
      return rows.map(mapAchievement);
    },
    enabled: !!actor && !isFetching,
  });
}

/** Token metrics for the ecosystem / tokenomics sections. */
export function useTokenMetrics() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["tokenMetrics"],
    queryFn: async (): Promise<TokenMetric[]> => {
      if (!actor) return [];
      const rows = await actor.getTokenMetrics();
      return rows.map(mapTokenMetric);
    },
    enabled: !!actor && !isFetching,
  });
}

/** Vault entries — lore, mechanics, coming-soon. */
export function useVaultData() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["vaultData"],
    queryFn: async (): Promise<VaultEntry[]> => {
      if (!actor) return [];
      const rows = await actor.getVaultData();
      return rows.map(mapVaultEntry);
    },
    enabled: !!actor && !isFetching,
  });
}

/** Game worlds / realms. */
export function useWorlds() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["worlds"],
    queryFn: async (): Promise<World[]> => {
      if (!actor) return [];
      const rows = await actor.getWorlds();
      return rows.map(mapWorld);
    },
    enabled: !!actor && !isFetching,
  });
}
