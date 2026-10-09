/* @layer shared-game @kind logic */
import { MOST_KEYS_ASKED, SMALL_KEY_ITEMS } from './small-keys.constants';
import type { ItemId } from '@shared/game/data/types/ids';

const fullKeyRing = (): ItemId[] =>
  SMALL_KEY_ITEMS.flatMap((key) => Array.from({ length: MOST_KEYS_ASKED }, () => key));

export { fullKeyRing };
