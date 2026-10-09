/* @layer tests @kind constants */
const REGION_COUNT = 239;
const SEED_LOCATIONS = 261;
const WORLD_LOCATIONS = 255;
const WORLD_LOCATIONS_NO_KEY_DROPS = 222;
const WORLD_EVENTS = 8;

const DUNGEON_LOCATIONS: readonly number[] = [9, 9, 10, 7, 4, 15, 11, 11, 16, 13, 12, 15, 31];

const BUNNY_IMPASSABLE: readonly string[] = [
  'Bumper Cave', 'Two Brothers House', 'Hookshot Cave', 'Skull Woods First Section (Right)',
  'Skull Woods First Section (Left)', 'Skull Woods First Section (Top)', 'Turtle Rock (Entrance)',
  'Turtle Rock (Second Section)', 'Turtle Rock (Big Chest)', 'Skull Woods Second Section (Drop)',
  'Turtle Rock (Eye Bridge)', 'Sewers', 'Pyramid', 'Spiral Cave (Top)',
  'Desert Palace Main (Inner)', 'Fairy Ascension Cave (Drop)',
  'Light World Death Mountain Shop',
];

const PASSAGES_WITH_A_CROSSING = 205;
const CROSSINGS_NO_PASSAGE_MAKES = 439;
const PLACELESS_ROWS_AT_MOST = 23;
const SCREENLESS_REGIONS_AT_MOST = 16;

export {
  BUNNY_IMPASSABLE, CROSSINGS_NO_PASSAGE_MAKES, DUNGEON_LOCATIONS, PASSAGES_WITH_A_CROSSING,
  PLACELESS_ROWS_AT_MOST, REGION_COUNT, SCREENLESS_REGIONS_AT_MOST, SEED_LOCATIONS, WORLD_EVENTS,
  WORLD_LOCATIONS, WORLD_LOCATIONS_NO_KEY_DROPS,
};
