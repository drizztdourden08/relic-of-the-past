/* @layer renderer-widgets @kind logic */
import type { ScreenCrossing } from '@rotp/game-core';

const markerTone = (crossing: ScreenCrossing): string => (crossing.origin === 'room-border' ? 'walk-boundary' : 'entrance');

export { markerTone };
