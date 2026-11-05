/* @layer shared-game @kind logic */
import { BIG_KEY_ITEMS } from '../world/big-keys';
import { fullKeyRing } from '../world/small-keys';
import { BIG_KEY_DOORS, SMALL_KEY_DOORS } from './placement-reading.constants';

const assumedHeld = (assumed: ReadonlySet<string>): readonly string[] => [
  ...(assumed.has(BIG_KEY_DOORS) ? [] : BIG_KEY_ITEMS),
  ...(assumed.has(SMALL_KEY_DOORS) ? [] : fullKeyRing()),
];

export { assumedHeld };
