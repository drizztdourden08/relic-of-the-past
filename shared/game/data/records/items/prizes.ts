/* @layer shared-game @kind data */

import type { ItemRecord } from '@shared/game/data/types';

/**
 * The ten dungeon prizes. Each pendant has its own native receive id and the native grant
 * sets a fixed bit for it, so a pendant is an ordinary item wherever it lands. The seven
 * crystals share one native id and the room decides which bit banks, so they carry none.
 */
const PRIZES_ITEMS: ItemRecord[] = [
  {
    id: 'item-056',
    gameId: { receiveItemId: 55 },
    origin: 'vanilla',
    category: 'crystal',
    name: 'Green Pendant',
    spriteId: 'sprite-hud-green-pendant',
  },
  {
    id: 'item-057',
    gameId: { receiveItemId: 56 },
    origin: 'vanilla',
    category: 'crystal',
    name: 'Red Pendant',
    spriteId: 'sprite-hud-red-pendant',
  },
  {
    id: 'item-058',
    gameId: { receiveItemId: 57 },
    origin: 'vanilla',
    category: 'crystal',
    name: 'Blue Pendant',
    spriteId: 'sprite-hud-blue-pendant',
  },
  {
    id: 'item-112',
    origin: 'vanilla',
    category: 'crystal',
    name: 'Crystal 1',
    spriteId: 'sprite-hud-crystal',
  },
  {
    id: 'item-113',
    origin: 'vanilla',
    category: 'crystal',
    name: 'Crystal 2',
    spriteId: 'sprite-hud-crystal',
  },
  {
    id: 'item-114',
    origin: 'vanilla',
    category: 'crystal',
    name: 'Crystal 3',
    spriteId: 'sprite-hud-crystal',
  },
  {
    id: 'item-115',
    origin: 'vanilla',
    category: 'crystal',
    name: 'Crystal 4',
    spriteId: 'sprite-hud-crystal',
  },
  {
    id: 'item-116',
    origin: 'vanilla',
    category: 'crystal',
    name: 'Crystal 5',
    spriteId: 'sprite-hud-crystal',
  },
  {
    id: 'item-117',
    origin: 'vanilla',
    category: 'crystal',
    name: 'Crystal 6',
    spriteId: 'sprite-hud-crystal',
  },
  {
    id: 'item-118',
    origin: 'vanilla',
    category: 'crystal',
    name: 'Crystal 7',
    spriteId: 'sprite-hud-crystal',
  },
];

export { PRIZES_ITEMS };
