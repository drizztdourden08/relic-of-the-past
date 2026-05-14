/**
 * Complete manifest of ALL extracted item sprites, organized by category.
 * Used by the Sprite Review page to verify each sprite image is correct.
 *
 * This is NOT the item→sprite mapping (that's item-sprites.ts).
 * This is the sprite catalog: "here are all the images we have".
 */

export type SpriteCategory = 'hud' | 'receipt' | 'drop';

export interface SpriteManifestEntry {
  /** Filename without extension (e.g. "hud-bow") */
  file: string;
  /** Human-readable label (e.g. "Bow (with arrows)") */
  label: string;
  /** Category for grouping */
  category: SpriteCategory;
}

const SPRITE_BASE = '/sprites/items/';

export function getSpritePath(file: string): string {
  return `${SPRITE_BASE}${file}.png`;
}

// ─── HUD Items (2bpp tiles from tilesets 105/106/107) ───

const HUD_SPRITES: SpriteManifestEntry[] = [
  // Swords
  { file: 'hud-fighter-sword',   label: 'Fighter Sword',      category: 'hud' },
  { file: 'hud-master-sword',    label: 'Master Sword',       category: 'hud' },
  { file: 'hud-tempered-sword',  label: 'Tempered Sword',     category: 'hud' },
  { file: 'hud-golden-sword',    label: 'Golden Sword',       category: 'hud' },

  // Shields
  { file: 'hud-fighters-shield', label: 'Fighters Shield',    category: 'hud' },
  { file: 'hud-fire-shield',     label: 'Fire Shield',        category: 'hud' },
  { file: 'hud-mirror-shield',   label: 'Mirror Shield',      category: 'hud' },

  // Armor
  { file: 'hud-green-mail',      label: 'Green Mail',         category: 'hud' },
  { file: 'hud-blue-mail',       label: 'Blue Mail',          category: 'hud' },
  { file: 'hud-red-mail',        label: 'Red Mail',           category: 'hud' },

  // Bow
  { file: 'hud-bow-no-arrows',   label: 'Bow (no arrows)',    category: 'hud' },
  { file: 'hud-bow',             label: 'Bow (with arrows)',  category: 'hud' },
  { file: 'hud-silver-bow',      label: 'Silver Bow',         category: 'hud' },

  // Boomerang
  { file: 'hud-blue-boomerang',  label: 'Blue Boomerang',     category: 'hud' },
  { file: 'hud-red-boomerang',   label: 'Red Boomerang',      category: 'hud' },

  // Weapons & tools
  { file: 'hud-hookshot',        label: 'Hookshot',           category: 'hud' },
  { file: 'hud-bombs',           label: 'Bombs',              category: 'hud' },
  { file: 'hud-mushroom',        label: 'Mushroom',           category: 'hud' },
  { file: 'hud-magic-powder',    label: 'Magic Powder',       category: 'hud' },
  { file: 'hud-fire-rod',        label: 'Fire Rod',           category: 'hud' },
  { file: 'hud-ice-rod',         label: 'Ice Rod',            category: 'hud' },
  { file: 'hud-lamp',            label: 'Lamp',               category: 'hud' },
  { file: 'hud-hammer',          label: 'Hammer',             category: 'hud' },
  { file: 'hud-shovel',          label: 'Shovel',             category: 'hud' },
  { file: 'hud-flute',           label: 'Flute',              category: 'hud' },
  { file: 'hud-bug-net',         label: 'Bug Net',            category: 'hud' },
  { file: 'hud-book-of-mudora',  label: 'Book of Mudora',     category: 'hud' },

  // Medallions
  { file: 'hud-bombos',          label: 'Bombos',             category: 'hud' },
  { file: 'hud-ether',           label: 'Ether',              category: 'hud' },
  { file: 'hud-quake',           label: 'Quake',              category: 'hud' },

  // Canes
  { file: 'hud-cane-of-somaria', label: 'Cane of Somaria',    category: 'hud' },
  { file: 'hud-cane-of-byrna',   label: 'Cane of Byrna',      category: 'hud' },

  // Cape / Mirror
  { file: 'hud-cape',            label: 'Cape',               category: 'hud' },
  { file: 'hud-magic-mirror',    label: 'Magic Mirror',       category: 'hud' },

  // Passive equipment
  { file: 'hud-power-glove',     label: 'Power Glove',        category: 'hud' },
  { file: 'hud-titans-mitts',    label: 'Titans Mitts',       category: 'hud' },
  { file: 'hud-pegasus-boots',   label: 'Pegasus Boots',      category: 'hud' },
  { file: 'hud-flippers',        label: 'Flippers',           category: 'hud' },
  { file: 'hud-moon-pearl',      label: 'Moon Pearl',         category: 'hud' },

  // Bottles
  { file: 'hud-bottle',          label: 'Bottle (empty)',      category: 'hud' },
  { file: 'hud-bottle-mushroom', label: 'Bottle (mushroom)',   category: 'hud' },
  { file: 'hud-bottle-red',      label: 'Bottle (red potion)', category: 'hud' },
  { file: 'hud-bottle-green',    label: 'Bottle (green potion)', category: 'hud' },
  { file: 'hud-bottle-blue',     label: 'Bottle (blue potion)', category: 'hud' },
  { file: 'hud-bottle-fairy',    label: 'Bottle (fairy)',      category: 'hud' },
  { file: 'hud-bottle-bee',      label: 'Bottle (bee)',        category: 'hud' },
  { file: 'hud-bottle-good-bee', label: 'Bottle (good bee)',   category: 'hud' },

  // Dungeon items
  { file: 'hud-big-key',         label: 'Big Key',            category: 'hud' },
  { file: 'hud-compass',         label: 'Compass',            category: 'hud' },
  { file: 'hud-map',             label: 'Map',                category: 'hud' },
  { file: 'hud-small-key',       label: 'Small Key',          category: 'hud' },

  // Pendants
  { file: 'hud-green-pendant',   label: 'Green Pendant',      category: 'hud' },
  { file: 'hud-blue-pendant',    label: 'Blue Pendant',       category: 'hud' },
  { file: 'hud-red-pendant',     label: 'Red Pendant',        category: 'hud' },

  // Crystal
  { file: 'hud-crystal',         label: 'Crystal',            category: 'hud' },
  { file: 'hud-big-key-chest',  label: 'Big Key (chest obtained)', category: 'hud' },

  // Hearts
  { file: 'hud-heart-piece-0',   label: 'Heart Piece (0/4)',  category: 'hud' },
  { file: 'hud-heart-piece-1',   label: 'Heart Piece (1/4)',  category: 'hud' },
  { file: 'hud-heart-piece-2',   label: 'Heart Piece (2/4)',  category: 'hud' },
  { file: 'hud-heart-piece-3',   label: 'Heart Piece (3/4)',  category: 'hud' },
  { file: 'hud-heart-piece-4',   label: 'Heart Piece (4/4)',  category: 'hud' },
];

// ─── Receipt / Chest-getter Items (3bpp from receipt sheets) ───

const RECEIPT_SPRITES: SpriteManifestEntry[] = [
  { file: 'receipt-fighter-sword',      label: 'Fighter Sword',      category: 'receipt' },
  { file: 'receipt-master-sword',       label: 'Master Sword',       category: 'receipt' },
  { file: 'receipt-tempered-sword',     label: 'Tempered Sword',     category: 'receipt' },
  { file: 'receipt-golden-sword',       label: 'Golden Sword',       category: 'receipt' },
  { file: 'receipt-fighters-shield',    label: 'Fighters Shield',    category: 'receipt' },
  { file: 'receipt-fire-shield',        label: 'Fire Shield',        category: 'receipt' },
  { file: 'receipt-mirror-shield',      label: 'Mirror Shield',      category: 'receipt' },
  { file: 'receipt-fire-rod',           label: 'Fire Rod',           category: 'receipt' },
  { file: 'receipt-ice-rod',            label: 'Ice Rod',            category: 'receipt' },
  { file: 'receipt-hammer',             label: 'Hammer',             category: 'receipt' },
  { file: 'receipt-hookshot',           label: 'Hookshot',           category: 'receipt' },
  { file: 'receipt-bow',                label: 'Bow',                category: 'receipt' },
  { file: 'receipt-blue-boomerang',     label: 'Blue Boomerang',     category: 'receipt' },
  { file: 'receipt-magic-powder',       label: 'Magic Powder',       category: 'receipt' },
  { file: 'receipt-bottle-empty',       label: 'Bottle (empty)',     category: 'receipt' },
  { file: 'receipt-bombos',             label: 'Bombos',             category: 'receipt' },
  { file: 'receipt-ether',              label: 'Ether',              category: 'receipt' },
  { file: 'receipt-quake',              label: 'Quake',              category: 'receipt' },
  { file: 'receipt-lamp',               label: 'Lamp',               category: 'receipt' },
  { file: 'receipt-shovel',             label: 'Shovel',             category: 'receipt' },
  { file: 'receipt-flute',              label: 'Flute',              category: 'receipt' },
  { file: 'receipt-cane-of-somaria',    label: 'Cane of Somaria',    category: 'receipt' },
  { file: 'receipt-bottle-2',           label: 'Bottle (variant 2)', category: 'receipt' },
  { file: 'receipt-heart-piece',        label: 'Heart Piece',        category: 'receipt' },
  { file: 'receipt-cane-of-byrna',      label: 'Cane of Byrna',      category: 'receipt' },
  { file: 'receipt-magic-cape',         label: 'Magic Cape',         category: 'receipt' },
  { file: 'receipt-magic-mirror',       label: 'Magic Mirror',       category: 'receipt' },
  { file: 'receipt-power-glove',        label: 'Power Glove',        category: 'receipt' },
  { file: 'receipt-titans-mitt',        label: 'Titans Mitt',        category: 'receipt' },
  { file: 'receipt-book-of-mudora',     label: 'Book of Mudora',     category: 'receipt' },
  { file: 'receipt-flippers',           label: 'Flippers',           category: 'receipt' },
  { file: 'receipt-moon-pearl',         label: 'Moon Pearl',         category: 'receipt' },
  { file: 'receipt-crystal',            label: 'Crystal',            category: 'receipt' },
  { file: 'receipt-bug-net',            label: 'Bug Net',            category: 'receipt' },
  { file: 'receipt-blue-mail',          label: 'Blue Mail',          category: 'receipt' },
  { file: 'receipt-red-mail',           label: 'Red Mail',           category: 'receipt' },
  { file: 'receipt-small-key',          label: 'Small Key',          category: 'receipt' },
  { file: 'receipt-compass',            label: 'Compass',            category: 'receipt' },
  { file: 'receipt-heart-container',    label: 'Heart Container',    category: 'receipt' },
  { file: 'receipt-bomb-1',             label: '1 Bomb',             category: 'receipt' },
  { file: 'receipt-bomb-3',             label: '3 Bombs',            category: 'receipt' },
  { file: 'receipt-mushroom',           label: 'Mushroom',           category: 'receipt' },
  { file: 'receipt-red-boomerang',      label: 'Red Boomerang',      category: 'receipt' },
  { file: 'receipt-red-potion',         label: 'Red Potion',         category: 'receipt' },
  { file: 'receipt-green-potion',       label: 'Green Potion',       category: 'receipt' },
  { file: 'receipt-blue-potion',        label: 'Blue Potion',        category: 'receipt' },
  { file: 'receipt-bomb-10',            label: '10 Bombs',           category: 'receipt' },
  { file: 'receipt-half-magic',         label: 'Half Magic',         category: 'receipt' },
  { file: 'receipt-rupee-1',            label: '1 Rupee',            category: 'receipt' },
  { file: 'receipt-rupee-5',            label: '5 Rupees',           category: 'receipt' },
  { file: 'receipt-rupee-20',           label: '20 Rupees',          category: 'receipt' },
  { file: 'receipt-green-pendant',      label: 'Green Pendant',      category: 'receipt' },
  { file: 'receipt-blue-pendant',       label: 'Blue Pendant',       category: 'receipt' },
  { file: 'receipt-red-pendant',        label: 'Red Pendant',        category: 'receipt' },
  { file: 'receipt-bow-2',              label: 'Bow (variant 2)',    category: 'receipt' },
  { file: 'receipt-silver-arrows',      label: 'Silver Arrows',      category: 'receipt' },
  { file: 'receipt-bottle-red-potion',  label: 'Bottle (red potion)', category: 'receipt' },
  { file: 'receipt-bottle-green-potion', label: 'Bottle (green potion)', category: 'receipt' },
  { file: 'receipt-rupee-100',          label: '100 Rupees',         category: 'receipt' },
  { file: 'receipt-rupee-50',           label: '50 Rupees',          category: 'receipt' },
  { file: 'receipt-heart-refill',       label: 'Heart Refill',       category: 'receipt' },
  { file: 'receipt-arrows',             label: 'Arrows',             category: 'receipt' },
  { file: 'receipt-arrow-10',           label: '10 Arrows',          category: 'receipt' },
  { file: 'receipt-magic-small',        label: 'Small Magic',        category: 'receipt' },
  { file: 'receipt-rupee-300',          label: '300 Rupees',         category: 'receipt' },
  { file: 'receipt-rupee-20-alt',       label: '20 Rupees (alt)',    category: 'receipt' },
  { file: 'receipt-bottle-3',           label: 'Bottle (variant 3)', category: 'receipt' },
  { file: 'receipt-fighter-sword-uncle', label: 'Fighter Sword (uncle)', category: 'receipt' },
  { file: 'receipt-activated-flute',    label: 'Activated Flute',    category: 'receipt' },
  { file: 'receipt-pegasus-boots',      label: 'Pegasus Boots',      category: 'receipt' },
];

// ─── Droppable / Absorbable Sprites (3bpp from common sheets) ───

const DROP_SPRITES: SpriteManifestEntry[] = [
  { file: 'drop-green-rupee',  label: 'Green Rupee',   category: 'drop' },
  { file: 'drop-blue-rupee',   label: 'Blue Rupee',    category: 'drop' },
  { file: 'drop-red-rupee',    label: 'Red Rupee',     category: 'drop' },
  { file: 'drop-heart',        label: 'Heart',         category: 'drop' },
  { file: 'drop-bomb-1',       label: '1 Bomb',        category: 'drop' },
  { file: 'drop-bomb-4',       label: '4 Bombs',       category: 'drop' },
  { file: 'drop-bomb-8',       label: '8 Bombs',       category: 'drop' },
  { file: 'drop-small-magic',  label: 'Small Magic',   category: 'drop' },
  { file: 'drop-full-magic',   label: 'Full Magic',    category: 'drop' },
  { file: 'drop-arrow-5',      label: '5 Arrows',      category: 'drop' },
  { file: 'drop-arrow-10',     label: '10 Arrows',     category: 'drop' },
  { file: 'drop-fairy',        label: 'Fairy',         category: 'drop' },
  { file: 'drop-small-key',    label: 'Small Key',     category: 'drop' },
  { file: 'drop-big-key',      label: 'Big Key',       category: 'drop' },
  { file: 'drop-shield',       label: 'Shield',        category: 'drop' },
];

// ─── Full manifest ───

export const SPRITE_MANIFEST: SpriteManifestEntry[] = [
  ...HUD_SPRITES,
  ...RECEIPT_SPRITES,
  ...DROP_SPRITES,
];

export const CATEGORY_LABELS: Record<SpriteCategory, string> = {
  hud: 'HUD / UI',
  receipt: 'Receipt / Chest',
  drop: 'Droppable',
};

export const CATEGORY_ORDER: SpriteCategory[] = ['hud', 'receipt', 'drop'];
