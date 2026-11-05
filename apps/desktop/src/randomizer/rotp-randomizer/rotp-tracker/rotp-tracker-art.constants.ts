/* @layer renderer-app @kind constants */
import { INVENTORY_LAYOUT } from '@rotp/game-data';
import type { InventorySlot, ItemId } from '@rotp/game-data';

const NOTHING_HELD: ReadonlySet<ItemId> = new Set();
const SLOTS: readonly InventorySlot[] = INVENTORY_LAYOUT.flatMap((category) => category.items);

export { NOTHING_HELD, SLOTS };
