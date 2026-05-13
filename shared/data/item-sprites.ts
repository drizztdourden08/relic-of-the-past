/**
 * Maps tracker item names (from inventoryToItemSet / ITEM_ID_TO_NAME) to sprite filenames.
 * Sprites are 32×32 RGBA PNGs in /sprites/items/.
 *
 * Items with upgrade tiers map to their highest obtained variant.
 * Use getItemSprite() to resolve the correct sprite for an item name.
 */

const SPRITE_BASE = '/sprites/items/';

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
  'Heart Piece':       'hud-heart-piece',
  'Heart Container':   'hud-heart-container',
  'Small Key':         'hud-small-key',

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
  '3 Bombs':           'receipt-3-bombs',
  '10 Bombs':          'receipt-bomb-refill',
  '1 Rupee':           'receipt-1-rupee',
  '5 Rupees':          'receipt-5-rupees',
  '20 Rupees':         'receipt-20-rupees',
  '50 Rupees':         'receipt-50-rupees',
  '100 Rupees':        'receipt-100-rupees',
  '300 Rupees':        'receipt-300-rupees',
  'Arrow':             'receipt-arrows',
  '10 Arrows':         'receipt-10-arrows',
  'Heart Refill':      'receipt-arrow-refill',
  'Small Magic Refill':'drop-small-magic',
  'Large Magic Refill':'drop-full-magic',
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
  return `${SPRITE_BASE}${filename}.png`;
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
      { displayName: 'Sword', trackerNames: ['Golden Sword', 'Tempered Sword', 'Master Sword', 'Fighter Sword'], sprite: 'fighter-sword' },
      { displayName: 'Bow', trackerNames: ['Silver Bow', 'Bow'], sprite: 'bow' },
      { displayName: 'Boomerang', trackerNames: ['Red Boomerang', 'Blue Boomerang'], sprite: 'blue-boomerang' },
      { displayName: 'Hookshot', trackerNames: ['Hookshot'], sprite: 'hookshot' },
      { displayName: 'Bombs', trackerNames: ['Bombs'], sprite: 'bombs' },
      { displayName: 'Hammer', trackerNames: ['Hammer'], sprite: 'hammer' },
    ],
  },
  {
    label: 'Rods & Magic',
    items: [
      { displayName: 'Fire Rod', trackerNames: ['Fire Rod'], sprite: 'fire-rod' },
      { displayName: 'Ice Rod', trackerNames: ['Ice Rod'], sprite: 'ice-rod' },
      { displayName: 'Bombos', trackerNames: ['Bombos'], sprite: 'bombos' },
      { displayName: 'Ether', trackerNames: ['Ether'], sprite: 'ether' },
      { displayName: 'Quake', trackerNames: ['Quake'], sprite: 'quake' },
      { displayName: 'Lamp', trackerNames: ['Lamp'], sprite: 'lamp' },
      { displayName: 'Cane of Somaria', trackerNames: ['Cane of Somaria'], sprite: 'cane-of-somaria' },
      { displayName: 'Cane of Byrna', trackerNames: ['Cane of Byrna'], sprite: 'cane-of-byrna' },
      { displayName: 'Cape', trackerNames: ['Cape'], sprite: 'cape' },
    ],
  },
  {
    label: 'Equipment',
    items: [
      { displayName: 'Shield', trackerNames: ['Mirror Shield', 'Fire Shield', 'Fighters Shield'], sprite: 'fighters-shield' },
      { displayName: 'Armor', trackerNames: ['Red Mail', 'Blue Mail'], sprite: 'green-mail' },
      { displayName: 'Gloves', trackerNames: ['Titans Mitts', 'Power Glove'], sprite: 'power-glove' },
      { displayName: 'Boots', trackerNames: ['Pegasus Boots'], sprite: 'pegasus-boots' },
      { displayName: 'Flippers', trackerNames: ['Flippers'], sprite: 'flippers' },
      { displayName: 'Moon Pearl', trackerNames: ['Moon Pearl'], sprite: 'moon-pearl' },
      { displayName: 'Mirror', trackerNames: ['Magic Mirror'], sprite: 'magic-mirror' },
    ],
  },
  {
    label: 'Items',
    items: [
      { displayName: 'Mushroom', trackerNames: ['Magic Powder', 'Mushroom'], sprite: 'mushroom' },
      { displayName: 'Flute', trackerNames: ['Activated Flute', 'Flute', 'Shovel'], sprite: 'shovel' },
      { displayName: 'Bug Net', trackerNames: ['Bug Catching Net'], sprite: 'bug-net' },
      { displayName: 'Book', trackerNames: ['Book of Mudora'], sprite: 'book-of-mudora' },
      { displayName: 'Bottle', trackerNames: ['Bottle'], sprite: 'bottle' },
    ],
  },
  {
    label: 'Progress',
    items: [
      { displayName: 'Green Pendant', trackerNames: ['Green Pendant'], sprite: 'green-pendant' },
      { displayName: 'Red Pendant', trackerNames: ['Red Pendant'], sprite: 'red-pendant' },
      { displayName: 'Blue Pendant', trackerNames: ['Blue Pendant'], sprite: 'blue-pendant' },
      { displayName: 'Crystal 1', trackerNames: ['Crystal 1'], sprite: 'crystal' },
      { displayName: 'Crystal 2', trackerNames: ['Crystal 2'], sprite: 'crystal' },
      { displayName: 'Crystal 3', trackerNames: ['Crystal 3'], sprite: 'crystal' },
      { displayName: 'Crystal 4', trackerNames: ['Crystal 4'], sprite: 'crystal' },
      { displayName: 'Crystal 5', trackerNames: ['Crystal 5'], sprite: 'crystal' },
      { displayName: 'Crystal 6', trackerNames: ['Crystal 6'], sprite: 'crystal' },
      { displayName: 'Crystal 7', trackerNames: ['Crystal 7'], sprite: 'crystal' },
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
