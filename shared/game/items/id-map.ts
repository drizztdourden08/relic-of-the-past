/* @layer shared-game @kind data */
/**
 * Zelda3 receive-item index → tracker item name mapping.
 *
 * These indices come from Link_ReceiveItem(item, chest_position) in player.c.
 * The mapping is derived from kMemoryLocationToGiveItemTo / kValueToGiveItemTo
 * in misc.c, cross-referenced with the SRAM variable definitions in variables.h.
 *
 *  idx  SRAM addr   C variable                   Tracker name
 * ───────────────────────────────────────────────────────────────
 */

const ITEM_ID_TO_NAME: Record<number, string> = {
  // Swords (0xF359 = link_sword_type, values 1–4)
  // Item 0x00 is the uncle's combined grant: LinkGiveItem special-cases j==0 to
  // ALSO write link_shield_type (misc.c:723) before the sword — one item, both.
  0x00: 'Fighter Sword & Shield',
  0x01: 'Master Sword',
  0x02: 'Tempered Sword',
  0x03: 'Golden Sword',

  // Shields (0xF35A = link_shield_type, values 1–3)
  0x04: 'Fighters Shield',
  0x05: 'Fire Shield',
  0x06: 'Mirror Shield',

  // Weapons & tools
  0x07: 'Fire Rod',          // 0xF345
  0x08: 'Ice Rod',           // 0xF346
  0x09: 'Hammer',            // 0xF34B
  0x0a: 'Hookshot',          // 0xF342
  0x0b: 'Bow',               // 0xF340
  0x0c: 'Blue Boomerang',    // 0xF341, val=1
  0x0d: 'Magic Powder',      // 0xF344, val=2

  // Medallions
  0x0f: 'Bombos',            // 0xF347
  0x10: 'Ether',             // 0xF348
  0x11: 'Quake',             // 0xF349

  // Lamp / Shovel / Flute
  0x12: 'Lamp',              // 0xF34A = link_item_torch
  0x13: 'Shovel',            // 0xF34C = link_item_flute, val=1
  0x14: 'Flute',             // 0xF34C = link_item_flute, val=2

  // Canes, Cape, Mirror, Gloves, etc.
  0x15: 'Cane of Somaria',   // 0xF350
  0x17: 'Heart Piece',       // 0xF36B
  0x18: 'Cane of Byrna',     // 0xF351
  0x19: 'Cape',              // 0xF352
  0x1a: 'Magic Mirror',      // 0xF353
  0x1b: 'Power Glove',       // 0xF354, val=1
  0x1c: 'Titans Mitts',      // 0xF354, val=2
  0x1d: 'Book of Mudora',    // 0xF34E
  0x1e: 'Flippers',          // 0xF356
  0x1f: 'Moon Pearl',        // 0xF357

  // Crystals, Net, Armor
  0x20: 'Crystal',           // 0xF37A — bitmask handled specially
  0x21: 'Bug Catching Net',  // 0xF34D
  0x22: 'Blue Mail',         // 0xF35B
  0x23: 'Red Mail',          // 0xF35B, val=2

  // Keys, Compass, Heart Container, Bombs
  0x24: 'Small Key',         // 0xF36F
  0x25: 'Compass',           // 0xF364
  0x26: 'Heart Container',   // 0xF36C
  0x27: 'Bomb',              // 0xF375 — single bomb
  0x28: '3 Bombs',           // 0xF375

  // Mushroom / Red Boomerang
  0x29: 'Mushroom',          // 0xF344, val=2 (different from 0x0d)
  0x2a: 'Red Boomerang',     // 0xF341

  // Dungeon items — Big Key & Map
  0x32: 'Big Key',            // 0xF366 — bitmask per dungeon
  0x33: 'Map',                // 0xF368 — bitmask per dungeon

  // Consumables — Rupees
  0x34: '1 Rupee',            // 0xF360
  0x35: '5 Rupees',           // 0xF360
  0x36: '20 Rupees',          // 0xF360

  // Pendants
  0x37: 'Green Pendant',     // 0xF374, bit 0x04
  0x38: 'Red Pendant',       // 0xF374, bit 0x01
  0x39: 'Blue Pendant',      // 0xF374, bit 0x02

  // Silver Bow upgrade
  0x3a: 'Silver Bow',        // 0xF340, val=1 (bow)
  0x3b: 'Silver Bow',        // 0xF340, val=3 (silver arrows)

  // Heart Container (No Animation variants)
  0x3e: 'Heart Container',   // 0xF36C
  0x3f: 'Heart Container',   // 0xF36C (variant)

  // Consumables — more Rupees
  0x40: '100 Rupees',         // 0xF360
  0x41: '50 Rupees',          // 0xF360

  // Consumables — refills
  0x42: 'Heart Refill',       // 0xF372
  0x43: 'Arrow',              // 0xF376
  0x44: '10 Arrows',          // 0xF376
  0x45: 'Small Magic Refill', // 0xF373
  0x46: '300 Rupees',         // 0xF360
  0x47: '20 Rupees',          // 0xF360 (alt)

  // Bottles
  0x0e: 'Bottle (Bee)',       // 0xF35C (alt index)
  0x16: 'Bottle',            // empty bottle
  0x2b: 'Bottle (Red Potion)',
  0x2c: 'Bottle (Green Potion)',
  0x2d: 'Bottle (Blue Potion)',
  0x2e: 'Bottle (Fairy)',
  0x2f: 'Bottle (Bee)',
  0x30: 'Bottle (Good Bee)',
  0x3c: 'Bottle (Bee)',       // alt
  0x3d: 'Bottle (Fairy)',     // alt
  0x48: 'Bottle (Good Bee)',  // alt

  // Bombs (consumable)
  0x31: '10 Bombs',           // 0xF375

  // Equipment variants
  0x49: 'Fighter Sword',     // 0xF359, variant
  0x4a: 'Flute',             // 0xF34C, activated

  // Pegasus Boots
  0x4b: 'Pegasus Boots',     // 0xF355
};

export { ITEM_ID_TO_NAME };
