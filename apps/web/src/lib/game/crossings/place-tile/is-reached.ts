/* @layer bridge-wasm @kind logic */
import type { ReachState } from '@shared/game/navigation/types';

const isReached = (reachable: readonly ReachState[][] | undefined, row: number, col: number): boolean =>
  (reachable?.[row]?.[col] ?? 0) > 0;

export { isReached };
