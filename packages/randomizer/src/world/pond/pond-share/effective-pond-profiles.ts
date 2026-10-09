/* @layer shared-game @kind logic */
import { CAPACITY_POND, POND_IDS } from '../pond-instances';
import type { PondProfiles } from '../pond-profiles.type';

const effectivePondProfiles = (profiles: PondProfiles, shared: boolean): PondProfiles => {
  if (!shared) return profiles;
  const shown = profiles[CAPACITY_POND.id];
  return Object.fromEntries(POND_IDS.map((id) => [id, shown])) as PondProfiles;
};

export { effectivePondProfiles };
