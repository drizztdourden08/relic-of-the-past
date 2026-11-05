/* @layer shared-game @kind logic */
import { placeVanilla } from '@drizztdourden08/brock-randomizer/tracker';
import { buildWorld } from '../world/build-world';
import { originalContentOf } from './original-content-of';
import { recordedContents } from './recorded-contents';
import { normalPlacementStats } from './normal-placement-stats';
import { normalWorldOptions } from './normal-world-options';
import { NORMAL_DARK_ROOMS, NORMAL_SEED, ORIGINAL_MEDALLIONS } from './normal-placement.constants';
import type { ItemKey } from '../world/item-ids';
import type { LocationKey } from '../world/location-key';
import type { Placement } from '../world/fill/placement.type';
import type { NormalPlacementParams } from './normal-placement.type';

const buildNormalPlacement = (params: NormalPlacementParams = {}): Placement => {
  const world = buildWorld(normalWorldOptions(params));
  const recorded = recordedContents();
  const vanilla = placeVanilla(world, (location) => originalContentOf(world, recorded, location.key, location.region));

  const locations: Record<LocationKey, ItemKey> = {};
  for (const [key, item] of vanilla.locations) locations[key] = item;
  const { spheres } = vanilla;

  return {
    seed: NORMAL_SEED,
    medallions: { ...ORIGINAL_MEDALLIONS },
    locations,
    shopPrices: {},
    pondDemands: {},
    spheres,
    stats: normalPlacementStats({
      darkRooms: NORMAL_DARK_ROOMS,
      storyGates: params.storyGates,
      locationCount: Object.keys(locations).length,
      sphereCount: spheres.length,
    }),
  };
};

export { buildNormalPlacement };
