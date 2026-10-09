/* @layer renderer-widgets @kind constants */
const EDGE_ORDER: Record<string, number> = { north: 0, south: 1, west: 2, east: 3 };

const FALL_HOLE_ENTRANCE_ID_FROM = 200;

const ROOM_GRID_TILES = 64;
const ROOMS_PER_ROW = 16;
const ROOM_PIXELS = 512;

const LIFT_BUSHES = 'lift.1';
const LIFT_POWER_GLOVE = 'lift.2';
const LIFT_TITANS_MITT = 'lift.3';

export {
  EDGE_ORDER, FALL_HOLE_ENTRANCE_ID_FROM, LIFT_BUSHES, LIFT_POWER_GLOVE, LIFT_TITANS_MITT, ROOM_GRID_TILES, ROOM_PIXELS, ROOMS_PER_ROW,
};
