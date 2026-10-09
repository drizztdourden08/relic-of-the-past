/* @layer renderer-lib @kind logic */
import type { ScreenCrossing } from '@shared/game/navigation';

const isLanding = (crossing: ScreenCrossing, isIndoors: boolean): boolean =>
  isIndoors && crossing.origin === 'fall-hole';

export { isLanding };
