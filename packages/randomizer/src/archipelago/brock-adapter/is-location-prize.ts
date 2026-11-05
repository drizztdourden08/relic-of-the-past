/* @layer shared-game @kind logic */
import { isRotpLocation } from './is-rotp-location';
import type { WorldLocation as BaseWorldLocation } from '@drizztdourden08/brock-randomizer/world';
import type { RotpKeys } from '../../world/rotp-keys.type';

const isLocationPrize = (location: BaseWorldLocation<RotpKeys>): boolean => {
  if (!isRotpLocation(location)) throw new Error(`not a RotP location: ${location.key}`);
  return location.prize;
};

export { isLocationPrize };
