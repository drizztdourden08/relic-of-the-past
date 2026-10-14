/* @layer renderer-appshell @kind logic */
import { wasmGetSpriteCombat, wasmGetCombatTables } from '@app/game';
import { readWantedFeatures } from './read-wanted-features';
import { spriteCombatFields } from './sprite-combat-fields';
import { combatTableFields } from './combat-table-fields';

const simCombatSprite = (combatSprite: number) => {
  const spriteCombat = wasmGetSpriteCombat(combatSprite);
  const tables = wasmGetCombatTables();
  const combat = {
    combatSprite,
    spriteQueryFailed: spriteCombat === null,
    tablesQueryFailed: tables === null,
    ...spriteCombatFields(spriteCombat),
    ...combatTableFields(tables),
    featuresWanted: readWantedFeatures(),
  };
  console.log(`[SimRun] combat sprite 0x${combatSprite.toString(16)}: ${JSON.stringify(combat)}`);
  return combat;
};

export { simCombatSprite };
