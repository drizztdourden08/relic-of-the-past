/* @layer renderer-lib @kind logic */
import type { ScreenCrossing, ScreenCrossings } from '@rotp/game-core';
import { isLanding } from './is-landing';

const listedCrossings = (screen: ScreenCrossings, isIndoors: boolean): readonly ScreenCrossing[] =>
  screen.entrances.filter((crossing) => !isLanding(crossing, isIndoors));

export { listedCrossings };
