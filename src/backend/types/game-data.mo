// Domain type definitions for the game-data layer.
//
// Every record carries an `isDemo` flag so the frontend can clearly label
// demo-sourced data. Live ICP canister queries can later swap in by
// replacing the repository implementations in lib/game-data.mo without
// changing these public types or the frontend bindings.
//
// Per the dispatch contract, this file defines ONLY types — no logic,
// no state, no functions. The develop task will wire OQL exposure and
// demo-data returns.

import Principal "mo:core/Principal";
import Common "common";

module {
  // ------------------------------------------------------------------
  // Re-exports of shared cross-cutting types for convenience.
  // ------------------------------------------------------------------
  public type Timestamp = Common.Timestamp;
  public type TokenId = Common.TokenId;
  public type AchievementId = Common.AchievementId;
  public type VaultEntryId = Common.VaultEntryId;
  public type WorldId = Common.WorldId;

  // ------------------------------------------------------------------
  // Tokenomics
  // ------------------------------------------------------------------

  /// A token defined in the ecosystem (e.g. $SMOKE).
  /// `utility` is a human-readable description of the token's use.
  public type Token = {
    id : TokenId;
    name : Text;
    symbol : Text;
    utility : Text;
  };

  /// A single live metric for a token. Every live metric carries its
  /// `source` (e.g. "ICP ledger", "demo") and `lastUpdated` timestamp
  /// so the UI can show provenance. `isDemo = true` marks demo-sourced
  /// values that must be visibly labeled DEMO.
  public type TokenMetric = {
    tokenId : TokenId;
    supply : Nat;
    circulating : Nat;
    burned : Nat;
    locked : Nat;
    staked : Nat;
    utility : Text;
    source : Text;
    lastUpdated : Timestamp;
    isDemo : Bool;
  };

  // ------------------------------------------------------------------
  // Players & runs
  // ------------------------------------------------------------------

  /// A gameplay achievement in the Proof of Play layer. This is a
  /// gameplay achievement layer only — never an NFT minting claim.
  /// `progress` is a 0..100 percentage toward `requirement`.
  public type Achievement = {
    id : AchievementId;
    title : Text;
    description : Text;
    rarity : Rarity;
    requirement : Text;
    unlocked : Bool;
    progress : Nat;
    isDemo : Bool;
  };

  /// Rarity tier for an achievement.
  public type Rarity = {
    #common;
    #uncommon;
    #rare;
    #epic;
    #legendary;
  };

  /// A player's profile, associated with the authenticated principal.
  /// `stageReached` and `bossesDefeated` are gameplay stats. The
  /// `achievements` array references unlocked achievements.
  public type PlayerProfile = {
    principal : Principal;
    alias : Text;
    stageReached : Nat;
    bossesDefeated : Nat;
    achievements : [Achievement];
    isDemo : Bool;
  };

  /// A single submitted score. Browser-submitted scores are NEVER
  /// treated as authoritative — the model is prepared for server-side
  /// validation in a future develop task. `isDemo = true` on demo rows.
  public type PlayerScore = {
    principal : Principal;
    score : Nat;
    stage : Nat;
    bossesDefeated : Nat;
    achievements : [AchievementId];
    timestamp : Timestamp;
    isDemo : Bool;
  };

  /// A single run record capturing detailed run telemetry. Like
  /// PlayerScore, this is a model prepared for server-side validation,
  /// not yet an authoritative submission endpoint.
  public type RunRecord = {
    principal : Principal;
    score : Nat;
    stage : Nat;
    bossesDefeated : Nat;
    damageTaken : Nat;
    timestamp : Timestamp;
    isDemo : Bool;
  };

  // ------------------------------------------------------------------
  // Leaderboard
  // ------------------------------------------------------------------

  /// A single row in the leaderboard. `rank` is 1-based.
  public type LeaderboardEntry = {
    rank : Nat;
    playerAlias : Text;
    principal : Principal;
    score : Nat;
    stage : Nat;
    bossesDefeated : Nat;
    achievements : [AchievementId];
    isDemo : Bool;
  };

  // ------------------------------------------------------------------
  // The Vault
  // ------------------------------------------------------------------

  /// Category for a vault entry.
  public type VaultCategory = {
    #LORE;
    #GAME_MECHANIC;
    #ECONOMIC_MECHANIC;
  };

  /// Status badge for a vault entry. The UI must render these as
  /// LIVE / IN DEVELOPMENT / LORE / COMING SOON badges.
  public type VaultStatus = {
    #LIVE;
    #IN_DEVELOPMENT;
    #LORE;
    #COMING_SOON;
  };

  /// A single vault entry — a piece of the world/ecosystem roadmap.
  public type VaultEntry = {
    id : VaultEntryId;
    title : Text;
    description : Text;
    category : VaultCategory;
    status : VaultStatus;
    isDemo : Bool;
  };

  // ------------------------------------------------------------------
  // Worlds
  // ------------------------------------------------------------------

  /// A world / stage theme in the game.
  public type World = {
    id : WorldId;
    name : Text;
    theme : Text;
    description : Text;
    isDemo : Bool;
  };
};
