/* @layer shared-types @kind types */
interface HapticSettings {
  enabled: boolean;
  intensity: number;
  swordSwing: boolean;
  swordHitEnemy: boolean;
  swordClink: boolean;
  damageTaken: boolean;
  itemUse: boolean;
  dashVibration: boolean;
  environmentalEffects: boolean;
}

export type { HapticSettings };
