/* @layer shared-game @kind types */
import type { GridPos, LedgeTraversal } from '@rotp/game-core';

interface CrossingRecorder {
  add: (from: GridPos, to: GridPos, dr: number) => void;
  list: () => LedgeTraversal[];
}

export type { CrossingRecorder };
