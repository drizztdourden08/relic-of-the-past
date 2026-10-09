/* @layer renderer-lib @kind logic */
import type { ScreenCrossing, ScreenCrossings } from '@rotp/game-core';
import { isLanding } from './is-landing';

const landingCrossings = (screen: ScreenCrossings, isIndoors: boolean): readonly ScreenCrossing[] =>
  screen.entrances.filter((crossing) => isLanding(crossing, isIndoors));

export { landingCrossings };
