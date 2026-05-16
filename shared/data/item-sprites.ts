/**
 * Maps tracker item names (from inventoryToItemSet / ITEM_ID_TO_NAME) to sprite filenames.
 * Sprites are 32×32 RGBA PNGs in /sprites/items/.
 *
 * Items with upgrade tiers map to their highest obtained variant.
 * Use getItemSprite() to resolve the correct sprite for an item name.
 */

function getSpritesBase(): string {
  return (typeof window !== 'undefined' && window.api?.spritesBaseUrl) || '/sprites/items/';
}

/** Direct item name → sprite filename mapping */
export const ITEM_SPRITE_MAP: Record<string, string> = {
  // Swords
  'Fighter Sword':     'hud-fighter-sword',
  'Master Sword':      'hud-master-sword',
  'Tempered Sword':    'hud-tempered-sword',
  'Golden Sword':      'hud-golden-sword',

  // Shields
  'Fighters Shield':   'hud-fighters-shield',
  'Fire Shield':       'hud-fire-shield',
  'Mirror Shield':     'hud-mirror-shield',

  // Armor
  'Green Mail':        'hud-green-mail',
  'Blue Mail':         'hud-blue-mail',
  'Red Mail':          'hud-red-mail',

  // Bow
  'Bow':               'hud-bow',
  'Silver Bow':        'hud-silver-bow',

  // Boomerang
  'Blue Boomerang':    'hud-blue-boomerang',
  'Red Boomerang':     'hud-red-boomerang',

  // Weapons & tools
  'Hookshot':          'hud-hookshot',
  'Bombs':             'hud-bombs',
  'Mushroom':          'hud-mushroom',
  'Magic Powder':      'hud-magic-powder',
  'Fire Rod':          'hud-fire-rod',
  'Ice Rod':           'hud-ice-rod',
  'Lamp':              'hud-lamp',
  'Hammer':            'hud-hammer',
  'Shovel':            'hud-shovel',
  'Flute':             'hud-flute',
  'Activated Flute':   'receipt-activated-flute',
  'Bug Catching Net':  'hud-bug-net',
  'Book of Mudora':    'hud-book-of-mudora',

  // Medallions
  'Bombos':            'hud-bombos',
  'Ether':             'hud-ether',
  'Quake':             'hud-quake',

  // Canes
  'Cane of Somaria':   'hud-cane-of-somaria',
  'Cane of Byrna':     'hud-cane-of-byrna',

  // Cape / Mirror
  'Cape':              'hud-cape',
  'Magic Mirror':      'hud-magic-mirror',

  // Passive equipment
  'Power Glove':       'hud-power-glove',
  'Titans Mitts':      'hud-titans-mitts',
  'Pegasus Boots':     'hud-pegasus-boots',
  'Flippers':          'hud-flippers',
  'Moon Pearl':        'hud-moon-pearl',

  // Bottles
  'Bottle':            'hud-bottle',
  'Bottle (Red Potion)':   'hud-bottle-red',
  'Bottle (Green Potion)': 'hud-bottle-green',
  'Bottle (Blue Potion)':  'hud-bottle-blue',
  'Bottle (Fairy)':        'hud-bottle-fairy',
  'Bottle (Bee)':          'hud-bottle-bee',
  'Bottle (Good Bee)':     'hud-bottle-good-bee',

  // Collectibles
  'Heart Piece':       'receipt-heart-piece',
  'Heart Container':   'receipt-heart-container',
  'Small Key':         'receipt-small-key',

  // Pendants & crystals
  'Green Pendant':     'hud-green-pendant',
  'Red Pendant':       'hud-red-pendant',
  'Blue Pendant':      'hud-blue-pendant',
  'Crystal 1':         'hud-crystal',
  'Crystal 2':         'hud-crystal',
  'Crystal 3':         'hud-crystal',
  'Crystal 4':         'hud-crystal',
  'Crystal 5':         'hud-crystal',
  'Crystal 6':         'hud-crystal',
  'Crystal 7':         'hud-crystal',

  // Dungeon items
  'Big Key':           'hud-big-key',
  'Compass':           'hud-compass',
  'Map':               'hud-map',

  // Consumables & pickups
  'Bomb':              'hud-bombs',
  '3 Bombs':           'receipt-bomb-3',
  '10 Bombs':          'receipt-bomb-10',
  '1 Rupee':           'receipt-rupee-1',
  '5 Rupees':          'receipt-rupee-5',
  '20 Rupees':         'receipt-rupee-20',
  '50 Rupees':         'receipt-rupee-50',
  '100 Rupees':        'receipt-rupee-100',
  '300 Rupees':        'receipt-rupee-300',
  'Arrow':             'receipt-arrows',
  '10 Arrows':         'receipt-arrow-10',
  'Heart Refill':      'receipt-heart-refill',
  'Small Magic Refill':'drop-small-magic',
  'Large Magic Refill':'drop-full-magic',
  'Bomb Capacity':     '',
  'Arrow Capacity':    '',
  'Crystal':           'hud-crystal',
  'Magic Upgrade (1/2)': '',
};

/**
 * Get the sprite path for a given item name.
 * Returns undefined if no sprite is mapped.
 * Handles dungeon-specific names like "Small Key (Hyrule Castle)" by
 * stripping the parenthetical suffix.
 */
export function getItemSprite(itemName: string): string | undefined {
  let filename = ITEM_SPRITE_MAP[itemName];
  if (!filename) {
    // Try stripping dungeon suffix: "Small Key (X)" → "Small Key"
    const base = itemName.replace(/\s*\(.*\)$/, '');
    if (base !== itemName) {
      filename = ITEM_SPRITE_MAP[base];
    }
  }
  if (!filename) return undefined;
  return `${getSpritesBase()}${filename}.png`;
}

/**
 * All known inventory item names that have sprites.
 */
export const INVENTORY_ITEMS = Object.keys(ITEM_SPRITE_MAP);

/**
 * The items to display in the visual inventory grid, grouped by category.
 * Each category has a label and a list of items with their display name,
 * tracker item name (matching inventoryToItemSet output), and sprite.
 */
export interface InventorySlot {
  displayName: string;
  /** The tracker item name(s) to check in the inventory set — first match wins */
  trackerNames: string[];
  sprite: string;
}

export interface InventoryCategory {
  label: string;
  items: InventorySlot[];
}

export const INVENTORY_LAYOUT: InventoryCategory[] = [
  {
    label: 'Weapons',
    items: [
      { displayName: 'Sword', trackerNames: ['Golden Sword', 'Tempered Sword', 'Master Sword', 'Fighter Sword'], sprite: 'hud-fighter-sword' },
      { displayName: 'Bow', trackerNames: ['Silver Bow', 'Bow'], sprite: 'hud-bow' },
      { displayName: 'Boomerang', trackerNames: ['Red Boomerang', 'Blue Boomerang'], sprite: 'hud-blue-boomerang' },
      { displayName: 'Hookshot', trackerNames: ['Hookshot'], sprite: 'hud-hookshot' },
      { displayName: 'Bombs', trackerNames: ['Bombs'], sprite: 'hud-bombs' },
      { displayName: 'Hammer', trackerNames: ['Hammer'], sprite: 'hud-hammer' },
    ],
  },
  {
    label: 'Rods & Magic',
    items: [
      { displayName: 'Fire Rod', trackerNames: ['Fire Rod'], sprite: 'hud-fire-rod' },
      { displayName: 'Ice Rod', trackerNames: ['Ice Rod'], sprite: 'hud-ice-rod' },
      { displayName: 'Bombos', trackerNames: ['Bombos'], sprite: 'hud-bombos' },
      { displayName: 'Ether', trackerNames: ['Ether'], sprite: 'hud-ether' },
      { displayName: 'Quake', trackerNames: ['Quake'], sprite: 'hud-quake' },
      { displayName: 'Lamp', trackerNames: ['Lamp'], sprite: 'hud-lamp' },
      { displayName: 'Cane of Somaria', trackerNames: ['Cane of Somaria'], sprite: 'hud-cane-of-somaria' },
      { displayName: 'Cane of Byrna', trackerNames: ['Cane of Byrna'], sprite: 'hud-cane-of-byrna' },
      { displayName: 'Cape', trackerNames: ['Cape'], sprite: 'hud-cape' },
    ],
  },
  {
    label: 'Equipment',
    items: [
      { displayName: 'Shield', trackerNames: ['Mirror Shield', 'Fire Shield', 'Fighters Shield'], sprite: 'hud-fighters-shield' },
      { displayName: 'Armor', trackerNames: ['Red Mail', 'Blue Mail'], sprite: 'hud-green-mail' },
      { displayName: 'Gloves', trackerNames: ['Titans Mitts', 'Power Glove'], sprite: 'hud-power-glove' },
      { displayName: 'Boots', trackerNames: ['Pegasus Boots'], sprite: 'hud-pegasus-boots' },
      { displayName: 'Flippers', trackerNames: ['Flippers'], sprite: 'hud-flippers' },
      { displayName: 'Moon Pearl', trackerNames: ['Moon Pearl'], sprite: 'hud-moon-pearl' },
      { displayName: 'Mirror', trackerNames: ['Magic Mirror'], sprite: 'hud-magic-mirror' },
    ],
  },
  {
    label: 'Items',
    items: [
      { displayName: 'Mushroom', trackerNames: ['Magic Powder', 'Mushroom'], sprite: 'hud-mushroom' },
      { displayName: 'Flute', trackerNames: ['Activated Flute', 'Flute', 'Shovel'], sprite: 'hud-shovel' },
      { displayName: 'Bug Net', trackerNames: ['Bug Catching Net'], sprite: 'hud-bug-net' },
      { displayName: 'Book', trackerNames: ['Book of Mudora'], sprite: 'hud-book-of-mudora' },
      { displayName: 'Bottle', trackerNames: ['Bottle'], sprite: 'hud-bottle' },
    ],
  },
  {
    label: 'Progress',
    items: [
      { displayName: 'Green Pendant', trackerNames: ['Green Pendant'], sprite: 'hud-green-pendant' },
      { displayName: 'Red Pendant', trackerNames: ['Red Pendant'], sprite: 'hud-red-pendant' },
      { displayName: 'Blue Pendant', trackerNames: ['Blue Pendant'], sprite: 'hud-blue-pendant' },
      { displayName: 'Crystal 1', trackerNames: ['Crystal 1'], sprite: 'hud-crystal' },
      { displayName: 'Crystal 2', trackerNames: ['Crystal 2'], sprite: 'hud-crystal' },
      { displayName: 'Crystal 3', trackerNames: ['Crystal 3'], sprite: 'hud-crystal' },
      { displayName: 'Crystal 4', trackerNames: ['Crystal 4'], sprite: 'hud-crystal' },
      { displayName: 'Crystal 5', trackerNames: ['Crystal 5'], sprite: 'hud-crystal' },
      { displayName: 'Crystal 6', trackerNames: ['Crystal 6'], sprite: 'hud-crystal' },
      { displayName: 'Crystal 7', trackerNames: ['Crystal 7'], sprite: 'hud-crystal' },
    ],
  },
];

/**
 * Resolve which sprite to show for a tiered item, given the current inventory.
 * E.g. if inventory has 'Tempered Sword', show tempered-sword.png.
 */
export function resolveItemSprite(slot: InventorySlot, inventory: Set<string>): { obtained: boolean; sprite: string } {
  for (const name of slot.trackerNames) {
    if (inventory.has(name)) {
      const sprite = ITEM_SPRITE_MAP[name];
      return { obtained: true, sprite: sprite ?? slot.sprite };
    }
  }
  return { obtained: false, sprite: slot.sprite };
}

// ─── View mode type ───

export type InventoryViewMode = 'default' | 'ingame' | 'compact';

// ─── In-Game Layout (matches the SNES pause screen inventory) ───
// 5×4 grid of usable items + side equipment + bottom passive gear

export const INGAME_ITEMS_GRID: InventorySlot[][] = [
  // Row 1
  [
    { displayName: 'Bow', trackerNames: ['Silver Bow', 'Bow'], sprite: 'hud-bow' },
    { displayName: 'Boomerang', trackerNames: ['Red Boomerang', 'Blue Boomerang'], sprite: 'hud-blue-boomerang' },
    { displayName: 'Hookshot', trackerNames: ['Hookshot'], sprite: 'hud-hookshot' },
    { displayName: 'Bombs', trackerNames: ['Bombs'], sprite: 'hud-bombs' },
  ],
  // Row 2
  [
    { displayName: 'Powder', trackerNames: ['Magic Powder', 'Mushroom'], sprite: 'hud-mushroom' },
    { displayName: 'Fire Rod', trackerNames: ['Fire Rod'], sprite: 'hud-fire-rod' },
    { displayName: 'Ice Rod', trackerNames: ['Ice Rod'], sprite: 'hud-ice-rod' },
    { displayName: 'Bombos', trackerNames: ['Bombos'], sprite: 'hud-bombos' },
  ],
  // Row 3
  [
    { displayName: 'Ether', trackerNames: ['Ether'], sprite: 'hud-ether' },
    { displayName: 'Quake', trackerNames: ['Quake'], sprite: 'hud-quake' },
    { displayName: 'Lamp', trackerNames: ['Lamp'], sprite: 'hud-lamp' },
    { displayName: 'Hammer', trackerNames: ['Hammer'], sprite: 'hud-hammer' },
  ],
  // Row 4
  [
    { displayName: 'Flute', trackerNames: ['Activated Flute', 'Flute', 'Shovel'], sprite: 'hud-shovel' },
    { displayName: 'Bug Net', trackerNames: ['Bug Catching Net'], sprite: 'hud-bug-net' },
    { displayName: 'Book', trackerNames: ['Book of Mudora'], sprite: 'hud-book-of-mudora' },
    { displayName: 'Bottle', trackerNames: ['Bottle'], sprite: 'hud-bottle' },
  ],
  // Row 5
  [
    { displayName: 'Somaria', trackerNames: ['Cane of Somaria'], sprite: 'hud-cane-of-somaria' },
    { displayName: 'Byrna', trackerNames: ['Cane of Byrna'], sprite: 'hud-cane-of-byrna' },
    { displayName: 'Cape', trackerNames: ['Cape'], sprite: 'hud-cape' },
    { displayName: 'Mirror', trackerNames: ['Magic Mirror'], sprite: 'hud-magic-mirror' },
  ],
];

export const INGAME_EQUIPMENT: InventorySlot[] = [
  { displayName: 'Sword', trackerNames: ['Golden Sword', 'Tempered Sword', 'Master Sword', 'Fighter Sword'], sprite: 'hud-fighter-sword' },
  { displayName: 'Shield', trackerNames: ['Mirror Shield', 'Fire Shield', 'Fighters Shield'], sprite: 'hud-fighters-shield' },
  { displayName: 'Armor', trackerNames: ['Red Mail', 'Blue Mail'], sprite: 'hud-green-mail' },
];

export const INGAME_PASSIVES: InventorySlot[] = [
  { displayName: 'Gloves', trackerNames: ['Titans Mitts', 'Power Glove'], sprite: 'hud-power-glove' },
  { displayName: 'Boots', trackerNames: ['Pegasus Boots'], sprite: 'hud-pegasus-boots' },
  { displayName: 'Flippers', trackerNames: ['Flippers'], sprite: 'hud-flippers' },
  { displayName: 'Moon Pearl', trackerNames: ['Moon Pearl'], sprite: 'hud-moon-pearl' },
];

// ─── Compact Layout (in-game style but with upgrades broken down, no categories) ───
// Flat grid of individual items/tiers. Shows each upgrade separately.

export const COMPACT_LAYOUT: InventorySlot[] = [
  // Swords
  { displayName: 'Fighter', trackerNames: ['Fighter Sword'], sprite: 'hud-fighter-sword' },
  { displayName: 'Master', trackerNames: ['Master Sword'], sprite: 'hud-master-sword' },
  { displayName: 'Tempered', trackerNames: ['Tempered Sword'], sprite: 'hud-tempered-sword' },
  { displayName: 'Golden', trackerNames: ['Golden Sword'], sprite: 'hud-golden-sword' },
  // Shields
  { displayName: 'Fighter', trackerNames: ['Fighters Shield'], sprite: 'hud-fighters-shield' },
  { displayName: 'Fire', trackerNames: ['Fire Shield'], sprite: 'hud-fire-shield' },
  { displayName: 'Mirror', trackerNames: ['Mirror Shield'], sprite: 'hud-mirror-shield' },
  // Armor
  { displayName: 'Blue Mail', trackerNames: ['Blue Mail'], sprite: 'hud-blue-mail' },
  { displayName: 'Red Mail', trackerNames: ['Red Mail'], sprite: 'hud-red-mail' },
  // Gloves
  { displayName: 'Glove', trackerNames: ['Power Glove'], sprite: 'hud-power-glove' },
  { displayName: 'Mitts', trackerNames: ['Titans Mitts'], sprite: 'hud-titans-mitts' },
  // Bow
  { displayName: 'Bow', trackerNames: ['Bow'], sprite: 'hud-bow' },
  { displayName: 'Silver', trackerNames: ['Silver Bow'], sprite: 'hud-silver-bow' },
  // Boomerang
  { displayName: 'Blue', trackerNames: ['Blue Boomerang'], sprite: 'hud-blue-boomerang' },
  { displayName: 'Red', trackerNames: ['Red Boomerang'], sprite: 'hud-red-boomerang' },
  // Bottles
  { displayName: 'Bottle', trackerNames: ['Bottle'], sprite: 'hud-bottle' },
  // Rest (single-tier items)
  { displayName: 'Hookshot', trackerNames: ['Hookshot'], sprite: 'hud-hookshot' },
  { displayName: 'Bombs', trackerNames: ['Bombs'], sprite: 'hud-bombs' },
  { displayName: 'Hammer', trackerNames: ['Hammer'], sprite: 'hud-hammer' },
  { displayName: 'Fire Rod', trackerNames: ['Fire Rod'], sprite: 'hud-fire-rod' },
  { displayName: 'Ice Rod', trackerNames: ['Ice Rod'], sprite: 'hud-ice-rod' },
  { displayName: 'Lamp', trackerNames: ['Lamp'], sprite: 'hud-lamp' },
  { displayName: 'Bombos', trackerNames: ['Bombos'], sprite: 'hud-bombos' },
  { displayName: 'Ether', trackerNames: ['Ether'], sprite: 'hud-ether' },
  { displayName: 'Quake', trackerNames: ['Quake'], sprite: 'hud-quake' },
  { displayName: 'Somaria', trackerNames: ['Cane of Somaria'], sprite: 'hud-cane-of-somaria' },
  { displayName: 'Byrna', trackerNames: ['Cane of Byrna'], sprite: 'hud-cane-of-byrna' },
  { displayName: 'Cape', trackerNames: ['Cape'], sprite: 'hud-cape' },
  { displayName: 'Mirror', trackerNames: ['Magic Mirror'], sprite: 'hud-magic-mirror' },
  { displayName: 'Powder', trackerNames: ['Magic Powder', 'Mushroom'], sprite: 'hud-mushroom' },
  { displayName: 'Flute', trackerNames: ['Activated Flute', 'Flute', 'Shovel'], sprite: 'hud-shovel' },
  { displayName: 'Net', trackerNames: ['Bug Catching Net'], sprite: 'hud-bug-net' },
  { displayName: 'Book', trackerNames: ['Book of Mudora'], sprite: 'hud-book-of-mudora' },
  { displayName: 'Boots', trackerNames: ['Pegasus Boots'], sprite: 'hud-pegasus-boots' },
  { displayName: 'Flippers', trackerNames: ['Flippers'], sprite: 'hud-flippers' },
  { displayName: 'Pearl', trackerNames: ['Moon Pearl'], sprite: 'hud-moon-pearl' },
];
