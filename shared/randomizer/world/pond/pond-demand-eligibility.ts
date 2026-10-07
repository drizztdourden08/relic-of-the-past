/* @layer shared-game @kind logic */
/**
 * THE rule for which pool items an item demand may name, asked in one place.
 *
 * An item is demandable when the core can test the player HOLDING it by its
 * resolved receive id, and that id means this item and no other:
 *
 *   - a pendant, tested by its own bit through its own record;
 *   - a progressive family's pool item, tested as tier 1 or more;
 *   - an item record of a holdable category, outside any dungeon, with a
 *     receive id the native tables hold, tested by its inventory slot.
 *
 * A family tier name and the items the player can still lose are out before
 * any of that is asked. The reasons for every exclusion live beside the data
 * (pond-demand-eligibility.data.ts).
 */
import { all } from '@shared/game/data';
import { asNativeReceiveId } from '@shared/game/data/native-receive-id';
import { prizeReceiveIdOfName } from '@shared/game/data/prize-receive-id';
import { progressiveReceiveIdOfName } from '@shared/game/data/progressive-receive-id';
import { PROGRESSIVE_FAMILIES } from '../progressive/progressive-families.data';
import { HOLDABLE_CATEGORIES, UNHELD_ITEMS } from './pond-demand-eligibility.data';
import { itemKeyName } from '../display-names/item-key-name';
import type { ItemRecord } from '@shared/game/data/types';
import type { ItemKey } from '../item-ids.data';

/** Every concrete rung of a tiered family: the inventory cannot tell one from a higher one. */
const FAMILY_TIER_ITEMS: ReadonlySet<ItemKey> = new Set<ItemKey>(
  PROGRESSIVE_FAMILIES.flatMap((family) => family.tiers),
);

const isHoldableRecord = (record: ItemRecord): boolean =>
  HOLDABLE_CATEGORIES.has(record.category)
  && record.dungeonId === undefined
  && asNativeReceiveId(record.gameId?.receiveItemId) !== undefined;

/** Names with at least one holdable record. A name can carry several records, so any one counts. */
const HOLDABLE_RECORD_NAMES: ReadonlySet<string> = new Set(
  all('item').filter(isHoldableRecord).map((record) => record.name),
);

const isDemandableItem = (item: ItemKey): boolean => {
  const name = itemKeyName(item);
  if (UNHELD_ITEMS.has(item) || FAMILY_TIER_ITEMS.has(item)) return false;
  if (prizeReceiveIdOfName(name) !== undefined) return true;
  if (progressiveReceiveIdOfName(name) !== undefined) return true;
  return HOLDABLE_RECORD_NAMES.has(name);
};

export { isDemandableItem };
