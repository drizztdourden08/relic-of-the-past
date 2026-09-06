/* @layer bridge-wasm @kind logic */
/**
 * Legacy placement adapter: lifts a v1 Placement (dataset check/item ids)
 * into the ApPlacement shape sessions consume, so profiles generated before
 * the ported pipeline keep playing. The nameView is rebuilt through the
 * certified name join (standardCheckName) and the dataset's item names; the
 * legacy generator never touched npc-scope locations or medallions, so the
 * adapted stats say npc scope OFF and the vanilla medallion pair.
 */

import { getItem } from '@shared/game/data';
import type { CheckId, ItemId } from '@shared/game/data';
import type { ApPlacement } from '@shared/randomizer/ap-world/fill/ap-placement.type';
import type { Placement } from '@shared/randomizer/placement.type';
import { standardCheckName } from './check-names';

const adaptLegacyPlacement = (placement: Placement): ApPlacement => {
  const nameView: Record<string, string> = {};
  for (const [checkId, itemId] of Object.entries(placement.assignments)) {
    nameView[standardCheckName(checkId as CheckId)] = getItem(itemId as ItemId).randomizerName;
  }
  const spheres = placement.spoiler.map((sphere) => ({
    index: sphere.index,
    locations: sphere.entries.map(({ checkId }) => standardCheckName(checkId as CheckId)),
  }));
  return {
    seed: placement.seed,
    // The legacy pipeline had no medallion roll, so the entrances stay vanilla.
    medallions: { mire: 'Ether', turtleRock: 'Quake' },
    nameView,
    spheres,
    stats: {
      attempts: 1,
      keyDropShuffle: placement.options.randomizedKinds.includes('keyDrop'),
      includeNpcChecks: false,
      includeWorldItems: false,
      locationCount: Object.keys(nameView).length,
      sphereCount: spheres.length,
    },
  };
};

export { adaptLegacyPlacement };
