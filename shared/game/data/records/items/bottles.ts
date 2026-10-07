/* @layer shared-game @kind data */

import type { ItemRecord } from '@shared/game/data/types';

const BOTTLES_ITEMS: ItemRecord[] = [
  {
    id: 'item-023',
    gameId: { receiveItemId: 22 },
    origin: 'vanilla',
    category: 'bottle',
    name: 'Bottle',
    spriteId: 'sprite-hud-bottle',
    poolClass: 'progression',
  },
  {
    id: 'item-044',
    gameId: { receiveItemId: 43 },
    origin: 'vanilla',
    category: 'bottle',
    name: 'Bottle (Red Potion)',
    spriteId: 'sprite-hud-bottle-red',
    poolClass: 'progression',
  },
  {
    id: 'item-045',
    gameId: { receiveItemId: 44 },
    origin: 'vanilla',
    category: 'bottle',
    name: 'Bottle (Green Potion)',
    spriteId: 'sprite-hud-bottle-green',
    poolClass: 'progression',
  },
  {
    id: 'item-046',
    gameId: { receiveItemId: 45 },
    origin: 'vanilla',
    category: 'bottle',
    name: 'Bottle (Blue Potion)',
    spriteId: 'sprite-hud-bottle-blue',
    poolClass: 'progression',
  },
  {
    id: 'item-062',
    gameId: { receiveItemId: 61 },
    origin: 'vanilla',
    category: 'bottle',
    name: 'Bottle (Fairy)',
    spriteId: 'sprite-hud-bottle-fairy',
    poolClass: 'progression',
  },
  {
    id: 'item-061',
    gameId: { receiveItemId: 60 },
    origin: 'vanilla',
    category: 'bottle',
    name: 'Bottle (Bee)',
    spriteId: 'sprite-hud-bottle-bee',
    poolClass: 'progression',
  },
  {
    id: 'item-073',
    gameId: { receiveItemId: 72 },
    origin: 'vanilla',
    category: 'bottle',
    name: 'Bottle (Good Bee)',
    spriteId: 'sprite-hud-bottle-good-bee',
    poolClass: 'progression',
  },
];

export { BOTTLES_ITEMS };
