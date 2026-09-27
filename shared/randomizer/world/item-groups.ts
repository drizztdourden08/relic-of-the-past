/* @layer shared-game @kind logic */
/**
 * The item sets a rule counts against, read off the item-group records.
 *
 * The engine used to carry its own list of bottle, crystal and medallion NAMES, which is a
 * second copy of a group the dataset already holds (`shared/game/data/item-groups/`). Each
 * one is now the record group's own member ids, so adding a bottle to the dataset adds it to
 * the logic with nothing to keep in step.
 */
import { ITEM_GROUP_IDS, membersOf } from '@shared/game/data';
import { ITEM } from './item-ids.data';
import type { ItemId } from '@shared/game/data/types/ids';

/** Every bottle, whatever it holds: the group a bottle count reads. */
const BOTTLE_ITEMS: readonly ItemId[] = membersOf(ITEM_GROUP_IDS.Bottles);

/** The seven prize crystals. */
const CRYSTAL_ITEMS: readonly ItemId[] = membersOf(ITEM_GROUP_IDS.Crystals);

/** The three medallions, which is also the set a gated entrance may ask for. */
const MEDALLION_ITEMS: readonly ItemId[] = membersOf(ITEM_GROUP_IDS.Medallions);

/** One of the three, as a gated entrance's requirement. */
type MedallionId = typeof ITEM.bombos | typeof ITEM.ether | typeof ITEM.quake;

/** The unmodified game's fixed pair for the two gated entrances. */
const VANILLA_MEDALLIONS: { mire: MedallionId; turtleRock: MedallionId } = {
  mire: ITEM.ether,
  turtleRock: ITEM.quake,
};

export { BOTTLE_ITEMS, CRYSTAL_ITEMS, MEDALLION_ITEMS, VANILLA_MEDALLIONS };
export type { MedallionId };
