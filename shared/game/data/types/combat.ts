/* @layer shared-game @kind types */
/**
 * Combat facts, reverse-engineered from the game's own tables
 * (core/zelda3/src/sprite.c, ancilla.c) rather than invented. See the
 * names-and-labels plan §9 for the full citation table — 'estimated' and
 * 'contact'-with-sourced=false ranges are flagged, not measured.
 */

type RangeProfile =
  | { kind: 'unbounded' }
  | { kind: 'contact'; tiles: number; sourced: boolean }
  | { kind: 'estimated'; tiles: number };

interface WeaponProfile {
  /** Native ancilla id, e.g. 0x09 = arrow. */
  ancillaType: number;
  /** kAncilla_Damage[ancillaType] — real, read live from the ROM. */
  damageClass: number;
  range: RangeProfile;
}

/**
 * Per actor combat facts, keyed off the native sprite type —
 * kSpriteInit_Health / Flags4 / enemy_damage_data, all real.
 */
interface ActorCombatProfile {
  health: number;
  flags4: number;
  damageByClass: Record<number, number>;
}

export type { ActorCombatProfile, RangeProfile, WeaponProfile };
