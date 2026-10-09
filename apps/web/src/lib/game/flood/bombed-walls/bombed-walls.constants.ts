/* @layer bridge-wasm @kind constants */
const BOMBABLE_ATTR_MIN = 0xf0;
const BOMBABLE_ATTR_MAX = 0xff;
const WALL_ATTRS = new Set([0x01, 0x04]);
const SOLID_ATTR = 0x01;
const FLOOR_ATTR = 0x00;
const MAX_WALL_DEPTH = 16;
const GRID = 64;
const NEIGHBOURS = [[-1, 0], [1, 0], [0, -1], [0, 1]] as const;

export {
  BOMBABLE_ATTR_MIN, BOMBABLE_ATTR_MAX, WALL_ATTRS, SOLID_ATTR, FLOOR_ATTR, MAX_WALL_DEPTH, GRID, NEIGHBOURS,
};
