/* @layer shared-game @kind logic */
import { RETRO_PINNED_FAMILIES } from './retro-projectiles.constants';
import type { CapacityProfile } from '../capacity-profile.type';

const withRetroBow = (profile: CapacityProfile, retroBow: boolean): CapacityProfile => {
  if (!retroBow) return profile;
  const next = { ...profile };
  for (const family of RETRO_PINNED_FAMILIES) {
    if (next[family].mode !== 'vanilla') next[family] = { mode: 'vanilla' };
  }
  return next;
};

export { withRetroBow };
