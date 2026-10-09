/* @layer renderer-components @kind constants */
const PATH_DIRS: ReadonlyArray<readonly [number, number]> = [
  [-1, 0],
  [1, 0],
  [0, -1],
  [0, 1],
];

const REACH_BLOCKED = 0;
const REACH_OPEN = 1;
const LEDGE_STATE_MIN = 2;
const LEDGE_STATE_MAX = 9;
const GOAL_SEARCH_RADIUS = 8;
const TILE_PX = 8;
const AXIS_EPSILON = 0.001;

export { PATH_DIRS, REACH_BLOCKED, REACH_OPEN, LEDGE_STATE_MIN, LEDGE_STATE_MAX, GOAL_SEARCH_RADIUS, TILE_PX, AXIS_EPSILON };
