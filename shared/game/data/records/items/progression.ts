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
    id: 'item-119',
    origin: 'vanilla',
    category: 'event',
    name: 'Beat Agahnim 1',
  },
  {
    id: 'item-120',
    origin: 'vanilla',
    category: 'event',
    name: 'Beat Agahnim 2',
  },
  {
    id: 'item-121',
    origin: 'vanilla',
    category: 'event',
    name: 'Get Frog',
  },
  {
    id: 'item-122',
    origin: 'vanilla',
    category: 'event',
    name: 'Return Smith',
  },
  {
    id: 'item-123',
    origin: 'vanilla',
    category: 'event',
    name: 'Pick Up Purple Chest',
  },
  {
    id: 'item-124',
    origin: 'vanilla',
    category: 'event',
    name: 'Open Floodgate',
  },
  {
    id: 'item-075',
    gameId: { receiveItemId: 74 },
    origin: 'vanilla',
    category: 'event',
    name: 'Activated Flute',
    spriteId: 'sprite-receipt-activated-flute',
  },
  {
    id: 'item-173',
    origin: 'randomizer',
    category: 'event',
    name: 'Triforce',
  },
  {
    id: 'item-174',
    origin: 'randomizer',
    category: 'event',
    name: 'Triforce Piece',
  },
];

export { PROGRESSION_ITEMS };
