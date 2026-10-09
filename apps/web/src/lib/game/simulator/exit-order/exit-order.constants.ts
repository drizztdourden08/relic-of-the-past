/* @layer bridge-wasm @kind constants */
const GRID = 64;
const UNREACHED = 0xffff;
const HOP_STEPS = 999;
const AREA_EXIT_BIAS = 0x1000;
const LEDGE_COST = HOP_STEPS + 1;
const START_RING = 2;
const EXIT_RING = 4;
const STEP_DIRECTIONS = [[-1, 0], [1, 0], [0, -1], [0, 1]] as const;

export { GRID, UNREACHED, HOP_STEPS, AREA_EXIT_BIAS, LEDGE_COST, START_RING, EXIT_RING, STEP_DIRECTIONS };
