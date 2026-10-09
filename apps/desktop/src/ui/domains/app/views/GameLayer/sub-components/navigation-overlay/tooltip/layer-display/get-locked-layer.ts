/* @layer renderer-components @kind logic */
import type { FloodFillResult } from '@shared/game/navigation';

const getLockedLayer = (result: FloodFillResult): 0 | 1 => {
  return result.startLayer ?? 0;
};

export { getLockedLayer };
