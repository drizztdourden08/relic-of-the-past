/* @layer renderer-lib @kind logic */
import type { ScreenCrossing, ScreenCrossings } from '@shared/game/navigation';
import { isLanding } from './is-landing';

const landingCrossings = (screen: ScreenCrossings, isIndoors: boolean): readonly ScreenCrossing[] =>
  screen.entrances.filter((crossing) => isLanding(crossing, isIndoors));

export { landingCrossings };
