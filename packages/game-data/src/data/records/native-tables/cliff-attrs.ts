/* @layer shared-game @kind data */
import type { CliffDir } from '../../types/native-tables';

const CLIFF_TRIGGER_BYTES: readonly number[] = [0x28, 0x29, 0x2a, 0x2b];

const CLIFF_DIRS_INDOOR: Record<number, CliffDir> = {
  0x2f: { dr: 0, dc: -1, dir: 'w' },
};

const CLIFF_DIRS_OUTDOOR: Record<number, CliffDir> = {
  0x28: { dr: -1, dc: 0, dir: 'n' },
  0x29: { dr: 1, dc: 0, dir: 's' },
  0x2a: { dr: 0, dc: -1, dir: 'w' },
  0x2b: { dr: 0, dc: 1, dir: 'e' },
};

const CLIFF_WALL_INDOOR_BYTES: readonly number[] = [0x01, 0x02, 0x03, 0x04, 0x1a, 0x12, 0x13, 0x1b];

const CLIFF_WALL_OUTDOOR_BYTES: readonly number[] = [0x01, 0x02, 0x03, 0x1a, 0x12, 0x13, 0x1b];

const DIAG_EDGE_BYTES: readonly number[] = [];

const CLIFF_BORDER_BYTES: readonly number[] = [0x10, 0x18];

const VERTICAL_CLIFF_DIRS: Record<number, -1 | 1> = { 0x2c: -1, 0x2e: -1, 0x2d: 1, 0x2f: 1 };

const HORIZ_LEDGE_BYTES: readonly number[] = [0x2a, 0x2b];

const VERT_LEDGE_BYTES: readonly number[] = [0x28, 0x29];

const DRAW_DOTS_LEDGE_BYTES: readonly number[] = [
  0x28, 0x29, 0x2a, 0x2b, 0x2c, 0x2d, 0x2e, 0x2f,
  0x01, 0x02, 0x03, 0x1a, 0x12, 0x11, 0x13, 0x19, 0x1b,
  0x3d,
];

export {
  CLIFF_TRIGGER_BYTES,
  CLIFF_DIRS_INDOOR,
  CLIFF_DIRS_OUTDOOR,
  CLIFF_WALL_INDOOR_BYTES,
  CLIFF_WALL_OUTDOOR_BYTES,
  DIAG_EDGE_BYTES,
  CLIFF_BORDER_BYTES,
  VERTICAL_CLIFF_DIRS,
  HORIZ_LEDGE_BYTES,
  VERT_LEDGE_BYTES,
  DRAW_DOTS_LEDGE_BYTES,
};
