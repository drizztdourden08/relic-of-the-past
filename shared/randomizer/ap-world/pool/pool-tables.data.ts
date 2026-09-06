/* @layer shared-game @kind data */
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
const ALWAYS_ITEMS: readonly string[] = [
  'Bombos', 'Book of Mudora', 'Cane of Somaria', 'Ether', 'Fire Rod', 'Flippers', 'Flute', 'Hammer',
  'Hookshot', 'Ice Rod', 'Lamp',
  'Cape', 'Magic Powder', 'Mushroom', 'Pegasus Boots', 'Quake', 'Shovel', 'Bug Catching Net',
  'Cane of Byrna', 'Blue Boomerang', 'Red Boomerang',
];

/** ItemPool.py 29: progressive on. */
const GLOVE_ITEMS: readonly string[] = ['Progressive Glove', 'Progressive Glove'];

/** ItemPool.py 31: entrance shuffle is not insanity_legacy, so both pool. */
const LEGACY_INSANITY_ITEMS: readonly string[] = ['Magic Mirror', 'Moon Pearl'];

/** ItemPool.py 46-47 (normalbaseitems). */
const BASE_ITEMS: readonly string[] = [
  'Single Arrow', 'Sanctuary Heart Container', 'Arrows (10)', 'Bombs (10)',
  ...Array<string>(3).fill('Rupees (300)'),
  ...Array<string>(10).fill('Boss Heart Container'),
  ...Array<string>(24).fill('Piece of Heart'),
];

/**
 * ItemPool.py 646-651: four bottles, contents drawn per bottle from
 * normalbottles at random. Logic treats every bottle name identically
 * (Items.py item_name_groups "Bottles"), so the port pins the plain bottle
 * unless a picker is injected.
 */
const BOTTLE_COUNT = 4;

/** ItemPool.py 104, 107, 109, 113: progressive on rows. */
const SHIELD_ITEMS: readonly string[] = Array<string>(3).fill('Progressive Shield');
const ARMOR_ITEMS: readonly string[] = Array<string>(2).fill('Progressive Mail');
const MAGIC_ITEMS: readonly string[] = ['Magic Upgrade (1/2)', 'Rupees (300)'];
const BOW_ITEMS: readonly string[] = Array<string>(2).fill('Progressive Bow');

/** ItemPool.py 111: progressive on, swordless off. */
const SWORD_ITEMS: readonly string[] = Array<string>(4).fill('Progressive Sword');

/** ItemPool.py 48-52: the five normal-difficulty extras blocks, in order. */
const EXTRA_ITEMS: readonly string[] = [
  // normalfirst15extra
  'Rupees (100)', 'Rupees (300)', 'Rupees (50)',
  ...Array<string>(6).fill('Arrows (10)'),
  ...Array<string>(6).fill('Bombs (3)'),
  // normalsecond15extra
  ...Array<string>(10).fill('Bombs (3)'),
  ...Array<string>(2).fill('Rupees (50)'),
  ...Array<string>(2).fill('Arrows (10)'),
  'Rupee (1)',
  // normalthird10extra
  ...Array<string>(4).fill('Rupees (50)'),
  ...Array<string>(3).fill('Rupees (20)'),
  'Arrows (10)', 'Rupee (1)', 'Rupees (5)',
  // normalfourth5extra
  ...Array<string>(2).fill('Arrows (10)'),
  ...Array<string>(2).fill('Rupees (20)'),
  'Rupees (5)',
  // normalfinal25extra
  ...Array<string>(23).fill('Rupees (20)'),
  ...Array<string>(2).fill('Rupees (5)'),
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
