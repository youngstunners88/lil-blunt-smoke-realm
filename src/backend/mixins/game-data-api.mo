// Public API surface for the game-data domain.
//
// The mixin receives the actor's six stable collections as parameters and
// delegates each query to the matching repository function in
// lib/game-data.mo. Public query signatures are unchanged from the contract
// — only the bodies now delegate to lib with the state params.
//
// Every record returned carries `isDemo = true` so the frontend can clearly
// label demo-sourced data. Live ICP canister queries can later swap the
// seeding in the migration chain without changing these signatures or the
// frontend bindings.

import List "mo:core/List";
import Principal "mo:core/Principal";
import GameData "../lib/game-data";
import Types "../types/game-data";

mixin (
  leaderboard : List.List<Types.LeaderboardEntry>,
  playerProfiles : List.List<Types.PlayerProfile>,
  achievements : List.List<Types.Achievement>,
  tokenMetrics : List.List<Types.TokenMetric>,
  vaultEntries : List.List<Types.VaultEntry>,
  worlds : List.List<Types.World>,
) {
  /// Return the current leaderboard, ranked by score descending.
  /// Demo data by default; every entry carries `isDemo = true`.
  public query func getLeaderboard() : async [Types.LeaderboardEntry] {
    GameData.getLeaderboard(leaderboard);
  };

  /// Return the profile for the given principal, if any.
  /// Demo data by default; the returned profile carries `isDemo = true`.
  public query func getPlayerProfile(principal : Principal) : async ?Types.PlayerProfile {
    GameData.getPlayerProfile(playerProfiles, principal);
  };

  /// Return all achievement definitions. Demo data by default.
  public query func getAchievements() : async [Types.Achievement] {
    GameData.getAchievements(achievements);
  };

  /// Return all token ecosystem metrics. Demo data by default; every
  /// metric carries `isDemo = true` and a `source` label.
  public query func getTokenMetrics() : async [Types.TokenMetric] {
    GameData.getTokenMetrics(tokenMetrics);
  };

  /// Return all vault entries. Demo data by default.
  public query func getVaultData() : async [Types.VaultEntry] {
    GameData.getVaultData(vaultEntries);
  };

  /// Return all worlds / stage themes. Demo data by default.
  public query func getWorlds() : async [Types.World] {
    GameData.getWorlds(worlds);
  };
};
