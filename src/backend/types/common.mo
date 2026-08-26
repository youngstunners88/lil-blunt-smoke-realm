// Cross-cutting shared types for the game-data domain.
// These are intentionally minimal: only types reused across domain
// boundaries live here. Domain-specific records live in
// types/game-data.mo.

module {
  /// Timestamp in nanoseconds since the Unix epoch (Time.now() shape).
  public type Timestamp = Nat;

  /// Stable identifier for a token / ecosystem metric.
  public type TokenId = Text;

  /// Stable identifier for an achievement definition.
  public type AchievementId = Text;

  /// Stable identifier for a vault entry.
  public type VaultEntryId = Text;

  /// Stable identifier for a world / stage theme.
  public type WorldId = Text;
};
