/* @layer shared-game @kind data */
/**
 * Classification of the pool item names, transcribed from
 * tests/fixtures/ap-source/Items.py item_table (the ItemClassification
 * column): progression / useful / everything-else-is-filler. Only names the
 * pool can contain are listed. The explosives and projectiles upgrades are
 * progression in item_table (lines 113-121) — they only ever enter the pool
 * while their family is shuffled, so listing every jump size here is the
 * "progression when in pool" rule; the wallet items are this app's own and
 * stay filler. Note ItemPool.py 496-509 promotes ONE Boss Heart Container
 * to progression at generation time (the hearts-as-requirement branch); the
 * pool port keeps the static table classification and surfaces the
 * promotion as a documented count.
 */
import { EXPLOSIVES_UPGRADE_NAMES, PROJECTILES_UPGRADE_NAMES } from '@shared/game/data/capacity-upgrade-names.data';
import { RETRO_QUIVER_ITEM } from '../retro/retro-bow.data';

const PROGRESSION_ITEMS: ReadonlySet<string> = new Set([
  // alwaysitems — every one is IC.progression in item_table
  'Bombos', 'Book of Mudora', 'Cane of Somaria', 'Ether', 'Fire Rod', 'Flippers', 'Flute', 'Hammer',
  'Hookshot', 'Ice Rod', 'Lamp', 'Cape', 'Magic Powder', 'Mushroom', 'Pegasus Boots', 'Quake',
  'Shovel', 'Bug Catching Net', 'Cane of Byrna', 'Blue Boomerang', 'Red Boomerang',
  // progressives + world-crossing gear
  'Progressive Glove', 'Progressive Sword', 'Progressive Bow', 'Progressive Shield',
  // The same rungs as themselves, which is what a random-order family puts in
  // the pool instead of its progressive copies (progressive/). Every one is
  // IC.progression in item_table exactly as its progressive spelling is.
  'Fighter Sword', 'Master Sword', 'Tempered Sword', 'Golden Sword',
  'Power Glove', 'Titans Mitts', 'Blue Shield', 'Red Shield', 'Mirror Shield',
  'Bow', 'Silver Bow',
  'Magic Mirror', 'Moon Pearl', 'Magic Upgrade (1/2)', 'Magic Upgrade (1/4)',
  // bottles (all names in item_name_groups Bottles are progression)
  'Bottle', 'Bottle (Red Potion)', 'Bottle (Green Potion)', 'Bottle (Blue Potion)',
  'Bottle (Fairy)', 'Bottle (Bee)', 'Bottle (Good Bee)',
  // capacity upgrades of the counted families, every jump size
  ...EXPLOSIVES_UPGRADE_NAMES, ...PROJECTILES_UPGRADE_NAMES,
  // The retro bow's quiver, on the same "progression when in pool" terms as
  // those upgrades: it only ever enters the pool while retro is on and the
  // shops are shuffled (retro/retro-pool.ts), and while it is there it is what
  // every arrow rule in the seed waits on. The reference has no row for it
  // because it never places one, locking its own copy onto a shelf instead.
  RETRO_QUIVER_ITEM,
]);

const USEFUL_ITEMS: ReadonlySet<string> = new Set([
  'Sanctuary Heart Container',
  'Boss Heart Container',
  'Piece of Heart',
  'Progressive Mail',
  // The armour rungs as themselves — useful in item_table, like the copies they replace.
  'Blue Mail', 'Red Mail',
]);

export { PROGRESSION_ITEMS, USEFUL_ITEMS };
