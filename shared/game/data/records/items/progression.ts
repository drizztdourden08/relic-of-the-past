/* @layer shared-game @kind data */

import type { ItemRecord } from '@shared/game/data/types';

const PROGRESSION_ITEMS: ItemRecord[] = [
  {
    id: 'item-016',
    gameId: { receiveItemId: 15 },
    origin: 'vanilla',
    category: 'medallion',
    name: 'Bombos',
    spendsMeter: true,
    spriteId: 'sprite-hud-bombos',
    poolClass: 'progression',
  },
  {
    id: 'item-017',
    gameId: { receiveItemId: 16 },
    origin: 'vanilla',
    category: 'medallion',
    name: 'Ether',
    spendsMeter: true,
    spriteId: 'sprite-hud-ether',
    poolClass: 'progression',
  },
  {
    id: 'item-018',
    gameId: { receiveItemId: 17 },
    origin: 'vanilla',
    category: 'medallion',
    name: 'Quake',
    spendsMeter: true,
    spriteId: 'sprite-hud-quake',
    poolClass: 'progression',
  },
  {
    id: 'item-174',
    origin: 'randomizer',
    category: 'event',
    name: 'Triforce Piece',
  },
];

export { PROGRESSION_ITEMS };
