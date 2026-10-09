/* @layer shared-game @kind logic */
import { CASTLE_DUNGEON_INDEX, SEWERS_DUNGEON_INDEX } from './dungeon-group.constants';

const dungeonGroupOf = (palaceIndex: number): number => {
  const dungeonIndex = palaceIndex >> 1;
  return dungeonIndex === SEWERS_DUNGEON_INDEX ? CASTLE_DUNGEON_INDEX : dungeonIndex;
};

export { dungeonGroupOf };
