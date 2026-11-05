/* @layer shared-game @kind logic */
import { BIG_KEY_DOORS, DARK_ROOMS_NEED_LIGHT, SMALL_KEY_DOORS } from './placement-reading.constants';
import type { LogicToggles } from './placement-availability.type';

const assumedOfToggles = ({ bigKeyDoors, smallKeyDoors, darkRoomsNeedLight }: LogicToggles): Set<string> => {
  const assumed = new Set<string>();
  if (bigKeyDoors) assumed.add(BIG_KEY_DOORS);
  if (smallKeyDoors) assumed.add(SMALL_KEY_DOORS);
  if (darkRoomsNeedLight) assumed.add(DARK_ROOMS_NEED_LIGHT);
  return assumed;
};

export { assumedOfToggles };
