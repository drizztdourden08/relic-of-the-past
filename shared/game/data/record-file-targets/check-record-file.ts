/* @layer shared-game @kind logic */
import { findOne } from '../facade';
import type { CheckHome, FileTarget } from './record-file-targets.type';
import { AREA_FOLDERS } from './layout.constants';
import { eventRecordFile } from './event-record-file';
import { worldFolder } from './world-folder';
import { worldOfDungeon } from './world-of-dungeon';

const checkRecordFile = (check: CheckHome): FileTarget => {
  if (check.kind === 'event') return eventRecordFile(check);
  const dungeonId = check.dungeonId;
  if (dungeonId) {
    const dungeon = findOne('dungeon', d => d.id === dungeonId);
    if (!dungeon) return { relativePath: null, unresolved: `unknown dungeon ${dungeonId}` };
    return { relativePath: `checks/${worldOfDungeon(dungeon)}/${dungeon.fileStem}.ts` };
  }
  const screenId = check.screenId;
  if (!screenId) return { relativePath: null, unresolved: 'check names neither a dungeon nor a screen' };
  const screen = findOne('screen', s => s.id === screenId);
  if (!screen) return { relativePath: null, unresolved: `unknown screen ${screenId}` };
  const folder = AREA_FOLDERS[screen.areaId];
  if (!folder) return { relativePath: null, unresolved: `no area folder exists for ${screen.areaId}` };
  return { relativePath: `checks/${worldFolder(screen.world)}/overworld/${folder}.ts` };
};

export { checkRecordFile };
