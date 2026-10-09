/* @layer shared-asset-extraction @kind constants */
const DOOR_LIST_END = 0xffff;

const DUNGEON_ROOMS: ReadonlySet<number> = new Set([
  0x69, 0x78, 0x79, 0x88, 0x9a, 0xad, 0xbd, 0xcd, 0xdd, 0xe9, 0xec, 0xfc,
]);

const ROOM_GRID_STEP_BY_DIRECTION = [-16, 16, -1, 1] as const;

const LEAVES_DUNGEON_DOOR_TYPES: ReadonlySet<number> = new Set([6, 10, 12, 14, 16, 18]);

const DOOR_TYPE_SHIFT = 8;

const DOOR_DIRECTION_MASK = 3;

export {
  DOOR_DIRECTION_MASK, DOOR_LIST_END, DOOR_TYPE_SHIFT, DUNGEON_ROOMS, LEAVES_DUNGEON_DOOR_TYPES,
  ROOM_GRID_STEP_BY_DIRECTION,
};
