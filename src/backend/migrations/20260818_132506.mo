// Initial migration: introduces the accessControlState stable field AND
// the six game-data stable collections (leaderboard, playerProfiles,
// achievements, tokenMetrics, vaultEntries, worlds).
//
// OldActor is {} because the deployed baseline (.old/src/backend/dist/backend.most)
// is an empty actor with no prior stable state. The actor in main.mo declares
// seven stable fields:
//   - accessControlState : AccessControl.AccessControlState
//   - leaderboard        : List.List<LeaderboardEntry>
//   - playerProfiles     : List.List<PlayerProfile>
//   - achievements       : List.List<Achievement>
//   - tokenMetrics       : List.List<TokenMetric>
//   - vaultEntries       : List.List<VaultEntry>
//   - worlds             : List.List<World>
// so NewActor lists all seven. accessControlState is seeded empty; the six
// game-data collections are seeded with demo data so the frontend renders
// clearly demo-sourced content out of the box. Live ICP canister queries can
// later swap the seeding without changing these signatures or the frontend
// bindings.
//
// This file folds what was previously a second migration (20260818_132609.mo)
// into the first one, because check-limit=1 allows at most one pending
// migration per build.
//
// Self-contained: only mo:core/... imports, no project imports. The chain
// replays forever, so both OldActor and NewActor (and every domain record,
// variant, the UserRole variant, and the AccessControlState record) are
// inlined here.

import List "mo:core/List";
import Map "mo:core/Map";
import Principal "mo:core/Principal";

module {
  // ------------------------------------------------------------------
  // Inlined auth types (from the prior access-control stub).
  // ------------------------------------------------------------------

  type UserRole = {
    #admin;
    #user;
    #guest;
  };

  type AccessControlState = {
    var adminAssigned : Bool;
    userRoles : Map.Map<Principal, UserRole>;
  };

  // ------------------------------------------------------------------
  // Inlined game-data domain types (from types/game-data.mo +
  // types/common.mo). Only the shapes that appear in stable state are
  // inlined; the migration body constructs records of these types.
  // ------------------------------------------------------------------

  type Timestamp = Nat;
  type TokenId = Text;
  type AchievementId = Text;
  type VaultEntryId = Text;
  type WorldId = Text;

  type Rarity = {
    #common;
    #uncommon;
    #rare;
    #epic;
    #legendary;
  };

  type Achievement = {
    id : AchievementId;
    title : Text;
    description : Text;
    rarity : Rarity;
    requirement : Text;
    unlocked : Bool;
    progress : Nat;
    isDemo : Bool;
  };

  type PlayerProfile = {
    principal : Principal;
    alias : Text;
    stageReached : Nat;
    bossesDefeated : Nat;
    achievements : [Achievement];
    isDemo : Bool;
  };

  type LeaderboardEntry = {
    rank : Nat;
    playerAlias : Text;
    principal : Principal;
    score : Nat;
    stage : Nat;
    bossesDefeated : Nat;
    achievements : [AchievementId];
    isDemo : Bool;
  };

  type TokenMetric = {
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

  type VaultCategory = {
    #LORE;
    #GAME_MECHANIC;
    #ECONOMIC_MECHANIC;
  };

  type VaultStatus = {
    #LIVE;
    #IN_DEVELOPMENT;
    #LORE;
    #COMING_SOON;
  };

  type VaultEntry = {
    id : VaultEntryId;
    title : Text;
    description : Text;
    category : VaultCategory;
    status : VaultStatus;
    isDemo : Bool;
  };

  type World = {
    id : WorldId;
    name : Text;
    theme : Text;
    description : Text;
    isDemo : Bool;
  };

  // ------------------------------------------------------------------
  // OldActor = {} (first migration in the chain; baseline is empty).
  // ------------------------------------------------------------------

  type OldActor = {};

  // ------------------------------------------------------------------
  // NewActor = accessControlState + the six game-data collections.
  // ------------------------------------------------------------------

  type NewActor = {
    accessControlState : AccessControlState;
    leaderboard : List.List<LeaderboardEntry>;
    playerProfiles : List.List<PlayerProfile>;
    achievements : List.List<Achievement>;
    tokenMetrics : List.List<TokenMetric>;
    vaultEntries : List.List<VaultEntry>;
    worlds : List.List<World>;
  };

  // ------------------------------------------------------------------
  // Demo-data seeding.
  // ------------------------------------------------------------------

  // A single demo principal reused across every demo row. The anonymous
  // principal keeps the seed deterministic and clearly non-real.
  // Declared inside `migration` because `Principal.fromText(...)` is a
  // non-static expression and module-level `let`s in a migration file
  // must be static (M0014).

  // A demo timestamp (2026-01-01T00:00:00Z in ns) used as `lastUpdated`
  // for token metrics so the UI can show a stable provenance stamp.
  let demoTimestamp : Timestamp = 1767225600000000000;

  public func migration(_old : OldActor) : NewActor {
    let demoPrincipal = Principal.fromText("aaaaa-aa");
    // --- Achievements (4) -----------------------------------------
    let achievementList : [Achievement] = [
      {
        id = "the-auditor-slayer";
        title = "THE AUDITOR SLAYER";
        description = "Defeat the tax auditor boss without taking a single hit.";
        rarity = #rare;
        requirement = "Defeat the Stage 1 boss without taking damage.";
        unlocked = false;
        progress = 50;
        isDemo = true;
      },
      {
        id = "blaze-rush-champion";
        title = "BLAZE RUSH CHAMPION";
        description = "Finish a Blaze Rush run in under 90 seconds.";
        rarity = #epic;
        requirement = "Complete the bonus corridor with 100% collection.";
        unlocked = false;
        progress = 0;
        isDemo = true;
      },
      {
        id = "fort-knox-whale";
        title = "FORT KNOX WHALE";
        description = "Stack 1,000,000 $GOLD in the Fort Knox vault.";
        rarity = #legendary;
        requirement = "Meet the required Gold staking threshold.";
        unlocked = false;
        progress = 0;
        isDemo = true;
      },
      {
        id = "smoke-lounge-vip";
        title = "SMOKE LOUNGE VIP";
        description = "Unlock the Smoke Lounge by reaching stage 5.";
        rarity = #uncommon;
        requirement = "Unlock Smoke Lounge access.";
        unlocked = false;
        progress = 0;
        isDemo = true;
      },
    ];

    // --- Leaderboard (8) ------------------------------------------
    // Chill aliases ranked by score descending. Every row is demo data.
    let leaderboardList : [LeaderboardEntry] = [
      {
        rank = 1;
        playerAlias = "SmokeRunner";
        principal = demoPrincipal;
        score = 9999999;
        stage = 12;
        bossesDefeated = 11;
        achievements = ["the-auditor-slayer", "blaze-rush-champion", "smoke-lounge-vip"];
        isDemo = true;
      },
      {
        rank = 2;
        playerAlias = "DiamondDrifter";
        principal = demoPrincipal;
        score = 8888888;
        stage = 11;
        bossesDefeated = 10;
        achievements = ["blaze-rush-champion", "smoke-lounge-vip"];
        isDemo = true;
      },
      {
        rank = 3;
        playerAlias = "GoldRushGuvna";
        principal = demoPrincipal;
        score = 7777777;
        stage = 10;
        bossesDefeated = 9;
        achievements = ["fort-knox-whale", "smoke-lounge-vip"];
        isDemo = true;
      },
      {
        rank = 4;
        playerAlias = "BlazeFinn";
        principal = demoPrincipal;
        score = 6666666;
        stage = 9;
        bossesDefeated = 8;
        achievements = ["blaze-rush-champion"];
        isDemo = true;
      },
      {
        rank = 5;
        playerAlias = "TaxSlayer";
        principal = demoPrincipal;
        score = 5555555;
        stage = 8;
        bossesDefeated = 7;
        achievements = ["the-auditor-slayer"];
        isDemo = true;
      },
      {
        rank = 6;
        playerAlias = "NeonNinja";
        principal = demoPrincipal;
        score = 4444444;
        stage = 7;
        bossesDefeated = 6;
        achievements = ["smoke-lounge-vip"];
        isDemo = true;
      },
      {
        rank = 7;
        playerAlias = "CloudSurfer";
        principal = demoPrincipal;
        score = 3333333;
        stage = 6;
        bossesDefeated = 5;
        achievements = [];
        isDemo = true;
      },
      {
        rank = 8;
        playerAlias = "VoidWalker";
        principal = demoPrincipal;
        score = 2222222;
        stage = 5;
        bossesDefeated = 4;
        achievements = [];
        isDemo = true;
      },
    ];

    // --- Player profiles (1 demo) --------------------------------
    let playerProfilesList : [PlayerProfile] = [
      {
        principal = demoPrincipal;
        alias = "SmokeRunner";
        stageReached = 12;
        bossesDefeated = 11;
        achievements = achievementList;
        isDemo = true;
      },
    ];

    // --- Token metrics (4) ---------------------------------------
    // Plausible demo numbers; `source = "demo"` so the UI can label it.
    // BLAZE is the upstream ignition token that fuels the Demand Cascade
    // (BLAZE -> DIAMONDS -> GOLD); demo numbers only, not real economics.
    let tokenMetricsList : [TokenMetric] = [
      {
        tokenId = "BLAZE";
        supply = 1_000_000_000_000;
        circulating = 400_000_000_000;
        burned = 200_000_000_000;
        locked = 200_000_000_000;
        staked = 200_000_000_000;
        utility = "Upstream ignition token that fuels the Demand Cascade: burn BLAZE to mint DIAMONDS, stake BLAZE to unlock GOLD Rush runs.";
        source = "demo";
        lastUpdated = demoTimestamp;
        isDemo = true;
      },
      {
        tokenId = "SMOKE";
        supply = 420_000_000_000;
        circulating = 252_000_000_000;
        burned = 84_000_000_000;
        locked = 42_000_000_000;
        staked = 42_000_000_000;
        utility = "In-game consumables, Smoke Lounge access, run retries.";
        source = "demo";
        lastUpdated = demoTimestamp;
        isDemo = true;
      },
      {
        tokenId = "DIAMONDS";
        supply = 10_000_000;
        circulating = 6_000_000;
        burned = 1_000_000;
        locked = 1_500_000;
        staked = 1_500_000;
        utility = "Cosmetic skins, Diamond Realm entry, premium vaults.";
        source = "demo";
        lastUpdated = demoTimestamp;
        isDemo = true;
      },
      {
        tokenId = "GOLD";
        supply = 1_000_000_000;
        circulating = 700_000_000;
        burned = 100_000_000;
        locked = 100_000_000;
        staked = 100_000_000;
        utility = "Fort Knox vault currency, Gold Rush wagers, gear upgrades.";
        source = "demo";
        lastUpdated = demoTimestamp;
        isDemo = true;
      },
    ];

    // --- Vault entries (5) ---------------------------------------
    let vaultEntriesList : [VaultEntry] = [
      {
        id = "the-handler";
        title = "THE HANDLER";
        description = "The mysterious fixer who sets up every heist. Lore-only for now.";
        category = #LORE;
        status = #LORE;
        isDemo = true;
      },
      {
        id = "bong-parties";
        title = "BONG PARTIES";
        description = "Co-op smoke sessions that buff the whole crew. Mechanic in development.";
        category = #GAME_MECHANIC;
        status = #IN_DEVELOPMENT;
        isDemo = true;
      },
      {
        id = "the-lounge";
        title = "THE LOUNGE";
        description = "A social hub where $SMOKE holders kick back. Economic mechanic coming soon.";
        category = #ECONOMIC_MECHANIC;
        status = #COMING_SOON;
        isDemo = true;
      },
      {
        id = "fort-knox";
        title = "FORT KNOX";
        description = "The $GOLD vault every whale dreams of cracking. Economic mechanic coming soon.";
        category = #ECONOMIC_MECHANIC;
        status = #COMING_SOON;
        isDemo = true;
      },
      {
        id = "gold-rush";
        title = "GOLD RUSH";
        description = "Timed $GOLD mining runs against rival crews. Mechanic is live now.";
        category = #GAME_MECHANIC;
        status = #LIVE;
        isDemo = true;
      },
    ];

    // --- Worlds (3) ---------------------------------------------
    let worldsList : [World] = [
      {
        id = "smoke";
        name = "SMOKE REALM";
        theme = "Hazy purple void with neon green smoke trails.";
        description = "Lil Blunt's home turf.";
        isDemo = true;
      },
      {
        id = "diamond";
        name = "DIAMOND REALM";
        theme = "Crystalline blue caverns with diamond-sharp enemies.";
        description = "Deep underground. Nothing stays buried.";
        isDemo = true;
      },
      {
        id = "gold";
        name = "GOLD RUSH";
        theme = "Gilded heist vaults dripping with $GOLD.";
        description = "Mine deep. Survive the rush.";
        isDemo = true;
      },
    ];

    {
      accessControlState = {
        var adminAssigned = false;
        userRoles = Map.empty();
      };
      leaderboard = List.fromArray(leaderboardList);
      playerProfiles = List.fromArray(playerProfilesList);
      achievements = List.fromArray(achievementList);
      tokenMetrics = List.fromArray(tokenMetricsList);
      vaultEntries = List.fromArray(vaultEntriesList);
      worlds = List.fromArray(worldsList);
    };
  };
};
