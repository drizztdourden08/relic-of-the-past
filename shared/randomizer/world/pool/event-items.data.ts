/* @layer shared-game @kind data */
/**
 * Event location to event item, ported from Archipelago worlds/alttp/
 * ItemPool.py generate_itempool (event_pairs, lines 264-278) plus the goal
 * item pushed onto the final fight's location (lines 249-250). The prize
 * pool is the ten crystal and pendant items placed on the ten dungeon prize
 * locations (the reference's pre_fill in worlds/alttp/__init__.py, not part of
 * the fixture set; transcribed from Items.py item_table's Crystal rows).
 *
 * Both sides are ids, and every location is a story event record of the ledger
 * (records/checks/events/story.ts), never an item check: none of these moments grants an item
 * the player picks up. The one row carrying neither is the capacity shop's own event, which no
 * record answers for yet (location-key.ts, item-ids.data.ts).
 */
import { ITEM, UNRECORDED } from '../item-ids.data';
import { CAPACITY_SHOP_EVENT } from '../location-key';
import type { ItemId } from '@shared/game/data/types/ids';
import type { ItemKey } from '../item-ids.data';
import type { LocationKey } from '../location-key';

const VICTORY_ITEM: ItemId = ITEM.triforce;

const EVENT_ITEMS: ReadonlyMap<LocationKey, ItemKey> = new Map<LocationKey, ItemKey>([
  ['check-351', VICTORY_ITEM],                  // Ganon beaten
  ['check-329', ITEM.beatAgahnim1],             // Agahnim 1 beaten
  ['check-349', ITEM.beatAgahnim2],             // Agahnim 2 beaten
  ['check-337', ITEM.pickUpPurpleChest],        // Purple Chest found
  ['check-335', ITEM.getFrog],                  // Frog found
  ['check-336', ITEM.returnSmith],              // Smiths reunited
  ['check-025', ITEM.openFloodgate],            // Floodgate
  ['check-011', ITEM.activatedFlute],           // Flute Activation Spot
  [CAPACITY_SHOP_EVENT, UNRECORDED.capacityShopEvent],
]);

const PRIZE_ITEMS: readonly ItemId[] = [
  ITEM.greenPendant,
  ITEM.bluePendant,
  ITEM.redPendant,
  ITEM.crystal1,
  ITEM.crystal2,
  ITEM.crystal3,
  ITEM.crystal4,
  ITEM.crystal5,
  ITEM.crystal6,
  ITEM.crystal7,
];

export { VICTORY_ITEM, EVENT_ITEMS, PRIZE_ITEMS };
