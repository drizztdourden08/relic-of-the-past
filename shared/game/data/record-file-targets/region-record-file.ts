/* @layer shared-game @kind logic */
import { findOne } from '../facade';
import type { RegionRecord } from '../types';
import type { FileTarget } from './record-file-targets.type';
import { worldFolder } from './world-folder';

const regionRecordFile = (region: Pick<RegionRecord, 'world' | 'type' | 'dungeonId'>): FileTarget => {
  const folder = `regions/${worldFolder(region.world)}`;
  const dungeonId = region.dungeonId;
  if (dungeonId) {
    const dungeon = findOne('dungeon', d => d.id === dungeonId);
    if (!dungeon) return { relativePath: null, unresolved: `unknown dungeon ${dungeonId}` };
    return { relativePath: `${folder}/${dungeon.fileStem}.ts` };
  }
  if (region.type === 'dungeon') {
    return { relativePath: null, unresolved: 'a dungeon region that names no dungeon is filed by hand' };
  }
  return { relativePath: `${folder}/${region.type === 'cave' ? 'interiors' : 'overworld'}.ts` };
};

export { regionRecordFile };
