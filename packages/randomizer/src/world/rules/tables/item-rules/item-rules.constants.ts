/* @layer shared-game @kind constants */
import { PRIZE_ITEMS } from '../../../pool/prize-items.constants';
import type { ItemKey } from '../../../item-ids';
import type { LocationKey } from '../../../location-key.type';

const PRIZE_SET: ReadonlySet<ItemKey> = new Set<ItemKey>(PRIZE_ITEMS);

const FULL_ACCESS_ALWAYS_ALLOW: ReadonlySet<LocationKey> = new Set<LocationKey>([
  'check-119',
]);

const PALACE_OF_DARKNESS_SELF_LOCK_KEYS = 5;

export { FULL_ACCESS_ALWAYS_ALLOW, PALACE_OF_DARKNESS_SELF_LOCK_KEYS, PRIZE_SET };
