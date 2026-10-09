/* @layer shared-game @kind types */
import type { LedgeTraversal } from '../types';

interface CrossingRecorder {
  add: (nr: number, nc: number, lr: number, lc: number, dr: number) => void;
  list: () => LedgeTraversal[];
}

export type { CrossingRecorder };
