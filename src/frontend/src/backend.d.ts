import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface TokenMetric {
    staked: bigint;
    tokenId: TokenId;
    circulating: bigint;
    utility: string;
    source: string;
    lastUpdated: Timestamp;
    locked: bigint;
    isDemo: boolean;
    supply: bigint;
    burned: bigint;
}
export interface LeaderboardEntry {
    principal: Principal;
    playerAlias: string;
    rank: bigint;
    isDemo: boolean;
    score: bigint;
    stage: bigint;
    achievements: Array<AchievementId>;
    bossesDefeated: bigint;
}
export type Timestamp = bigint;
export type TokenId = string;
export interface PlayerProfile {
    stageReached: bigint;
    principal: Principal;
    alias: string;
    isDemo: boolean;
    achievements: Array<Achievement>;
    bossesDefeated: bigint;
}
export type Result__1 = {
    __kind__: "ok";
    ok: null;
} | {
    __kind__: "err";
    err: Error_;
};
export type Error_ = {
    __kind__: "FrontendOriginsNotConfigured";
    FrontendOriginsNotConfigured: null;
} | {
    __kind__: "MixedSsoSources";
    MixedSsoSources: {
        otherKeys: Array<string>;
        ssoKeys: Array<string>;
    };
} | {
    __kind__: "Stale";
    Stale: {
        ageNs: bigint;
    };
} | {
    __kind__: "MalformedCandid";
    MalformedCandid: null;
} | {
    __kind__: "AmbiguousAttribute";
    AmbiguousAttribute: {
        field: string;
        sources: Array<string>;
    };
} | {
    __kind__: "NoAttributes";
    NoAttributes: null;
} | {
    __kind__: "UnknownNonce";
    UnknownNonce: null;
} | {
    __kind__: "UntrustedSsoSource";
    UntrustedSsoSource: {
        domain: string;
    };
} | {
    __kind__: "MissingField";
    MissingField: string;
} | {
    __kind__: "FrontendOriginMismatch";
    FrontendOriginMismatch: {
        got: string;
        expected: Array<string>;
    };
};
export interface VaultEntry {
    id: VaultEntryId;
    status: VaultStatus;
    title: string;
    description: string;
    isDemo: boolean;
    category: VaultCategory;
}
export interface Achievement {
    id: AchievementId;
    title: string;
    unlocked: boolean;
    description: string;
    isDemo: boolean;
    progress: bigint;
    requirement: string;
    rarity: Rarity;
}
export type VaultEntryId = string;
export interface Result {
    hasMore: boolean;
    rows: Array<Array<Cell>>;
}
export interface Cell {
    value: Value;
    name: string;
}
export type AchievementId = string;
export interface World {
    id: WorldId;
    theme: string;
    name: string;
    description: string;
    isDemo: boolean;
}
export type Value = {
    __kind__: "int";
    int: bigint;
} | {
    __kind__: "nat";
    nat: bigint;
} | {
    __kind__: "float";
    float: number;
} | {
    __kind__: "bool";
    bool: boolean;
} | {
    __kind__: "null";
    null: null;
} | {
    __kind__: "text";
    text: string;
};
export type WorldId = string;
export enum Rarity {
    epic = "epic",
    legendary = "legendary",
    rare = "rare",
    common = "common",
    uncommon = "uncommon"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export enum VaultCategory {
    LORE = "LORE",
    ECONOMIC_MECHANIC = "ECONOMIC_MECHANIC",
    GAME_MECHANIC = "GAME_MECHANIC"
}
export enum VaultStatus {
    LIVE = "LIVE",
    LORE = "LORE",
    IN_DEVELOPMENT = "IN_DEVELOPMENT",
    COMING_SOON = "COMING_SOON"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    execute(qJson: string): Promise<Result>;
    getAchievements(): Promise<Array<Achievement>>;
    getCallerUserRole(): Promise<UserRole>;
    getLeaderboard(): Promise<Array<LeaderboardEntry>>;
    getPlayerProfile(principal: Principal): Promise<PlayerProfile | null>;
    getTokenMetrics(): Promise<Array<TokenMetric>>;
    getVaultData(): Promise<Array<VaultEntry>>;
    getWorlds(): Promise<Array<World>>;
    isCallerAdmin(): Promise<boolean>;
    schema(): Promise<string>;
}
