/* @layer shared-game @kind logic */
import { isCapacityUpgradeItemName } from '@shared/game/data/capacity-upgrade-item';
import { itemKeyName } from '../display-names/item-key-name';
import { PROGRESSION_ITEMS, USEFUL_ITEMS } from './item-classes.constants';
import type { ItemId } from '@shared/game/data/types/ids';
import type { ItemKey } from '../item-ids.data';

const isFillerItem = (item: ItemKey): boolean =>
  !PROGRESSION_ITEMS.has(item as ItemId) && !USEFUL_ITEMS.has(item as ItemId)
  && !isCapacityUpgradeItemName(itemKeyName(item));

export { isFillerItem };
