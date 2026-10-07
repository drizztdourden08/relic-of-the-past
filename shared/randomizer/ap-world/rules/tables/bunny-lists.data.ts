/* @layer shared-game @kind data */
/**
 * The transform-suppression lists, from Archipelago worlds/alttp/Rules.py
 * set_bunny_rules: the multi-entrance interiors the transformed state cannot
 * pass (1663-1666), the locations it can still pick up (1668-1673), and the
 * one specially handled shop region (1769-1771).
 */

const BUNNY_IMPASSABLE_REGIONS: readonly string[] = [
  'Bumper Cave',
  'Two Brothers House',
  'Hookshot Cave',
  'Skull Woods First Section (Right)',
  'Skull Woods First Section (Left)',
  'Skull Woods First Section (Top)',
  'Turtle Rock (Entrance)',
  'Turtle Rock (Second Section)',
  'Turtle Rock (Big Chest)',
  'Skull Woods Second Section (Drop)',
  'Turtle Rock (Eye Bridge)',
  'Sewers',
  'Pyramid',
  'Spiral Cave (Top)',
  'Desert Palace Main (Inner)',
  'Fairy Ascension Cave (Drop)',
];

const BUNNY_ACCESSIBLE_LOCATIONS: ReadonlySet<string> = new Set([
  'Link\'s Uncle',
  'Sahasrahla',
  'Sick Kid',
  'Lost Woods Hideout',
  'Lumberjack Tree',
  'Checkerboard Cave',
  'Potion Shop',
  'Spectacle Rock Cave',
  'Pyramid',
  'Hype Cave - Generous Guy',
  'Peg Cave',
  'Bumper Cave Ledge',
  'Dark Blacksmith Ruins',
  'Spectacle Rock',
  'Bombos Tablet',
  'Ether Tablet',
  'Purple Chest',
  'Blacksmith',
  'Missing Smith',
  'Master Sword Pedestal',
  'Bottle Merchant',
  'Sunken Treasure',
  'Desert Ledge',
]);

const BUNNY_SHOP_REGION = 'Light World Death Mountain Shop';

export { BUNNY_IMPASSABLE_REGIONS, BUNNY_ACCESSIBLE_LOCATIONS, BUNNY_SHOP_REGION };
