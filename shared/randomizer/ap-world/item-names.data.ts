/* @layer shared-game @kind data */
/**
 * Item names the ported logic helpers reference, keyed neutrally so the
 * logic files never spell a game name. Ported from
 * tests/fixtures/ap-source/Items.py (item_table, item_name_groups,
 * progression_mapping) and the names StateHelpers.py checks with state.has.
 */

const ITEM = {
  moonPearl: 'Moon Pearl',
  powerGlove: 'Power Glove',
  titansMitts: 'Titans Mitts',
  fighterSword: 'Fighter Sword',
  masterSword: 'Master Sword',
  temperedSword: 'Tempered Sword',
  goldenSword: 'Golden Sword',
  hammer: 'Hammer',
  fireRod: 'Fire Rod',
  iceRod: 'Ice Rod',
  lamp: 'Lamp',
  bombos: 'Bombos',
  quake: 'Quake',
  bow: 'Bow',
  silverBow: 'Silver Bow',
  hookshot: 'Hookshot',
  caneOfSomaria: 'Cane of Somaria',
  caneOfByrna: 'Cane of Byrna',
  blueBoomerang: 'Blue Boomerang',
  redBoomerang: 'Red Boomerang',
  pegasusBoots: 'Pegasus Boots',
  bugCatchingNet: 'Bug Catching Net',
  bookOfMudora: 'Book of Mudora',
  magicUpgradeHalf: 'Magic Upgrade (1/2)',
  magicUpgradeQuarter: 'Magic Upgrade (1/4)',
  bossHeartContainer: 'Boss Heart Container',
  sanctuaryHeartContainer: 'Sanctuary Heart Container',
  pieceOfHeart: 'Piece of Heart',
  bombUpgradePlus5: 'Bomb Upgrade (+5)',
  bombUpgradePlus10: 'Bomb Upgrade (+10)',
  bombUpgrade50: 'Bomb Upgrade (50)',
  arrowUpgradePlus5: 'Arrow Upgrade (+5)',
  arrowUpgradePlus10: 'Arrow Upgrade (+10)',
  arrowUpgrade70: 'Arrow Upgrade (70)',
  capacityUpgradeShop: 'Capacity Upgrade Shop',
  triforcePiece: 'Triforce Piece',
  powerStar: 'Power Star',
  progressiveBow: 'Progressive Bow',
} as const;

/** python item_name_groups["Bottles"] — every item name containing "Bottle". */
const BOTTLE_ITEMS: readonly string[] = [
  'Bottle',
  'Bottle (Red Potion)',
  'Bottle (Green Potion)',
  'Bottle (Blue Potion)',
  'Bottle (Fairy)',
  'Bottle (Bee)',
  'Bottle (Good Bee)',
];

/** python item_name_groups["Crystals"] — the seven prize crystals. */
const CRYSTAL_ITEMS: readonly string[] = [
  'Crystal 1',
  'Crystal 2',
  'Crystal 3',
  'Crystal 4',
  'Crystal 5',
  'Crystal 6',
  'Crystal 7',
];

/** python item_name_groups["Medallions"] — valid entrance medallions. */
const MEDALLION_ITEMS = ['Ether', 'Bombos', 'Quake'] as const;
type MedallionName = (typeof MEDALLION_ITEMS)[number];

/** The vanilla game's fixed pair for the two gated entrances. */
const VANILLA_MEDALLIONS: { mire: MedallionName; turtleRock: MedallionName } = {
  mire: 'Ether',
  turtleRock: 'Quake',
};

/**
 * python Items.py progression_mapping, inverted: collecting the Nth copy of a
 * progressive base item also grants the Nth concrete tier. The alt bow rides
 * the same track as the main progressive bow (same tiers in the source map).
 */
const PROGRESSION_TIERS: ReadonlyMap<string, readonly string[]> = new Map([
  ['Progressive Sword', ['Fighter Sword', 'Master Sword', 'Tempered Sword', 'Golden Sword']],
  ['Progressive Glove', ['Power Glove', 'Titans Mitts']],
  ['Progressive Shield', ['Blue Shield', 'Red Shield', 'Mirror Shield']],
  ['Progressive Bow', ['Bow', 'Silver Bow']],
  ['Progressive Bow (Alt)', ['Bow', 'Silver Bow']],
]);

/** Region names the logic helpers must reference directly. */
const REGION_NAME = {
  start: 'Menu',
  coldBeeCave: 'Good Bee Cave',
  /**
   * The one vanilla shop selling unlimited green/blue potions (StateHelpers.py
   * can_buy_unlimited reaches it for the magic-extension branch).
   */
  potionSeller: 'Potion Shop',
} as const;

export {
  ITEM, BOTTLE_ITEMS, CRYSTAL_ITEMS, MEDALLION_ITEMS, PROGRESSION_TIERS, REGION_NAME,
  VANILLA_MEDALLIONS,
};
export type { MedallionName };
