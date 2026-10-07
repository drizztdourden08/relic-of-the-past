/* @layer shared-game @kind logic */
/** Indoor ledge-direction inference: 0x28/0x29/0x2A/0x2B jump toward the adjacent wall face. */
import { GRID_SIZE } from '../types';

interface LedgeDir {
  dr: number;
  dc: number;
  dir: 'n' | 's' | 'e' | 'w';
}

const HORIZ_LEDGE_ATTRS = new Set([0x2a, 0x2b]);
const VERT_LEDGE_ATTRS = new Set([0x28, 0x29]);

const inferAxisDir = (
  wallAt: (d: number) => boolean,
  negDir: LedgeDir,
  posDir: LedgeDir,
): LedgeDir => {
  const hasWallNeg = wallAt(-1);
  const hasWallPos = wallAt(1);
  if (hasWallPos && !hasWallNeg) return posDir;
  if (hasWallNeg && !hasWallPos) return negDir;

  // Ambiguous, so count walls up to 3 tiles out on each side
  let neg = 0, pos = 0;
  for (let d = 1; d <= 3; d++) {
    if (wallAt(d)) pos++;
    if (wallAt(-d)) neg++;
  }
  if (pos > neg) return posDir;
  if (neg > pos) return negDir;
  return posDir; // default fallback (east / south)
};

/**
 * Compute the inferred jump direction for every indoor straight-ledge trigger tile.
 * Keyed by row * GRID_SIZE + col. Pure inference with no grid mutation, so callers can
 * check neighbor directions (the player's 2-wide body needs a same-direction pair).
 */
const computeIndoorLedgeDirs = (rawAttr: number[][], cliffWall: ReadonlySet<number>): Map<number, LedgeDir> => {
  const dirs = new Map<number, LedgeDir>();
  const wall = (r: number, c: number) =>
    r >= 0 && r < GRID_SIZE && c >= 0 && c < GRID_SIZE && cliffWall.has(rawAttr[r][c]);

  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      const attr = rawAttr[row][col];
      if (HORIZ_LEDGE_ATTRS.has(attr)) {
        dirs.set(row * GRID_SIZE + col, inferAxisDir(
          (d) => wall(row, col + d),
          { dr: 0, dc: -1, dir: 'w' },
          { dr: 0, dc: 1, dir: 'e' },
        ));
      } else if (VERT_LEDGE_ATTRS.has(attr)) {
        dirs.set(row * GRID_SIZE + col, inferAxisDir(
          (d) => wall(row + d, col),
          { dr: -1, dc: 0, dir: 'n' },
          { dr: 1, dc: 0, dir: 's' },
        ));
      }
    }
  }
  return dirs;
};

export { computeIndoorLedgeDirs, HORIZ_LEDGE_ATTRS, VERT_LEDGE_ATTRS };
export type { LedgeDir };
