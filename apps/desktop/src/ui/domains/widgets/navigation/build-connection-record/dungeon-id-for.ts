/* @layer renderer-widgets @kind logic */
import { findOne } from '@rotp/game-data';
import type { DungeonId, ScreenId } from '@rotp/game-data';

const dungeonIdFor = (fromScreenId: ScreenId, toScreenId: ScreenId): DungeonId | undefined => {
  const of = (id: ScreenId) => findOne('dungeon', d => d.roomScreenIds.includes(id))?.id;
  const a = of(fromScreenId);
  const b = of(toScreenId);
  if (a && b) return a === b ? a : undefined;
  return a ?? b;
};

export { dungeonIdFor };
