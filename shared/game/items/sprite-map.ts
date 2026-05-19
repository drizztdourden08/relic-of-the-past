import type { InventorySlot } from './inventory-types';

let _spritesBase = '/sprites/items/';

function setSpritesBase(base: string): void {
  _spritesBase = base;
}

function getSpritesBase(): string {
  return _spritesBase;
}

/** Direct item name → sprite filename mapping */
const ITEM_SPRITE_MAP: Record<string, string> = {
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

/** All known inventory item names that have sprites. */
const INVENTORY_ITEMS = Object.keys(ITEM_SPRITE_MAP);

/**
 * Get the sprite path for a given item name.
 * Returns undefined if no sprite is mapped.
 * Handles dungeon-specific names like "Small Key (Hyrule Castle)" by
 * stripping the parenthetical suffix.
 */
function getItemSprite(itemName: string): string | undefined {
  let filename = ITEM_SPRITE_MAP[itemName];
  if (!filename) {
    const base = itemName.replace(/\s*\(.*\)$/, '');
    if (base !== itemName) {
      filename = ITEM_SPRITE_MAP[base];
    }
  }
  if (!filename) return undefined;
  return `${getSpritesBase()}${filename}.png`;
}

/**
 * Resolve which sprite to show for a tiered item, given the current inventory.
 * E.g. if inventory has 'Tempered Sword', show tempered-sword.png.
 */
function resolveItemSprite(slot: InventorySlot, inventory: Set<string>): { obtained: boolean; sprite: string } {
  for (const name of slot.trackerNames) {
    if (inventory.has(name)) {
      const sprite = ITEM_SPRITE_MAP[name];
      return { obtained: true, sprite: sprite ?? slot.sprite };
    }
  }
  return { obtained: false, sprite: slot.sprite };
}

export {
  INVENTORY_ITEMS,
  ITEM_SPRITE_MAP,
  getItemSprite,
  getSpritesBase,
  resolveItemSprite,
  setSpritesBase
};
