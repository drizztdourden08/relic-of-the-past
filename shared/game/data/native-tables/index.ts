/* @layer shared-game @kind barrel */
export {
  INTERIOR_ATTRS, INTERIOR_TILE_BEHAVIOR, INTERIOR_TILE_VISUAL,
  OVERWORLD_TILE_ATTRS, OVERWORLD_TILE_BEHAVIOR, OVERWORLD_TILE_VISUAL,
} from './tile-tables.constants';
export { COLLISION_MODE_NAMES, LAYER_EFFECT_NAMES, MANIPULABLE_NAMES, ROOM_TAG_NAMES } from './name-tables.constants';
export { BARRIER_TO_TOKEN, DOOR_BARRIER, IMPLIED_TOKENS, ITEM_TO_TOKEN } from './traversal-tables.constants';
export {
  CLIFF_BORDER_ATTRS, CLIFF_DIRS_INDOOR, CLIFF_DIRS_OUTDOOR, CLIFF_TRIGGERS, CLIFF_WALL_INDOOR, CLIFF_WALL_OUTDOOR,
  DIAG_EDGE_ATTRS, DRAW_DOTS_LEDGE_ATTRS, HORIZ_LEDGE_ATTRS, VERT_LEDGE_ATTRS, VERTICAL_CLIFF_DIRS,
} from './cliff-tables.constants';
export { hasNativeTables } from './has-native-tables';
export type { AttrGroup } from './attr-group.type';
export type { CliffDir, DoorKind } from '../types/native-tables';
