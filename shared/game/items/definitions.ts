/* @layer shared-game @kind data */
interface ItemDefinition {
  id: number;
  name: string;
  category: string;
}

const ITEMS: ItemDefinition[] = [
  // Weapons
  { id: 0x0b, name: 'Bow', category: 'weapon' },
  { id: 0x3b, name: 'Silver Bow', category: 'weapon' },
  { id: 0x58, name: 'Silver Arrows', category: 'weapon' },
  { id: 0x0c, name: 'Blue Boomerang', category: 'weapon' },
  { id: 0x2a, name: 'Red Boomerang', category: 'weapon' },
  { id: 0x07, name: 'Fire Rod', category: 'weapon' },
  { id: 0x08, name: 'Ice Rod', category: 'weapon' },
  { id: 0x09, name: 'Hammer', category: 'weapon' },
  { id: 0x15, name: 'Cane of Somaria', category: 'weapon' },
  { id: 0x49, name: 'Fighter Sword', category: 'weapon' },
  { id: 0x01, name: 'Master Sword', category: 'weapon' },
  { id: 0x02, name: 'Tempered Sword', category: 'weapon' },
  { id: 0x03, name: 'Golden Sword', category: 'weapon' },
  { id: 0x5e, name: 'Progressive Sword', category: 'weapon' },
  { id: 0x64, name: 'Progressive Bow', category: 'weapon' },

  // Equipment
  { id: 0x0a, name: 'Hookshot', category: 'equipment' },
  { id: 0x29, name: 'Mushroom', category: 'equipment' },
  { id: 0x0d, name: 'Magic Powder', category: 'equipment' },
  { id: 0x12, name: 'Lamp', category: 'equipment' },
  { id: 0x13, name: 'Shovel', category: 'equipment' },
  { id: 0x14, name: 'Flute', category: 'equipment' },
  { id: 0x21, name: 'Bug Catching Net', category: 'equipment' },
  { id: 0x1d, name: 'Book of Mudora', category: 'equipment' },
  { id: 0x18, name: 'Cane of Byrna', category: 'equipment' },
  { id: 0x19, name: 'Cape', category: 'equipment' },
  { id: 0x1a, name: 'Magic Mirror', category: 'equipment' },
  { id: 0x4b, name: 'Pegasus Boots', category: 'equipment' },
  { id: 0x1b, name: 'Power Glove', category: 'equipment' },
  { id: 0x1c, name: 'Titans Mitts', category: 'equipment' },
  { id: 0x1e, name: 'Flippers', category: 'equipment' },
  { id: 0x1f, name: 'Moon Pearl', category: 'equipment' },
  { id: 0x06, name: 'Mirror Shield', category: 'equipment' },
  { id: 0x61, name: 'Progressive Glove', category: 'equipment' },
  { id: 0x5f, name: 'Progressive Shield', category: 'equipment' },
  { id: 0x60, name: 'Progressive Mail', category: 'equipment' },

  // Medallions
  { id: 0x0f, name: 'Bombos', category: 'medallion' },
  { id: 0x10, name: 'Ether', category: 'medallion' },
  { id: 0x11, name: 'Quake', category: 'medallion' },

  // Bottles
  { id: 0x16, name: 'Bottle', category: 'bottle' },
  { id: 0x2b, name: 'Bottle (Red Potion)', category: 'bottle' },
  { id: 0x2c, name: 'Bottle (Green Potion)', category: 'bottle' },
  { id: 0x2d, name: 'Bottle (Blue Potion)', category: 'bottle' },
  { id: 0x3d, name: 'Bottle (Fairy)', category: 'bottle' },
  { id: 0x3c, name: 'Bottle (Bee)', category: 'bottle' },
  { id: 0x48, name: 'Bottle (Good Bee)', category: 'bottle' },

  // Upgrades
  { id: 0x4e, name: 'Magic Upgrade (1/2)', category: 'upgrade' },
  { id: 0x17, name: 'Piece of Heart', category: 'upgrade' },
  { id: 0x3e, name: 'Boss Heart Container', category: 'upgrade' },
  { id: 0x3f, name: 'Sanctuary Heart Container', category: 'upgrade' },

  // Pendants
  { id: -1, name: 'Green Pendant', category: 'crystal' },
  { id: -2, name: 'Blue Pendant', category: 'crystal' },
  { id: -3, name: 'Red Pendant', category: 'crystal' },

  // Crystals
  { id: -4, name: 'Crystal 1', category: 'crystal' },
  { id: -5, name: 'Crystal 2', category: 'crystal' },
  { id: -6, name: 'Crystal 3', category: 'crystal' },
  { id: -7, name: 'Crystal 4', category: 'crystal' },
  { id: -8, name: 'Crystal 5', category: 'crystal' },
  { id: -9, name: 'Crystal 6', category: 'crystal' },
  { id: -10, name: 'Crystal 7', category: 'crystal' },

  // Events
  { id: -11, name: 'Beat Agahnim 1', category: 'event' },
  { id: -12, name: 'Beat Agahnim 2', category: 'event' },
  { id: -13, name: 'Get Frog', category: 'event' },
  { id: -14, name: 'Return Smith', category: 'event' },
  { id: -15, name: 'Pick Up Purple Chest', category: 'event' },
  { id: -16, name: 'Open Floodgate', category: 'event' },
  { id: 0x4a, name: 'Activated Flute', category: 'event' },

  // Junk
  { id: 0x28, name: 'Bombs (3)', category: 'junk' },

  // Dungeon Keys - Small Keys
  { id: 0xa2, name: 'Small Key (Eastern Palace)', category: 'key' },
  { id: 0xa3, name: 'Small Key (Desert Palace)', category: 'key' },
  { id: 0xaa, name: 'Small Key (Tower of Hera)', category: 'key' },
  { id: 0xa0, name: 'Small Key (Hyrule Castle)', category: 'key' },
  { id: 0xa4, name: 'Small Key (Agahnims Tower)', category: 'key' },
  { id: 0xa6, name: 'Small Key (Palace of Darkness)', category: 'key' },
  { id: 0xab, name: 'Small Key (Thieves Town)', category: 'key' },
  { id: 0xa8, name: 'Small Key (Skull Woods)', category: 'key' },
  { id: 0xa5, name: 'Small Key (Swamp Palace)', category: 'key' },
  { id: 0xa9, name: 'Small Key (Ice Palace)', category: 'key' },
  { id: 0xa7, name: 'Small Key (Misery Mire)', category: 'key' },
  { id: 0xac, name: 'Small Key (Turtle Rock)', category: 'key' },
  { id: 0xad, name: 'Small Key (Ganons Tower)', category: 'key' },

  // Dungeon Keys - Big Keys
  { id: 0x9d, name: 'Big Key (Eastern Palace)', category: 'key' },
  { id: 0x9c, name: 'Big Key (Desert Palace)', category: 'key' },
  { id: 0x95, name: 'Big Key (Tower of Hera)', category: 'key' },
  { id: 0x9f, name: 'Big Key (Hyrule Castle)', category: 'key' },
  { id: 0x99, name: 'Big Key (Palace of Darkness)', category: 'key' },
  { id: 0x94, name: 'Big Key (Thieves Town)', category: 'key' },
  { id: 0x97, name: 'Big Key (Skull Woods)', category: 'key' },
  { id: 0x9a, name: 'Big Key (Swamp Palace)', category: 'key' },
  { id: 0x96, name: 'Big Key (Ice Palace)', category: 'key' },
  { id: 0x98, name: 'Big Key (Misery Mire)', category: 'key' },
  { id: 0x93, name: 'Big Key (Turtle Rock)', category: 'key' },
  { id: 0x92, name: 'Big Key (Ganons Tower)', category: 'key' },
];

export { ITEMS };
export type { ItemDefinition };
