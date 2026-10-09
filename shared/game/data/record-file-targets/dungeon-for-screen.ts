/* @layer shared-game @kind logic */
import { findOne } from '../facade';
import type { DungeonRecord } from '../types';
import type { ScreenHome } from './record-file-targets.type';
import { dungeonForPalaceIndex } from './dungeon-for-palace-index';

const dungeonForScreen = (screen: ScreenHome): DungeonRecord | undefined => {
  const id = screen.id;
  const listed = id ? findOne('dungeon', d => d.roomScreenIds.includes(id)) : undefined;
  if (listed) return listed;
  return screen.gameId.palaceIndex === undefined ? undefined : dungeonForPalaceIndex(screen.gameId.palaceIndex);
};

export { dungeonForScreen };
