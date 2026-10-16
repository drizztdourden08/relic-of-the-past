/* @layer renderer-lib @kind constants */
import { framesOf, stateFor } from '@rotp/game-data';
import type { PoseFrame, Wearing } from '@rotp/game-data';

const REST_ACTION = 0x00;
const REST_FACING = 1;
const DEFAULT_WEARING: Wearing = { outfit: 'green', gloves: 0 };

const REST_FRAME: PoseFrame | null = (() => {
  const state = stateFor(REST_ACTION);
  return state ? (framesOf(state, REST_FACING)[0] ?? null) : null;
})();

export { DEFAULT_WEARING, REST_FRAME };
