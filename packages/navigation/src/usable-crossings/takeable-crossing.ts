/* @layer bridge-wasm @kind logic */
import type { ScreenCrossing } from '@rotp/game-core';

const takeableCrossing = (crossing: ScreenCrossing): boolean =>
  crossing.class === 'edge' || crossing.available;

export { takeableCrossing };
