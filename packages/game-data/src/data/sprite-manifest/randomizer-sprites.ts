/* @layer shared-game @kind data */
import { msg } from '@drizztdourden08/brock-core/i18n';
import type { Message } from '@drizztdourden08/brock-core/i18n';
import type { SpriteDefinition } from './manifest';

const currencySprite = (art: string, label: Message): SpriteDefinition => ({
  file: art,
  label,
  category: 'hud',
  extract: { method: 'art', art },
});

const RANDOMIZER_SPRITE_DEFINITIONS: readonly SpriteDefinition[] = [
  {
    file: 'quiver',
    label: msg('game-labels:sprite.quiver'),
    category: 'receipt',
    extract: { method: 'art', art: 'quiver' },
  },
  currencySprite('currency-rupee', msg('game-labels:sprite.priceRupees')),
  currencySprite('currency-arrow', msg('game-labels:sprite.priceArrows')),
  currencySprite('currency-bomb', msg('game-labels:sprite.priceBombs')),
  currencySprite('currency-heart', msg('game-labels:sprite.priceHearts')),
  currencySprite('currency-red-potion', msg('game-labels:sprite.priceRedPotion')),
  currencySprite('currency-green-potion', msg('game-labels:sprite.priceGreenPotion')),
  currencySprite('currency-blue-potion', msg('game-labels:sprite.priceBluePotion')),
  currencySprite('currency-fairy', msg('game-labels:sprite.priceFairy')),
  currencySprite('currency-bee', msg('game-labels:sprite.priceBee')),
];

export { RANDOMIZER_SPRITE_DEFINITIONS };
