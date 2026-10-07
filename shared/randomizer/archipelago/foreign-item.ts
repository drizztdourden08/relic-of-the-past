/* @layer shared-game @kind logic */
/**
 * The item key a multiworld placement holds at a location whose item belongs to another
 * player. This game has no record for it: the pickup behaves like any other, and nothing
 * enters the inventory (the core's foreign-item sentinel). Only an online placement
 * (scouts-to-placement.ts) ever carries it.
 */
import type { ItemKey } from '../world/item-ids.data';

const FOREIGN_ITEM_KEY: ItemKey = 'item-foreign';

/** What every surface calls the foreign item when no owner is known. */
const FOREIGN_ITEM_NAME = 'Another player\'s item';

const isForeignItem = (item: ItemKey): boolean => item === FOREIGN_ITEM_KEY;

/** The foreign item's name, with the owner's name when the server gave one. */
const foreignItemName = (owner?: string): string =>
  (owner === undefined || owner === '' ? FOREIGN_ITEM_NAME : `${owner}'s item`);

export { FOREIGN_ITEM_KEY, FOREIGN_ITEM_NAME, foreignItemName, isForeignItem };
