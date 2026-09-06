/* @layer shared-game @kind data */
/**
 * Sprites for the items this app invented, drawn rather than extracted.
 *
 * An item the game never had has nothing in the ROM to cut a picture from, so
 * its sprite is one of our own drawings (asset-extraction/item-sprites/art/)
 * decoded by the `art` method. Filenames match the item's own spriteId with
 * the `sprite-` prefix dropped, exactly as every other definition does.
 *
 * The shop price symbols ride along the same way: one drawing per currency a
 * randomized shelf may charge, in the order the in-game binary holds them
 * (asset-extraction/item-sprites/currency-symbols.ts).
 */
import type { SpriteDefinition } from './manifest';

const art = (file: string, label: string): SpriteDefinition =>
  ({ file, label, category: 'hud', extract: { method: 'art', art: file } });

const RANDOMIZER_SPRITE_DEFINITIONS: readonly SpriteDefinition[] = [
  {
    file: 'quiver',
    label: 'Quiver',
    category: 'receipt',
    extract: { method: 'art', art: 'quiver' },
  },
  art('currency-rupee', 'Price: rupees'),
  art('currency-arrow', 'Price: arrows'),
  art('currency-bomb', 'Price: bombs'),
  art('currency-heart', 'Price: hearts'),
  art('currency-red-potion', 'Price: red potion'),
  art('currency-green-potion', 'Price: green potion'),
  art('currency-blue-potion', 'Price: blue potion'),
  art('currency-fairy', 'Price: fairy'),
  art('currency-bee', 'Price: bee'),
];

export { RANDOMIZER_SPRITE_DEFINITIONS };
