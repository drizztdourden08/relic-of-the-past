/* @layer shared-game @kind constants */
import type { LocationKey } from '../location-key';
import type { ShopPriceView } from '../shops/shop-price.type';
import type { DeliverableSets } from './fill.type';

const EMPTY_DELIVERABLE: ReadonlySet<LocationKey> = new Set();

const NO_DELIVERABLE: DeliverableSets = {};

const NO_SHOP_PRICES: ShopPriceView = {};

const MAX_PLACEMENT_ATTEMPTS = 20;

const MAX_SWAPS_PER_ITEM = 2;

const SPECIFIC_SORT_BONUS = 5;

const BIG_KEY_RANK = 3;

const SMALL_KEY_RANK = 2;

const OTHER_DUNGEON_ITEM_RANK = 1;

const POND_SLOTS_FOLLOW_MODE_FROM_SNAPSHOT = true;

export {
  BIG_KEY_RANK, EMPTY_DELIVERABLE, MAX_PLACEMENT_ATTEMPTS, MAX_SWAPS_PER_ITEM, NO_DELIVERABLE, NO_SHOP_PRICES,
  OTHER_DUNGEON_ITEM_RANK, POND_SLOTS_FOLLOW_MODE_FROM_SNAPSHOT, SMALL_KEY_RANK, SPECIFIC_SORT_BONUS,
};
