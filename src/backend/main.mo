// Composition root for the Lil Blunt Adventure backend.
//
// This actor is intentionally thin: it only owns state and includes
// mixins. NO business logic lives here — every public method is
// provided by an included mixin.
//
// Auth preservation: the existing AccessControl initialization and
// MixinAuthorization include are kept verbatim. The game-data mixin
// is added alongside, exposing the repository query methods
// (getLeaderboard, getPlayerProfile, getAchievements, getTokenMetrics,
// getVaultData, getWorlds) to the frontend via regenerated bindings.
//
// OQL exposure: all six game-data tables are exposed via the
// `caffeineai-oql` `Expose` mixin so the Data Intelligence agent can
// answer natural-language queries over them. World-readable demo data
// (leaderboard, achievements, tokenMetrics, vaultEntries, worlds) is
// `.public_()`; per-user `playerProfiles` is `.controllerOrScoped()`
// with `.ownedBy('principal')` so each signed-in caller reads only
// their own profile row.

import AccessControl "mo:caffeineai-authorization/access-control";
import MixinAuthorization "mo:caffeineai-authorization/MixinAuthorization";
import List "mo:core/List";
import Principal "mo:core/Principal";
import OQL "mo:caffeineai-oql";
import Expose "mo:caffeineai-oql/Expose";
import ListEntity "mo:caffeineai-oql/ListEntity";
import Entity "mo:caffeineai-oql/Entity";
import NatValue "mo:caffeineai-oql/NatValue";
import TextValue "mo:caffeineai-oql/TextValue";
import BoolValue "mo:caffeineai-oql/BoolValue";
import PrincipalValue "mo:caffeineai-oql/PrincipalValue";
import RecordValue "mo:caffeineai-oql/RecordValue";
import GameDataApi "mixins/game-data-api";
import Types "types/game-data";

actor {
  // Top-level variant-to-Text converters for OQL payload extractors.
  // moc rejects inline `switch` expressions inside `.payload(...)` closures
  // (M0001), so these are declared in actor scope and passed by reference.
  func rarityToText(r : Types.Rarity) : Text {
    switch r {
      case (#common) "common";
      case (#uncommon) "uncommon";
      case (#rare) "rare";
      case (#epic) "epic";
      case (#legendary) "legendary";
    };
  };

  func vaultCategoryToText(c : Types.VaultCategory) : Text {
    switch c {
      case (#LORE) "LORE";
      case (#GAME_MECHANIC) "GAME_MECHANIC";
      case (#ECONOMIC_MECHANIC) "ECONOMIC_MECHANIC";
    };
  };

  func vaultStatusToText(s : Types.VaultStatus) : Text {
    switch s {
      case (#LIVE) "LIVE";
      case (#IN_DEVELOPMENT) "IN_DEVELOPMENT";
      case (#LORE) "LORE";
      case (#COMING_SOON) "COMING_SOON";
    };
  };

  // Existing auth state — preserved from the prior stub, but declared
  // type-only (no initializer) under enhanced migration. The initial value
  // is supplied by the migration chain (src/backend/migrations/).
  let accessControlState : AccessControl.AccessControlState;
  include MixinAuthorization(accessControlState, null);

  // Game-data domain stable state. Declared type-only (no initializers)
  // under enhanced migration; the migration chain seeds the demo data.
  let leaderboard : List.List<Types.LeaderboardEntry>;
  let playerProfiles : List.List<Types.PlayerProfile>;
  let achievements : List.List<Types.Achievement>;
  let tokenMetrics : List.List<Types.TokenMetric>;
  let vaultEntries : List.List<Types.VaultEntry>;
  let worlds : List.List<Types.World>;

  // Game-data domain API. The mixin takes the six stable collections
  // and delegates each query to lib/game-data.mo.
  include GameDataApi(
    leaderboard,
    playerProfiles,
    achievements,
    tokenMetrics,
    vaultEntries,
    worlds,
  );

  // OQL exposure. Tables with only primitive fields use auto-derive
  // (`.toEntity`); tables with variant fields (Rarity, VaultCategory,
  // VaultStatus) or array fields ([AchievementId], [Achievement]) use
  // `.toEntityManual` with payload extractors that convert variants to
  // Text tags and arrays to size, so the query layer sees only the
  // primitive `OQL.Value` variants it can serialize.
  include Expose({
    entities = [
      // Leaderboard — public world-readable demo data. The
      // `achievements : [AchievementId]` array is exposed as a count.
      leaderboard.toEntityManual(
        "leaderboardEntry",
        "LeaderboardEntry",
        "rank",
      )
        .payload("rank", func(e : Types.LeaderboardEntry) : Nat = e.rank)
        .payload("playerAlias", func(e : Types.LeaderboardEntry) : Text = e.playerAlias)
        .payload("principal", func(e : Types.LeaderboardEntry) : Text = e.principal.toText())
        .payload("score", func(e : Types.LeaderboardEntry) : Nat = e.score)
        .payload("stage", func(e : Types.LeaderboardEntry) : Nat = e.stage)
        .payload("bossesDefeated", func(e : Types.LeaderboardEntry) : Nat = e.bossesDefeated)
        .payload("achievementCount", func(e : Types.LeaderboardEntry) : Nat = e.achievements.size())
        .payload("isDemo", func(e : Types.LeaderboardEntry) : Bool = e.isDemo)
        .sample({
          rank = 0;
          playerAlias = "";
          principal = Principal.fromText("aaaaa-aa");
          score = 0;
          stage = 0;
          bossesDefeated = 0;
          achievements = [];
          isDemo = true;
        })
        .public_()
        .build(),

      // Player profiles — per-user. `.controllerOrScoped()` with
      // `.ownedBy('principal')` so each signed-in caller reads only
      // their own row; the controller (Data Intelligence agent) reads
      // all. The `principal` field is the owner column (rendered as
      // `#text`); the nested `achievements : [Achievement]` array is
      // exposed as a count.
      playerProfiles.toEntityManual(
        "playerProfile",
        "PlayerProfile",
        "principal",
      )
        .payload("principal", func(p : Types.PlayerProfile) : Text = p.principal.toText())
        .payload("alias", func(p : Types.PlayerProfile) : Text = p.alias)
        .payload("stageReached", func(p : Types.PlayerProfile) : Nat = p.stageReached)
        .payload("bossesDefeated", func(p : Types.PlayerProfile) : Nat = p.bossesDefeated)
        .payload("achievementCount", func(p : Types.PlayerProfile) : Nat = p.achievements.size())
        .payload("isDemo", func(p : Types.PlayerProfile) : Bool = p.isDemo)
        .ownedBy("principal")
        .sample({
          principal = Principal.fromText("aaaaa-aa");
          alias = "";
          stageReached = 0;
          bossesDefeated = 0;
          achievements = [];
          isDemo = true;
        })
        .controllerOrScoped()
        .build(),

      // Achievements — public world-readable demo data. The `rarity`
      // variant is converted to a Text tag.
      achievements.toEntityManual(
        "achievement",
        "Achievement",
        "id",
      )
        .payload("id", func(a : Types.Achievement) : Text = a.id)
        .payload("title", func(a : Types.Achievement) : Text = a.title)
        .payload("description", func(a : Types.Achievement) : Text = a.description)
        .payload("rarity", func(a : Types.Achievement) : Text = rarityToText(a.rarity))
        .payload("requirement", func(a : Types.Achievement) : Text = a.requirement)
        .payload("unlocked", func(a : Types.Achievement) : Bool = a.unlocked)
        .payload("progress", func(a : Types.Achievement) : Nat = a.progress)
        .payload("isDemo", func(a : Types.Achievement) : Bool = a.isDemo)
        .sample({
          id = "";
          title = "";
          description = "";
          rarity = #common;
          requirement = "";
          unlocked = false;
          progress = 0;
          isDemo = true;
        })
        .public_()
        .build(),

      // Token metrics — public world-readable demo data. All fields are
      // primitives, so auto-derive via `.toEntity`.
      tokenMetrics.toEntity(
        "tokenMetric",
        "TokenMetric",
        "tokenId",
      )
        .sample({
          tokenId = "";
          supply = 0;
          circulating = 0;
          burned = 0;
          locked = 0;
          staked = 0;
          utility = "";
          source = "";
          lastUpdated = 0;
          isDemo = true;
        })
        .public_()
        .build(),

      // Vault entries — public world-readable demo data. The
      // `category` and `status` variants are converted to Text tags.
      vaultEntries.toEntityManual(
        "vaultEntry",
        "VaultEntry",
        "id",
      )
        .payload("id", func(v : Types.VaultEntry) : Text = v.id)
        .payload("title", func(v : Types.VaultEntry) : Text = v.title)
        .payload("description", func(v : Types.VaultEntry) : Text = v.description)
        .payload("category", func(v : Types.VaultEntry) : Text = vaultCategoryToText(v.category))
        .payload("status", func(v : Types.VaultEntry) : Text = vaultStatusToText(v.status))
        .payload("isDemo", func(v : Types.VaultEntry) : Bool = v.isDemo)
        .sample({
          id = "";
          title = "";
          description = "";
          category = #LORE;
          status = #LORE;
          isDemo = true;
        })
        .public_()
        .build(),

      // Worlds — public world-readable demo data. All fields are
      // primitives, so auto-derive via `.toEntity`.
      worlds.toEntity(
        "world",
        "World",
        "id",
      )
        .sample({
          id = "";
          name = "";
          theme = "";
          description = "";
          isDemo = true;
        })
        .public_()
        .build(),
    ];
  });
};
