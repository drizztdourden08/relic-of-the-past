/* @layer shared-game @kind logic */
/**
 * The ledge hops a dual-layer walk actually landed, recorded ONE ENTRY PER TILE.
 *
 * Two things this is not. It is not cliff-preprocessing's wall-run guess, which
 * only walks layer 0's own grid and cannot see where the drop really ends. And
 * it is not one entry per body position: Link is 2 tiles wide, so an N-tile
 * ledge offers only N-1 places to stand, and recording per body left the last
 * tile of every ledge without an arrow while halving a 2-tile gap to a single
 * one. A 1-tile gap still records nothing, because it offers no body position
 * at all, which is the correct answer, since the player cannot jump from it.
 */
import type { LedgeTraversal } from '../types';

interface CrossingRecorder {
  /** Record a landed hop from body (nr,nc) to (lr,lc). `dr` gives the axis:
   *  a vertical hop spans two columns, a horizontal one two rows. */
  add: (nr: number, nc: number, lr: number, lc: number, dr: number) => void;
  list: () => LedgeTraversal[];
}

const createCrossingRecorder = (): CrossingRecorder => {
  const crossings: LedgeTraversal[] = [];
  const seen = new Set<string>();

  const add = (nr: number, nc: number, lr: number, lc: number, dr: number): void => {
    const across: readonly [number, number][] = dr !== 0 ? [[0, 0], [0, 1]] : [[0, 0], [1, 0]];
    for (const [ar, ac] of across) {
      const key = `${nr + ar},${nc + ac},${lr + ar},${lc + ac}`;
      if (seen.has(key)) continue;
      seen.add(key);
      crossings.push({ startRow: nr + ar, startCol: nc + ac, endRow: lr + ar, endCol: lc + ac });
    }
  };

  return { add, list: () => crossings };
};

export { createCrossingRecorder };
export type { CrossingRecorder };
