/* @layer shared-game @kind types */
interface SpriteCombatInfo {
  health: number;
  flags4: number;
  damageByClass: number[];
}

interface CombatTables {
  ancillaDamageClass: number[];
  projectileTileCollision: number[];
}

interface CombatContext {
  tables: CombatTables | null;
  bySpriteType: Record<number, SpriteCombatInfo | null>;
}

export type { SpriteCombatInfo, CombatTables, CombatContext };
