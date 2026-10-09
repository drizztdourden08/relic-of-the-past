/* @layer shared-game @kind logic */
import { findOne } from '../facade';
import type { FileTarget, ItemHome } from './record-file-targets.type';
import { BY_CATEGORY_ONLY, ITEM_CATEGORY_FILES } from './collection-files.constants';
import { worldOfDungeon } from './world-of-dungeon';

const itemRecordFile = (item: ItemHome): FileTarget => {
  const dungeonId = item.dungeonId;
  if (dungeonId) {
    const dungeon = findOne('dungeon', d => d.id === dungeonId);
    if (!dungeon) return { relativePath: null, unresolved: `unknown dungeon ${dungeonId}` };
    return { relativePath: `items/dungeon-items/${worldOfDungeon(dungeon)}/${dungeon.fileStem}.ts` };
  }
  const file = ITEM_CATEGORY_FILES[item.category];
  if (!file) return { relativePath: null, unresolved: `no file is declared for ${item.category} items` };
  const seedOnly = item.origin === 'randomizer'
    && item.gameId?.receiveItemId === undefined
    && !BY_CATEGORY_ONLY.includes(item.category);
  return { relativePath: `items/${seedOnly ? 'randomizer' : file}.ts` };
};

export { itemRecordFile };
