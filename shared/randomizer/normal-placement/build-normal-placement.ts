/* @layer shared-game @kind logic */
import { buildWorld } from '../world/build-world';
import { sweepPlacementSpheres } from '../world/fill/verify-placement';
import { originalContentOf } from './original-content-of';
import { recordedContents } from './recorded-contents';
import { normalPlacementStats } from './normal-placement-stats';
import { normalWorldOptions } from './normal-world-options';
import { NORMAL_DARK_ROOMS, NORMAL_SEED, ORIGINAL_MEDALLIONS } from './normal-placement.constants';
import type { ItemKey } from '../world/item-ids.data';
import type { LocationKey } from '../world/location-key';
import type { Placement } from '../world/fill/placement.type';
import type { NormalPlacementParams } from './normal-placement.type';

const buildNormalPlacement = (params: NormalPlacementParams = {}): Placement => {
  const options = normalWorldOptions(params);
  const world = buildWorld(options);
  const recorded = recordedContents();

  const locations: Record<LocationKey, ItemKey> = {};
  for (const region of world.regions.values()) {
    for (const location of region.locations) {
      const item = originalContentOf(world, recorded, location.key, region.id);
      if (item === undefined) throw new Error(`no original item recorded for location: ${location.key}`);
      locations[location.key] = item;
    }
  }
  for (const [key, item] of Object.entries(locations)) world.placedItems.set(key as LocationKey, item);
  const { spheres } = sweepPlacementSpheres(world);

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
