// Domain logic for the game-data layer.
//
// Repository query methods read from the actor's stable collections and
// return immutable arrays to the mixin layer. Every record carries
// `isDemo = true` so the frontend can clearly label demo-sourced data.
// Live ICP canister queries can later swap the seeding in the migration
// chain without changing these signatures or the frontend bindings.
//
// Score submission / trust logic is NOT implemented here — the model is
// prepared for server-side validation in a future develop task.

import List "mo:core/List";
import Principal "mo:core/Principal";
import Types "../types/game-data";

module {
  public type Token = Types.Token;
  public type TokenMetric = Types.TokenMetric;
  public type PlayerProfile = Types.PlayerProfile;
  public type PlayerScore = Types.PlayerScore;
  public type RunRecord = Types.RunRecord;
  public type Achievement = Types.Achievement;
  public type LeaderboardEntry = Types.LeaderboardEntry;
  public type VaultEntry = Types.VaultEntry;
  public type World = Types.World;

  /// Return the current leaderboard, ranked by score descending.
  /// Demo data by default; every entry carries `isDemo = true`.
  public func getLeaderboard(leaderboard : List.List<LeaderboardEntry>) : [LeaderboardEntry] {
    leaderboard.toArray();
  };

  /// Return the profile for the given principal, if any.
  /// Demo data by default; the returned profile carries `isDemo = true`.
  public func getPlayerProfile(
    playerProfiles : List.List<PlayerProfile>,
    principal : Principal,
  ) : ?PlayerProfile {
    playerProfiles.find(func(p : PlayerProfile) : Bool { p.principal == principal });
  };

  /// Return all achievement definitions. Demo data by default.
  public func getAchievements(achievements : List.List<Achievement>) : [Achievement] {
    achievements.toArray();
  };

  /// Return all token ecosystem metrics. Demo data by default; every
  /// metric carries `isDemo = true` and a `source` label.
  public func getTokenMetrics(tokenMetrics : List.List<TokenMetric>) : [TokenMetric] {
    tokenMetrics.toArray();
  };

  /// Return all vault entries. Demo data by default.
  public func getVaultData(vaultEntries : List.List<VaultEntry>) : [VaultEntry] {
    vaultEntries.toArray();
  };

  /// Return all worlds / stage themes. Demo data by default.
  public func getWorlds(worlds : List.List<World>) : [World] {
    worlds.toArray();
  };
};
