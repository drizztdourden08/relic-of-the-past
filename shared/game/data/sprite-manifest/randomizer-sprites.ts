/* @layer shared-game @kind data */
import type { SpriteDefinition } from './manifest';

const RANDOMIZER_SPRITE_DEFINITIONS: readonly SpriteDefinition[] = [
  {
    file: 'quiver',
    label: 'Quiver',
    category: 'receipt',
    extract: { method: 'art', art: 'quiver' },
  },
  { file: 'currency-rupee', label: 'Price: rupees', category: 'hud', extract: { method: 'art', art: 'currency-rupee' } },
  { file: 'currency-arrow', label: 'Price: arrows', category: 'hud', extract: { method: 'art', art: 'currency-arrow' } },
  { file: 'currency-bomb', label: 'Price: bombs', category: 'hud', extract: { method: 'art', art: 'currency-bomb' } },
  { file: 'currency-heart', label: 'Price: hearts', category: 'hud', extract: { method: 'art', art: 'currency-heart' } },
  {
    file: 'currency-red-potion', label: 'Price: red potion', category: 'hud',
    extract: { method: 'art', art: 'currency-red-potion' },
  },
  {
    file: 'currency-green-potion', label: 'Price: green potion', category: 'hud',
    extract: { method: 'art', art: 'currency-green-potion' },
  },
  {
    file: 'currency-blue-potion', label: 'Price: blue potion', category: 'hud',
    extract: { method: 'art', art: 'currency-blue-potion' },
  },
  { file: 'currency-fairy', label: 'Price: fairy', category: 'hud', extract: { method: 'art', art: 'currency-fairy' } },
  { file: 'currency-bee', label: 'Price: bee', category: 'hud', extract: { method: 'art', art: 'currency-bee' } },
];

export { RANDOMIZER_SPRITE_DEFINITIONS };
