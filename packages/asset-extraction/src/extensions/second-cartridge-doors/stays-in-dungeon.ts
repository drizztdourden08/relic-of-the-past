/* @layer shared-asset-extraction @kind logic */
import {
  DOOR_DIRECTION_MASK, DOOR_TYPE_SHIFT, DUNGEON_ROOMS, LEAVES_DUNGEON_DOOR_TYPES, ROOM_GRID_STEP_BY_DIRECTION,
} from './second-cartridge-doors.constants';

const staysInDungeon = (roomId: number, word: number): boolean => {
  const type = word >>> DOOR_TYPE_SHIFT;
  if (LEAVES_DUNGEON_DOOR_TYPES.has(type)) return true;
  return DUNGEON_ROOMS.has(roomId + ROOM_GRID_STEP_BY_DIRECTION[word & DOOR_DIRECTION_MASK]);
};

export { staysInDungeon };
