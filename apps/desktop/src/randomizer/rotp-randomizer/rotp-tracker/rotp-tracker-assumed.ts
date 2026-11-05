/* @layer renderer-app @kind logic */
import { BIG_KEY_ITEMS, fullKeyRing } from '@rotp/randomizer';
import { BIG_KEY_DOORS, DARK_ROOMS_NEED_LIGHT, SMALL_KEY_DOORS } from './rotp-tracker.constants';

const doorsOf = (assumed: ReadonlySet<string>) => ({
  bigKeyDoors: assumed.has(BIG_KEY_DOORS),
  smallKeyDoors: assumed.has(SMALL_KEY_DOORS),
  darkRoomsNeedLight: assumed.has(DARK_ROOMS_NEED_LIGHT),
});

const rotpAssumedHeld = (assumed: ReadonlySet<string>): readonly string[] => {
  const { bigKeyDoors, smallKeyDoors } = doorsOf(assumed);
  return [...(bigKeyDoors ? [] : BIG_KEY_ITEMS), ...(smallKeyDoors ? [] : fullKeyRing())];
};

export { doorsOf, rotpAssumedHeld };
