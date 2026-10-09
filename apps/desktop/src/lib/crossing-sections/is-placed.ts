/* @layer renderer-lib @kind logic */
import type { ScreenCrossing } from '@shared/game/navigation';

const isPlaced = (crossing: ScreenCrossing): boolean => crossing.placed;

export { isPlaced };
