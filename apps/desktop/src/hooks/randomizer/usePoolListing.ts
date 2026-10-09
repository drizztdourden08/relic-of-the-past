/* @layer renderer-lib @kind hook */
import { useMemo } from 'react';
import { buildFillWorld, fillOptionsFromSnapshot, UNCLE_LOCATION } from '@rotp/randomizer';
import { useSpriteAvailability } from '../useSpriteAvailability';
import { useSpriteRevision } from '../useSpriteRevision';
import { deliverableSets } from './deliverable-sets';
import { poolListingGroupsOf } from './pool-listing-model';
import { startingWeaponGroupOf, withStartingWeaponGroup } from './starting-weapon-group';
import type { RandomizerOptionsSnapshot } from '@rotp/randomizer';
import type { PoolListingGroup } from '@app/compounds/PoolListing';
import { NO_GROUPS } from './use-pool-listing.constants';

const usePoolListing = (
  snapshot: RandomizerOptionsSnapshot, romFile: string | null, seed = '',
): readonly PoolListingGroup[] => {
  const spritesAvailable = useSpriteAvailability(romFile);
  const spriteRevision = useSpriteRevision();
  return useMemo(() => {
    try {
      const fillWorld = buildFillWorld(fillOptionsFromSnapshot(snapshot, deliverableSets(), {}, seed));
      const groups = poolListingGroupsOf(fillWorld.pool, spritesAvailable);
      if (fillWorld.lockedVanilla.has(UNCLE_LOCATION)) return groups;
      return withStartingWeaponGroup(groups, startingWeaponGroupOf(fillWorld.pool.pool, spritesAvailable));
    } catch {
      return NO_GROUPS;
    }
  }, [snapshot, seed, spritesAvailable, spriteRevision]);
};

export { usePoolListing };
