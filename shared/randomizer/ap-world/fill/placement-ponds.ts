/* @layer shared-game @kind logic */
/**
 * The pond settings a persisted placement was generated with. A placement
 * frozen while one pond was configurable carries that single setting, which
 * was always the capacity pond's, so it reads as that pond's setting with the
 * other two left legacy. A placement older still carries neither and reads as
 * three legacy ponds, which is the game it was rolled against.
 */
import { CAPACITY_POND } from '../pond/pond-instances.data';
import { LEGACY_POND_PROFILES } from '../pond/pond-profile-defaults';
import type { PondProfiles } from '../pond/pond-profiles.type';
import type { ApPlacementStats } from './ap-placement.type';

const pondProfilesOfStats = (stats: ApPlacementStats | undefined): PondProfiles => {
  const { ponds, pond } = stats ?? {};
  if (ponds !== undefined) return ponds;
  if (pond === undefined) return LEGACY_POND_PROFILES;
  return { ...LEGACY_POND_PROFILES, [CAPACITY_POND.id]: pond };
};

export { pondProfilesOfStats };
