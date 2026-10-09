/* @layer shared-game @kind logic */
import { LAST_DUNGEON_PALACE, PALACE_NONE } from './dungeon-values.constants';

const isDungeonPalace = (palaceIndex: number): boolean =>
  palaceIndex !== PALACE_NONE && palaceIndex <= LAST_DUNGEON_PALACE;

export { isDungeonPalace };
