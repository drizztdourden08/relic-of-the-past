/* @layer renderer-lib @kind logic */
import type { ScreenCrossing } from '@rotp/game-core';

const isLanding = (crossing: ScreenCrossing, isIndoors: boolean): boolean =>
  isIndoors && crossing.origin === 'fall-hole';

export { isLanding };
