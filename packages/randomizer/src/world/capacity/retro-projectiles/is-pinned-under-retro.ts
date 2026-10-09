/* @layer shared-game @kind logic */
import { RETRO_PINNED_FAMILIES } from './retro-projectiles.constants';
import type { CapacityFamilyId } from '../capacity-profile.type';

const isPinnedUnderRetro = (family: CapacityFamilyId, retroBow: boolean): boolean =>
  retroBow && RETRO_PINNED_FAMILIES.includes(family);

export { isPinnedUnderRetro };
