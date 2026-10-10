/* @layer shared-game @kind constants */
import type { LedgeStep } from '../indoor-ledge-dirs.type';
import { STEP_EAST, STEP_NORTH, STEP_SOUTH, STEP_WEST } from '../indoor-ledge-dirs.constants';

const CLIFF_TRIGGER_ATTRS = new Set([0x28, 0x29, 0x2a, 0x2b]);
const LEDGE_TRIGGER_RANGE = { first: 0x28, last: 0x2f } as const;

const OUTDOOR_CLIFF_DIRS: Record<number, LedgeStep> = { 0x28: STEP_NORTH, 0x29: STEP_SOUTH, 0x2a: STEP_WEST, 0x2b: STEP_EAST };
const INDOOR_CLIFF_DIRS: Record<number, LedgeStep> = { 0x2f: STEP_WEST };

const OUTDOOR_CLIFF_WALL = new Set([0x01, 0x02, 0x03, 0x1a, 0x12, 0x13, 0x1b]);
const INDOOR_CLIFF_WALL = new Set([0x01, 0x02, 0x03, 0x04, 0x1a, 0x12, 0x13, 0x1b]);

const DIAGONAL_VERTICAL: Record<number, -1 | 1> = { 0x2c: -1, 0x2e: -1, 0x2d: 1, 0x2f: 1 };
const DIAGONAL_NAME: Record<-1 | 1, Record<-1 | 1, 'ne' | 'nw' | 'se' | 'sw'>> = {
  [-1]: { [-1]: 'nw', 1: 'ne' },
  1: { [-1]: 'sw', 1: 'se' },
};

const TILE_PX = 8;
const HOP_DY_PX = 9;
const SAMPLE_DX = [0, 8, 15] as const;
const SAMPLE_DY = 8;
const NEED_WEST = 0b110;
const NEED_EAST = 0b011;
const MAX_HOP_STEPS = 64;

const SOUTH_CLIFF_BORDER_ATTRS = new Set([0x10, 0x18]);

export {
  CLIFF_TRIGGER_ATTRS, DIAGONAL_NAME, DIAGONAL_VERTICAL, HOP_DY_PX, INDOOR_CLIFF_DIRS, INDOOR_CLIFF_WALL,
  LEDGE_TRIGGER_RANGE, MAX_HOP_STEPS, NEED_EAST, NEED_WEST, OUTDOOR_CLIFF_DIRS, OUTDOOR_CLIFF_WALL,
  SAMPLE_DX, SAMPLE_DY, SOUTH_CLIFF_BORDER_ATTRS, TILE_PX,
};
