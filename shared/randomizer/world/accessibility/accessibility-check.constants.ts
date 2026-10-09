/* @layer shared-game @kind constants */
import { PRIZE_ITEMS } from '../pool/prize-items.data';
import type { ItemKey } from '../item-ids.data';

const AUTO_ADVANCEMENT: ReadonlySet<ItemKey> = new Set<ItemKey>(PRIZE_ITEMS);

export { AUTO_ADVANCEMENT };
