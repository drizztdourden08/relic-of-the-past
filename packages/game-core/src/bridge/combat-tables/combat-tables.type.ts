/* @layer bridge-wasm @kind types */
interface SpriteCombatInfo {
  health: number;
  flags4: number;
  damageByClass: number[];
}

interface CombatTables {
  ancillaDamageClass: number[];
  projectileTileCollision: number[];
}

export type { SpriteCombatInfo, CombatTables };
