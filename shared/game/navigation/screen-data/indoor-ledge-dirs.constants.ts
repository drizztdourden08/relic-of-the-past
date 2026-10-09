/* @layer shared-game @kind constants */
import type { LedgeStep } from './indoor-ledge-dirs.type';

const HORIZ_LEDGE_ATTRS = new Set([0x2a, 0x2b]);
const VERT_LEDGE_ATTRS = new Set([0x28, 0x29]);

const WALL_SEARCH_RANGE = 3;

const STEP_WEST: LedgeStep = { dr: 0, dc: -1, dir: 'w' };
const STEP_EAST: LedgeStep = { dr: 0, dc: 1, dir: 'e' };
const STEP_NORTH: LedgeStep = { dr: -1, dc: 0, dir: 'n' };
const STEP_SOUTH: LedgeStep = { dr: 1, dc: 0, dir: 's' };

export { HORIZ_LEDGE_ATTRS, STEP_EAST, STEP_NORTH, STEP_SOUTH, STEP_WEST, VERT_LEDGE_ATTRS, WALL_SEARCH_RANGE };
