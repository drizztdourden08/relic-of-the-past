/* @layer shared-game @kind data */

import { ITEM } from '../item-ids.data';
import type { ItemId } from '@shared/game/data/types/ids';

/**
 * Item-pool composition rows for the baseline seed, ported from
 * Archipelago worlds/alttp/ItemPool.py, normal difficulty only
 * (difficulties['normal'], lines 99-130) with the fixed baseline choices:
 * mode standard, goal ganon, no timer, retro off, swordless off, progressive ON
 * (the reference's want_progressives coin-flip pinned to true, per the
 * baseline spec), entrance shuffle vanilla. get_pool_core (lines 595-762)
 * then assembles: alwaysitems + gloves + legacyinsanity + baseitems +
 * bottles + shield/armor/magic/bow/sword rows + all five extras blocks
 * (extraitems = 153 - 83 = 70 consumes them exactly).
 */

/** ItemPool.py 25-28. */
const ALWAYS_ITEMS: readonly ItemId[] = [
  ITEM.bombos, ITEM.bookOfMudora, ITEM.caneOfSomaria, ITEM.ether, ITEM.fireRod, ITEM.flippers, ITEM.flute, ITEM.hammer,
  ITEM.hookshot, ITEM.iceRod, ITEM.lamp,
  ITEM.cape, ITEM.magicPowder, ITEM.mushroom, ITEM.pegasusBoots, ITEM.quake, ITEM.shovel, ITEM.bugCatchingNet,
  ITEM.caneOfByrna, ITEM.blueBoomerang, ITEM.redBoomerang,
];

/** ItemPool.py 29: progressive on. */
const GLOVE_ITEMS: readonly ItemId[] = [ITEM.progressiveGlove, ITEM.progressiveGlove];

/** ItemPool.py 31: entrance shuffle is not insanity_legacy, so both pool. */
const LEGACY_INSANITY_ITEMS: readonly ItemId[] = [ITEM.magicMirror, ITEM.moonPearl];

/** ItemPool.py 46-47 (normalbaseitems). */
const BASE_ITEMS: readonly ItemId[] = [
  ITEM.singleArrow, ITEM.sanctuaryHeartContainer, ITEM.arrows10, ITEM.bombs10,
  ...Array<ItemId>(3).fill(ITEM.rupees300),
  ...Array<ItemId>(10).fill(ITEM.bossHeartContainer),
  ...Array<ItemId>(24).fill(ITEM.pieceOfHeart),
];

/**
 * ItemPool.py 646-651: four bottles, contents drawn per bottle from
 * normalbottles at random. Logic treats every bottle name identically
 * (Items.py item_name_groups "Bottles"), so the port pins the plain bottle
 * unless a picker is injected.
 */
const BOTTLE_COUNT = 4;

/** ItemPool.py 104, 107, 109, 113: progressive on rows. */
const SHIELD_ITEMS: readonly ItemId[] = Array<ItemId>(3).fill(ITEM.progressiveShield);
const ARMOR_ITEMS: readonly ItemId[] = Array<ItemId>(2).fill(ITEM.progressiveMail);
const MAGIC_ITEMS: readonly ItemId[] = [ITEM.magicUpgradeHalf, ITEM.rupees300];
const BOW_ITEMS: readonly ItemId[] = Array<ItemId>(2).fill(ITEM.progressiveBow);

/** ItemPool.py 111: progressive on, swordless off. */
const SWORD_ITEMS: readonly ItemId[] = Array<ItemId>(4).fill(ITEM.progressiveSword);

/** ItemPool.py 48-52: the five normal-difficulty extras blocks, in order. */
const EXTRA_ITEMS: readonly ItemId[] = [
  // normalfirst15extra
  ITEM.rupees100, ITEM.rupees300, ITEM.rupees50,
  ...Array<ItemId>(6).fill(ITEM.arrows10),
  ...Array<ItemId>(6).fill(ITEM.bombs3),
  // normalsecond15extra
  ...Array<ItemId>(10).fill(ITEM.bombs3),
  ...Array<ItemId>(2).fill(ITEM.rupees50),
  ...Array<ItemId>(2).fill(ITEM.arrows10),
  ITEM.rupee1,
  // normalthird10extra
  ...Array<ItemId>(4).fill(ITEM.rupees50),
  ...Array<ItemId>(3).fill(ITEM.rupees20),
  ITEM.arrows10, ITEM.rupee1, ITEM.rupees5,
  // normalfourth5extra
  ...Array<ItemId>(2).fill(ITEM.arrows10),
  ...Array<ItemId>(2).fill(ITEM.rupees20),
  ITEM.rupees5,
  // normalfinal25extra
  ...Array<ItemId>(23).fill(ITEM.rupees20),
  ...Array<ItemId>(2).fill(ITEM.rupees5),
];

/** ItemPool.py 64: the fixed non-dungeon pool size. */
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
