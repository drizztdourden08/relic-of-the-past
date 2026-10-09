/* @layer renderer-lib @kind logic */
import type { ScreenCrossing, ScreenCrossings } from '@shared/game/navigation';
import { isLanding } from './is-landing';
import { isPlaced } from './is-placed';

const markerCrossings = (screen: ScreenCrossings, isIndoors: boolean): readonly ScreenCrossing[] =>
  screen.entrances.filter((crossing) =>
    crossing.available && isPlaced(crossing) && !isLanding(crossing, isIndoors));

export { markerCrossings };
