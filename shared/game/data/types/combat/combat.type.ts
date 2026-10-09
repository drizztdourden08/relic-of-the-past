/* @layer shared-game @kind types */
type RangeProfile =
  | { kind: 'unbounded' }
  | { kind: 'contact'; tiles: number; sourced: boolean }
  | { kind: 'estimated'; tiles: number };

interface WeaponProfile {
  ancillaType: number;
  damageClass: number;
  range: RangeProfile;
}

interface ActorCombatProfile {
  health: number;
  flags4: number;
  damageByClass: Record<number, number>;
}

export type { ActorCombatProfile, RangeProfile, WeaponProfile };
