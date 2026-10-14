/* @layer renderer-appshell @kind constants */
const UI_STATE_OFFSETS = {
  palaceIndex: 75,
  roomIndex: 77,
  overworldScreenIndex: 109,
  isIndoors: 111,
  whichEntrance: 119,
} as const;

const NO_PALACE = 0xFF;

const LAYER_TOGGLE_DOOR_TYPE = 22;

const LAYER_TOGGLE_ATTR_FIRST = 0x90;
const LAYER_TOGGLE_ATTR_LAST = 0x97;

const DUMP_SETTLE_MS = 3000;

const ROOM_TILE_COUNT = 64;
const CROSSING_ROW_BEFORE = 31;
const CROSSING_ROW_AFTER = 32;

const HORIZONTAL_BOUNDARY_SHAPES: readonly string[] = ['2x2', '1x2'];
const VERTICAL_BOUNDARY_SHAPES: readonly string[] = ['2x2', '2x1'];

export {
  CROSSING_ROW_AFTER, CROSSING_ROW_BEFORE, DUMP_SETTLE_MS, HORIZONTAL_BOUNDARY_SHAPES, LAYER_TOGGLE_ATTR_FIRST,
  LAYER_TOGGLE_ATTR_LAST, LAYER_TOGGLE_DOOR_TYPE, NO_PALACE, ROOM_TILE_COUNT, UI_STATE_OFFSETS,
  VERTICAL_BOUNDARY_SHAPES,
};
