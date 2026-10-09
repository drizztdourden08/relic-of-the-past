/* @layer shared-game @kind logic */
import { NORMAL_DARK_ROOMS, ORIGINAL_MEDALLIONS } from './normal-placement.constants';
import type { WorldOptions } from '../world/world.type';
import type { NormalPlacementParams } from './normal-placement.type';

const normalWorldOptions = ({ storyGates, world }: NormalPlacementParams): WorldOptions => ({
  keyDropShuffle: true,
  includeNpcChecks: true,
  includeWorldItems: true,
  medallions: { ...ORIGINAL_MEDALLIONS },
  darkRooms: NORMAL_DARK_ROOMS,
  pondLocations: [],
  pondPrizeLocations: [],
  ...(storyGates === undefined ? {} : { storyGates }),
  ...world,
});

export { normalWorldOptions };
