/* @layer bridge-wasm @kind logic */
/**
 * Legacy placement adapter: lifts a v1 LegacyPlacement into the Placement shape sessions
 * consume, so profiles generated before the ported pipeline keep playing. The v1 file already
 * stored dataset check and item ids, which is exactly what a placement is keyed by now, so the
 * lift is a straight copy. The legacy generator never touched npc-scope locations or
 * medallions, so the adapted stats say npc scope OFF and the vanilla medallion pair.
 */

import { VANILLA_MEDALLIONS } from '@shared/randomizer/world/item-groups';
import type { CheckId, ItemId } from '@shared/game/data';
import type { Placement } from '@shared/randomizer/world/fill/placement.type';
import type { LocationKey } from '@shared/randomizer/world/location-key';
import type { ItemKey } from '@shared/randomizer/world/item-ids.data';
import type { LegacyPlacement } from '@shared/randomizer/placement.type';

const adaptLegacyPlacement = (placement: LegacyPlacement): Placement => {
  const locations: Record<LocationKey, ItemKey> = {};
  for (const [checkId, itemId] of Object.entries(placement.assignments)) {
    locations[checkId as CheckId] = itemId as ItemId;
  }
  const spheres = placement.spoiler.map((sphere) => ({
    index: sphere.index,
    locations: sphere.entries.map(({ checkId }) => checkId as CheckId),
  }));
  return {
    seed: placement.seed,
    // The legacy pipeline had no medallion roll, so the entrances stay vanilla.
    medallions: { ...VANILLA_MEDALLIONS },
    locations,
    spheres,
    stats: {
      attempts: 1,
      keyDropShuffle: placement.options.randomizedKinds.includes('keyDrop'),
      includeNpcChecks: false,
      includeWorldItems: false,
      locationCount: Object.keys(locations).length,
      sphereCount: spheres.length,
    },
  };
};

export { adaptLegacyPlacement };
