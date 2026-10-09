/* @layer renderer-lib @kind logic */
import type { ScreenCrossing } from '@rotp/game-core';

const isPlaced = (crossing: ScreenCrossing): boolean => crossing.placed;

export { isPlaced };
