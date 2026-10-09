/* @layer shared-game @kind logic */
import { prizeReceiveIdOfName, progressiveReceiveIdOfName } from '@rotp/game-data';
import { UNHELD_ITEMS } from './holdable-items.constants';
import { FAMILY_TIER_ITEMS, HOLDABLE_RECORD_NAMES } from './pond-demand-eligibility.constants';
import { itemKeyName } from '../display-names/item-key-name';
import type { ItemKey } from '../item-ids';

const isDemandableItem = (item: ItemKey): boolean => {
  const name = itemKeyName(item);
  if (UNHELD_ITEMS.has(item) || FAMILY_TIER_ITEMS.has(item)) return false;
  if (prizeReceiveIdOfName(name) !== undefined) return true;
  if (progressiveReceiveIdOfName(name) !== undefined) return true;
  return HOLDABLE_RECORD_NAMES.has(name);
};

export { isDemandableItem };
