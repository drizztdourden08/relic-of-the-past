/* @layer shared-game @kind constants */
import { ITEM } from '../item-ids.data';
import type { ItemId } from '@shared/game/data/types/ids';

const ALWAYS_ITEMS: readonly ItemId[] = [
  ITEM.bombos, ITEM.bookOfMudora, ITEM.caneOfSomaria, ITEM.ether, ITEM.fireRod, ITEM.flippers, ITEM.progressiveOcarina, ITEM.hammer,
  ITEM.hookshot, ITEM.iceRod, ITEM.lamp,
  ITEM.cape, ITEM.magicPowder, ITEM.mushroom, ITEM.pegasusBoots, ITEM.quake, ITEM.shovel, ITEM.bugCatchingNet,
  ITEM.caneOfByrna, ITEM.blueBoomerang, ITEM.redBoomerang,
];

const GLOVE_ITEMS: readonly ItemId[] = [ITEM.progressiveGlove, ITEM.progressiveGlove];

const LEGACY_INSANITY_ITEMS: readonly ItemId[] = [ITEM.magicMirror, ITEM.moonPearl];

const BASE_ITEMS: readonly ItemId[] = [
  ITEM.singleArrow, ITEM.sanctuaryHeartContainer, ITEM.arrows10, ITEM.bombs10,
  ...Array<ItemId>(3).fill(ITEM.rupees300),
  ...Array<ItemId>(10).fill(ITEM.bossHeartContainer),
  ...Array<ItemId>(24).fill(ITEM.pieceOfHeart),
];

const BOTTLE_COUNT = 4;

const SHIELD_ITEMS: readonly ItemId[] = Array<ItemId>(3).fill(ITEM.progressiveShield);
const ARMOR_ITEMS: readonly ItemId[] = Array<ItemId>(2).fill(ITEM.progressiveMail);
const MAGIC_ITEMS: readonly ItemId[] = [ITEM.magicUpgradeHalf, ITEM.rupees300];
const BOW_ITEMS: readonly ItemId[] = Array<ItemId>(2).fill(ITEM.progressiveBow);

const SWORD_ITEMS: readonly ItemId[] = Array<ItemId>(4).fill(ITEM.progressiveSword);

const NORMAL_FIRST_15_EXTRA: readonly ItemId[] = [
  ITEM.rupees100, ITEM.rupees300, ITEM.rupees50,
  ...Array<ItemId>(6).fill(ITEM.arrows10),
  ...Array<ItemId>(6).fill(ITEM.bombs3),
];

const NORMAL_SECOND_15_EXTRA: readonly ItemId[] = [
  ...Array<ItemId>(10).fill(ITEM.bombs3),
  ...Array<ItemId>(2).fill(ITEM.rupees50),
  ...Array<ItemId>(2).fill(ITEM.arrows10),
  ITEM.rupee1,
];

const NORMAL_THIRD_10_EXTRA: readonly ItemId[] = [
  ...Array<ItemId>(4).fill(ITEM.rupees50),
  ...Array<ItemId>(3).fill(ITEM.rupees20),
  ITEM.arrows10, ITEM.rupee1, ITEM.rupees5,
];

const NORMAL_FOURTH_5_EXTRA: readonly ItemId[] = [
  ...Array<ItemId>(2).fill(ITEM.arrows10),
  ...Array<ItemId>(2).fill(ITEM.rupees20),
  ITEM.rupees5,
];

const NORMAL_FINAL_25_EXTRA: readonly ItemId[] = [
  ...Array<ItemId>(23).fill(ITEM.rupees20),
  ...Array<ItemId>(2).fill(ITEM.rupees5),
];

const EXTRA_ITEMS: readonly ItemId[] = [
  ...NORMAL_FIRST_15_EXTRA,
  ...NORMAL_SECOND_15_EXTRA,
  ...NORMAL_THIRD_10_EXTRA,
  ...NORMAL_FOURTH_5_EXTRA,
  ...NORMAL_FINAL_25_EXTRA,
];

const TOTAL_ITEMS_TO_PLACE = 153;

export {
  ALWAYS_ITEMS,
  GLOVE_ITEMS,
  LEGACY_INSANITY_ITEMS,
  BASE_ITEMS,
  BOTTLE_COUNT,
  SHIELD_ITEMS,
  ARMOR_ITEMS,
  MAGIC_ITEMS,
  BOW_ITEMS,
  SWORD_ITEMS,
  EXTRA_ITEMS,
  TOTAL_ITEMS_TO_PLACE,
};
