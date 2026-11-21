/* @layer shared-game @kind data */
import type { SpriteDefinition } from './manifest';

const RANDOMIZER_SPRITE_DEFINITIONS: readonly SpriteDefinition[] = [
  {
    file: 'quiver',
    label: { key: 'game-labels:sprite.quiver' },
    category: 'receipt',
    extract: { method: 'art', art: 'quiver' },
  },
  {
    file: 'currency-rupee',
    label: { key: 'game-labels:sprite.priceRupees' },
    category: 'hud',
    extract: { method: 'art', art: 'currency-rupee' },
  },
  {
    file: 'currency-arrow',
    label: { key: 'game-labels:sprite.priceArrows' },
    category: 'hud',
    extract: { method: 'art', art: 'currency-arrow' },
  },
  {
    file: 'currency-bomb',
    label: { key: 'game-labels:sprite.priceBombs' },
    category: 'hud',
    extract: { method: 'art', art: 'currency-bomb' },
  },
  {
    file: 'currency-heart',
    label: { key: 'game-labels:sprite.priceHearts' },
    category: 'hud',
    extract: { method: 'art', art: 'currency-heart' },
  },
  {
    file: 'currency-red-potion',
    label: { key: 'game-labels:sprite.priceRedPotion' },
    category: 'hud',
    extract: { method: 'art', art: 'currency-red-potion' },
  },
  {
    file: 'currency-green-potion',
    label: { key: 'game-labels:sprite.priceGreenPotion' },
    category: 'hud',
    extract: { method: 'art', art: 'currency-green-potion' },
  },
  {
    file: 'currency-blue-potion',
    label: { key: 'game-labels:sprite.priceBluePotion' },
    category: 'hud',
    extract: { method: 'art', art: 'currency-blue-potion' },
  },
  {
    file: 'currency-fairy',
    label: { key: 'game-labels:sprite.priceFairy' },
    category: 'hud',
    extract: { method: 'art', art: 'currency-fairy' },
  },
  {
    file: 'currency-bee',
    label: { key: 'game-labels:sprite.priceBee' },
    category: 'hud',
    extract: { method: 'art', art: 'currency-bee' },
  },
];

export { RANDOMIZER_SPRITE_DEFINITIONS };
