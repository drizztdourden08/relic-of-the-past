/* @layer shared-game @kind logic */
import type { LedgeTraversal } from '../types';
import type { CrossingRecorder } from './ledge-crossings.type';

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
export type { CrossingRecorder } from './ledge-crossings.type';
