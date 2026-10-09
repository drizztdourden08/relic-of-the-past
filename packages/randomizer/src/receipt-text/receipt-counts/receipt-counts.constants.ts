/* @layer shared-game @kind constants */
import { BOTTLE_ITEMS, CRYSTAL_ITEMS } from '../../world/item-groups';
import { PRIZE_ITEMS } from '../../world/pool/prize-items.data';
import type { ItemKey } from '../../world/item-ids.data';

const BOTTLES: ReadonlySet<ItemKey> = new Set<ItemKey>(BOTTLE_ITEMS);
const CRYSTALS: ReadonlySet<ItemKey> = new Set<ItemKey>(CRYSTAL_ITEMS);
const PENDANTS: ReadonlySet<ItemKey> = new Set<ItemKey>(PRIZE_ITEMS.filter((item) => !CRYSTALS.has(item)));

export { BOTTLES, CRYSTALS, PENDANTS };
