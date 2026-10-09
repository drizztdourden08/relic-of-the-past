/* @layer shared-game @kind constants */
import { ITEM_GROUP_IDS, membersOf } from '@shared/game/data';
import { ITEM } from '../item-ids.data';
import type { ItemId } from '@shared/game/data/types/ids';
import type { MedallionId } from './item-groups.type';

const BOTTLE_ITEMS: readonly ItemId[] = membersOf(ITEM_GROUP_IDS.Bottles);

const CRYSTAL_ITEMS: readonly ItemId[] = membersOf(ITEM_GROUP_IDS.Crystals);

const MEDALLION_ITEMS: readonly ItemId[] = membersOf(ITEM_GROUP_IDS.Medallions);

const VANILLA_MEDALLIONS: { mire: MedallionId; turtleRock: MedallionId } = {
  mire: ITEM.ether,
  turtleRock: ITEM.quake,
};

export { BOTTLE_ITEMS, CRYSTAL_ITEMS, MEDALLION_ITEMS, VANILLA_MEDALLIONS };
