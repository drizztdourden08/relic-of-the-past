/* @layer shared-game @kind logic */
import type { WorldLocation as BaseWorldLocation } from '@drizztdourden08/brock-randomizer/world';
import type { RotpKeys } from '../../world/rotp-keys.type';
import type { WorldLocation } from '../../world/region.type';

const isRotpLocation = (location: BaseWorldLocation<RotpKeys>): location is WorldLocation =>
  'prize' in location && 'pondSlot' in location;

export { isRotpLocation };
