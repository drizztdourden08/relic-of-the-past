/* @layer shared-game @kind logic */
/**
 * THE rule for which pool items an item demand may name, asked in one place.
 *
 * An item is demandable when the core can test the player HOLDING it by its
 * resolved receive id, and that id means this item and no other:
 *
 *   - a dungeon prize (pendant or crystal), tested by its own bit;
 *   - a progressive family's pool item, tested as tier 1 or more;
 *   - an item record of a holdable category, outside any dungeon, with a
 *     receive id the native tables hold, tested by its inventory slot.
 *
 * A family tier name and the items the player can still lose are out before
 * any of that is asked. The reasons for every exclusion live beside the data
 * (pond-demand-eligibility.data.ts).
 */
import { ALL_ITEMS } from '@shared/game/data/items';
import { asNativeReceiveId } from '@shared/game/data/native-receive-id';
import { prizeReceiveIdOfName } from '@shared/game/data/prize-receive-id';
import { progressiveReceiveIdOfName } from '@shared/game/data/progressive-receive-id';
import { PROGRESSIVE_FAMILIES } from '../progressive/progressive-families.data';
import { HOLDABLE_CATEGORIES, UNHELD_ITEMS } from './pond-demand-eligibility.data';
import type { ItemRecord } from '@shared/game/data/types';

/** Every concrete rung of a tiered family: the inventory cannot tell one from a higher one. */
const FAMILY_TIER_NAMES: ReadonlySet<string> = new Set(PROGRESSIVE_FAMILIES.flatMap((family) => family.tiers));

const isHoldableRecord = (record: ItemRecord): boolean =>
  HOLDABLE_CATEGORIES.has(record.category)
  && record.dungeonId === undefined
  && asNativeReceiveId(record.gameId?.receiveItemId) !== undefined;

/** Names with at least one holdable record. A name can carry several records, so any one counts. */
const HOLDABLE_RECORD_NAMES: ReadonlySet<string> = new Set(
  ALL_ITEMS.filter(isHoldableRecord).map((record) => record.randomizerName),
);

const isDemandableItem = (name: string): boolean => {
  if (UNHELD_ITEMS.has(name) || FAMILY_TIER_NAMES.has(name)) return false;
  if (prizeReceiveIdOfName(name) !== undefined) return true;
  if (progressiveReceiveIdOfName(name) !== undefined) return true;
  return HOLDABLE_RECORD_NAMES.has(name);
};

export { isDemandableItem };
