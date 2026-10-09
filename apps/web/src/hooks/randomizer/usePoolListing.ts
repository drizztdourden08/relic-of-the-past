/* @layer renderer-lib @kind hook */
import { useMemo } from 'react';
import { buildFillWorld } from '@shared/randomizer/world/fill/fill-world';
import { fillOptionsFromSnapshot } from '@shared/randomizer/world/fill/fill-options-from-snapshot';
import { UNCLE_LOCATION } from '@shared/randomizer/world/pool/standard-escape.data';
import { useSpriteAvailability } from '../../lib/sprites/useSpriteAvailability';
import { useSpriteRevision } from '../../lib/sprites/useSpriteRevision';
import { deliverableSets } from './deliverable-sets';
import { poolListingGroupsOf } from './pool-listing-model';
import { startingWeaponGroupOf, withStartingWeaponGroup } from './starting-weapon-group';
import type { RandomizerOptionsSnapshot } from '@shared/randomizer/world/options.type';
import type { PoolListingGroup } from '@domains/app/compounds/PoolListing';
import { NO_GROUPS } from './usePoolListing.constants';

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
