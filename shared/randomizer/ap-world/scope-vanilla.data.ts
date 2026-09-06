/* @layer shared-game @kind data */
/**
 * The two app-scope location sets covering every AP location that is neither
 * a native chest-table chest nor a key drop, split by nature:
 *
 * - NPC_SCOPE_LOCATIONS (`include_npc_checks`): scripted givers and event-ish
 *   spots — NPC gifts, boss heart containers, the fairy ponds, and the
 *   handful of chest-table slots the app has no physical check record for.
 * - WORLD_ITEM_SCOPE_LOCATIONS (`include_world_items`): standing in-world
 *   items — the overworld prize ledges/islands, dig and dash prizes, the
 *   tablets, the pedestal, and the in-dungeon standing keys.
 *
 * With its toggle OFF, a set's locations are pre-placed LOCKED with the
 * vanilla item listed here and excluded from fill — the exact mechanism the
 * key-drop option uses for its drop locations.
 *
 * Values are POOL item names (the fill removes each one from the item pool),
 * so the vanilla contents are translated into the baseline pool's terms:
 * - progressive gear stands in for its concrete vanilla tier (the four
 *   Progressive Swords cover the uncle/smithy/pedestal/upgrade-fairy tiers;
 *   Progressive Shield covers the upgrade fairy's shield; Progressive Bow
 *   covers her arrow upgrade);
 * - boss locations carry Boss Heart Container (the pool's name for them);
 * - the three in-dungeon standing keys name their per-dungeon key, removed
 *   from that dungeon's restricted set, not the global pool;
 * - bottle gifts are the plain Bottle (contents are cosmetic; the pool's
 *   rolled bottle variants substitute one-for-one);
 * - vanilla holds two Red Boomerangs (the village hut chest, read from the
 *   native chest table, and the waterfall upgrade) but the pool holds one of
 *   each colour, so the waterfall's left slot takes the pool's Blue.
 *
 * Every row is backed by a certified check record (see the certification
 * ledger); the capability probe keeps the two tables and the record dataset
 * honest against each other at session start.
 */

const NPC_SCOPE_LOCATIONS: ReadonlyMap<string, string> = new Map([
  ['Blacksmith', 'Progressive Sword'],
  ['Bottle Merchant', 'Bottle'],
  ['Brewery', 'Red Boomerang'],
  ['C-Shaped House', 'Rupees (300)'],
  ['Catfish', 'Quake'],
  ['Chest Game', 'Piece of Heart'],
  ['Desert Palace - Boss', 'Boss Heart Container'],
  ['Eastern Palace - Boss', 'Boss Heart Container'],
  ['Hobo', 'Bottle'],
  ['Hype Cave - Generous Guy', 'Rupees (300)'],
  ['Ice Palace - Boss', 'Boss Heart Container'],
  ['King Zora', 'Flippers'],
  ['Link\'s Uncle', 'Progressive Sword'],
  ['Magic Bat', 'Magic Upgrade (1/2)'],
  ['Mini Moldorm Cave - Generous Guy', 'Rupees (300)'],
  ['Misery Mire - Boss', 'Boss Heart Container'],
  ['Old Man', 'Magic Mirror'],
  ['Palace of Darkness - Boss', 'Boss Heart Container'],
  // ROM census: the cave under the hammer pegs holds a standing Piece of
  // Heart in vanilla (room 0x127 sprite 0xEB), completing the 24-piece count.
  ['Peg Cave', 'Piece of Heart'],
  ['Potion Shop', 'Magic Powder'],
  ['Purple Chest', 'Bottle'],
  ['Pyramid Fairy - Left', 'Progressive Sword'],
  ['Pyramid Fairy - Right', 'Progressive Bow'],
  ['Sahasrahla', 'Pegasus Boots'],
  ['Sick Kid', 'Bug Catching Net'],
  ['Skull Woods - Boss', 'Boss Heart Container'],
  ['Stumpy', 'Shovel'],
  ['Swamp Palace - Boss', 'Boss Heart Container'],
  ['Thieves\' Town - Boss', 'Boss Heart Container'],
  ['Tower of Hera - Boss', 'Boss Heart Container'],
  ['Turtle Rock - Boss', 'Boss Heart Container'],
  ['Waterfall Fairy - Left', 'Blue Boomerang'],
  ['Waterfall Fairy - Right', 'Progressive Shield'],
]);

const WORLD_ITEM_SCOPE_LOCATIONS: ReadonlyMap<string, string> = new Map([
  ['Bombos Tablet', 'Bombos'],
  ['Bonk Rock Cave', 'Piece of Heart'],
  ['Bumper Cave Ledge', 'Piece of Heart'],
  ['Cave 45', 'Piece of Heart'],
  ['Checkerboard Cave', 'Piece of Heart'],
  ['Desert Ledge', 'Piece of Heart'],
  ['Desert Palace - Torch', 'Small Key (Desert Palace)'],
  ['Digging Game', 'Piece of Heart'],
  ['Ether Tablet', 'Ether'],
  ['Floating Island', 'Piece of Heart'],
  ['Flute Spot', 'Flute'],
  ['Ganons Tower - Bob\'s Torch', 'Small Key (Ganons Tower)'],
  ['Graveyard Cave', 'Piece of Heart'],
  ['Lake Hylia Island', 'Piece of Heart'],
  ['Library', 'Book of Mudora'],
  ['Lost Woods Hideout', 'Piece of Heart'],
  ['Lumberjack Tree', 'Piece of Heart'],
  ['Master Sword Pedestal', 'Progressive Sword'],
  ['Maze Race', 'Piece of Heart'],
  ['Mushroom', 'Mushroom'],
  ['Pyramid', 'Piece of Heart'],
  ['Spectacle Rock', 'Piece of Heart'],
  ['Spectacle Rock Cave', 'Piece of Heart'],
  ['Sunken Treasure', 'Piece of Heart'],
  ['Tower of Hera - Basement Cage', 'Small Key (Tower of Hera)'],
  ['Zora\'s Ledge', 'Piece of Heart'],
]);

export { NPC_SCOPE_LOCATIONS, WORLD_ITEM_SCOPE_LOCATIONS };
