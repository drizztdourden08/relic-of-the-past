/* @layer renderer-appshell @kind logic */
import { wasmGetSpriteCombat, wasmGetCombatTables } from '@app/game';
import { ROOM_CLEAR_EXEMPT_BIT } from './sim-run.constants';
import { readWantedFeatures } from './read-wanted-features';

const simCombatSprite = (combatSprite: number) => {
  const spriteCombat = wasmGetSpriteCombat(combatSprite);
  const tables = wasmGetCombatTables();
  const combat = {
    combatSprite,
    spriteQueryFailed: spriteCombat === null,
    tablesQueryFailed: tables === null,
    health: spriteCombat?.health ?? null,
    flags4: spriteCombat?.flags4 ?? null,
    countsTowardRoomClear: spriteCombat === null ? null : (spriteCombat.flags4 & ROOM_CLEAR_EXEMPT_BIT) === 0,
    damageByClass: spriteCombat?.damageByClass ?? null,
    nonZeroAncillaDamageClasses: tables?.ancillaDamageClass.filter((c) => c !== 0).length ?? null,
    projectileBlockingTiles: tables?.projectileTileCollision.filter((v) => v === 1).length ?? null,
    featuresWanted: readWantedFeatures(),
  };
  console.log(`[SimRun] combat sprite 0x${combatSprite.toString(16)}: ${JSON.stringify(combat)}`);
  return combat;
};

export { simCombatSprite };
