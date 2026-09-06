/* @layer renderer-lib @kind hook */
/**
 * The item pool of a snapshot as list groups, memoized per snapshot like the
 * impacts: the same fill world the accounting reads, built with the same
 * scope, so the listing is the multiset the generator would shuffle — never a
 * placement. A pool that cannot be built lists nothing;
 * the accounting beside it carries the reason. Sprites join the rows only
 * once the set of the ROM the listing is for (the creation form's pick, ahead
 * of any active profile) is extracted, so the listing re-renders with art the
 * moment the background extraction lands — and again, with fresh URLs, when
 * that extraction rewrote a set the rows were already drawing.
 */
import { useMemo } from 'react';
import { buildFillWorld } from '@shared/randomizer/ap-world/fill/fill-world';
import { fillOptionsFromSnapshot } from '@shared/randomizer/ap-world/fill/fill-options-from-snapshot';
import { UNCLE_LOCATION } from '@shared/randomizer/ap-world/pool/standard-escape.data';
import { useSpriteAvailability } from '../../lib/sprites/useSpriteAvailability';
import { useSpriteRevision } from '../../lib/sprites/useSpriteRevision';
import { deliverableSets } from './deliverable-sets';
import { poolListingGroupsOf } from './pool-listing-model';
import { startingWeaponGroupOf, withStartingWeaponGroup } from './starting-weapon-group';
import type { RandomizerOptionsSnapshot } from '@shared/randomizer/ap-world/options.type';
import type { PoolListingGroup } from '@domains/app/compounds/PoolListing';

const NO_GROUPS: readonly PoolListingGroup[] = [];

const usePoolListing = (snapshot: RandomizerOptionsSnapshot, romFile: string | null): readonly PoolListingGroup[] => {
  const spritesAvailable = useSpriteAvailability(romFile);
  const spriteRevision = useSpriteRevision();
  return useMemo(() => {
    try {
      // No weapon picker: the listing is the multiset before the mentor draw, and the
      // draw itself is shown as a group of candidates, never as one decided item.
      const fillWorld = buildFillWorld(fillOptionsFromSnapshot(snapshot, deliverableSets(), {}));
      const groups = poolListingGroupsOf(fillWorld.pool, spritesAvailable);
      if (fillWorld.lockedVanilla.has(UNCLE_LOCATION)) return groups;
      return withStartingWeaponGroup(groups, startingWeaponGroupOf(fillWorld.pool.pool, spritesAvailable));
    } catch {
      return NO_GROUPS;
    }
  // spriteRevision is not read here: it moves when the set behind the URLs was
  // rewritten, and the rows have to be rebuilt so they carry the new ones.
  }, [snapshot, spritesAvailable, spriteRevision]);
};

export { usePoolListing };
