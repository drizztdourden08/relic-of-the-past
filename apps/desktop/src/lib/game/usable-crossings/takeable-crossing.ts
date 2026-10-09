/* @layer bridge-wasm @kind logic */
import type { ScreenCrossing } from '@shared/game/navigation';

const takeableCrossing = (crossing: ScreenCrossing): boolean =>
  crossing.class === 'edge' || crossing.available;

export { takeableCrossing };
