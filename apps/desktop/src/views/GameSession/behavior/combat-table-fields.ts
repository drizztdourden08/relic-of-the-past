/* @layer renderer-appshell @kind logic */
import type { wasmGetCombatTables } from '@app/game';

const combatTableFields = (tables: ReturnType<typeof wasmGetCombatTables>) => ({
  nonZeroAncillaDamageClasses: tables?.ancillaDamageClass.filter((c) => c !== 0).length ?? null,
  projectileBlockingTiles: tables?.projectileTileCollision.filter((v) => v === 1).length ?? null,
});

export { combatTableFields };
