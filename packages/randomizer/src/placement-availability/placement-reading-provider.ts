/* @layer shared-game @kind logic */
import { actTokensOf } from '../world/events/event-gates';
import { assumedHeld } from './assumed-held';
import { DARK_ROOMS_NEED_LIGHT } from './placement-reading.constants';
import { placementWorldKey } from './placement-world-key';
import { primeActTokens } from './prime-act-tokens';
import { worldFromPlacement } from './world-from-placement';
import type { TrackerProvider } from '@drizztdourden08/brock-randomizer/tracker';
import type { Placement } from '../world/fill/placement.type';

const placementReadingProvider: TrackerProvider<Placement> = {
  world: (input) => worldFromPlacement(
    input.placement, input.assumed.has(DARK_ROOMS_NEED_LIGHT), actTokensOf(input.completed),
  ),
  worldKey: placementWorldKey,
  assumedHeld,
  prime: primeActTokens,
};

export { placementReadingProvider };
