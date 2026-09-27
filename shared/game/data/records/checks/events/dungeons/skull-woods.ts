/* @layer shared-game @kind data */
/** The stage events of skull-woods. */

import type { CheckRecord } from '@shared/game/data/types';
import { hasSword } from '@shared/game/data/requirements/helpers';
import { EVENT_BIT as E } from '../event-bits';
import { eventRecord } from '../event-record';

const SKULL_WOODS_EVENTS: CheckRecord[] = [
  eventRecord({ n: 120, name: 'Skull Woods: started', group: 'dungeon', dungeonId: 'dungeon-008', gameId: { roomId: 0x58, mask: 0x0f } }),
  eventRecord({ n: 122, name: 'Skull Woods: boss reached', group: 'dungeon', dungeonId: 'dungeon-008', gameId: { roomId: 0x29, mask: 0x0f },
    requirements: { allOf: [{ itemId: 'item-089' }, { allOf: [{ itemId: 'item-008' }, hasSword, { checkId: 'check-484' }] }] } }),
  eventRecord({ n: 123, name: 'Skull Woods: Mothula beaten', group: 'dungeon', dungeonId: 'dungeon-008', gameId: { eventBit: E.bossKilled(8) },
    fallback: { checkId: 'check-424' }, requirements: { allOf: [{ itemId: 'item-089' }, { allOf: [{ itemId: 'item-008' }, hasSword, { checkId: 'check-484' }] }] } }),
  eventRecord({ n: 124, name: 'Skull Woods: heart container taken', group: 'dungeon', dungeonId: 'dungeon-008', gameId: { roomId: 0x29, mask: 0x800 },
    requirements: { checkId: 'check-423' } }),
  eventRecord({ n: 125, name: 'Skull Woods: reward taken', group: 'dungeon', dungeonId: 'dungeon-008', gameId: { eventBit: E.prizeTaken(8) },
    fallback: { allOf: [{ checkId: 'check-424' }, { itemId: 'item-114' }] }, requirements: { checkId: 'check-424' } }),
  eventRecord({ n: 126, name: 'Skull Woods: all chests opened', group: 'dungeon', dungeonId: 'dungeon-008',
    derivedDungeon: { dungeonId: 'dungeon-008', kinds: ['chest'] } }),
  eventRecord({ n: 127, name: 'Skull Woods: all keys collected', group: 'dungeon', dungeonId: 'dungeon-008',
    derivedDungeon: { dungeonId: 'dungeon-008', kinds: ['keyDrop', 'potItem'], tag: 'content:key' } }),
  eventRecord({ n: 128, name: 'Skull Woods: cleared', group: 'dungeon', dungeonId: 'dungeon-008',
    derived: { allOf: [{ checkId: 'check-426' }, { checkId: 'check-427' }, { checkId: 'check-423' }, { checkId: 'check-424' }, { checkId: 'check-425' }] } }),
  eventRecord({ n: 184, name: 'Skull Woods: back section entered', group: 'dungeon', dungeonId: 'dungeon-008', gameId: { roomId: 0x59, mask: 0x0f },
    requirements: { allOf: [{ itemId: 'item-032' }, { checkId: 'check-343' }] } }),
  eventRecord({ n: 193, name: 'Skull Woods: front entrance 1 used', group: 'dungeon', dungeonId: 'dungeon-008',
    gameId: { eventBit: E.skullWoodsEntrance(0) } }),
  eventRecord({ n: 194, name: 'Skull Woods: front entrance 2 used', group: 'dungeon', dungeonId: 'dungeon-008',
    gameId: { eventBit: E.skullWoodsEntrance(1) } }),
  eventRecord({ n: 195, name: 'Skull Woods: front entrance 3 used', group: 'dungeon', dungeonId: 'dungeon-008',
    gameId: { eventBit: E.skullWoodsEntrance(2) } }),
  eventRecord({ n: 196, name: 'Skull Woods: front entrance 4 used', group: 'dungeon', dungeonId: 'dungeon-008',
    gameId: { eventBit: E.skullWoodsEntrance(3) } }),
  eventRecord({ n: 197, name: 'Skull Woods: front entrance 5 used', group: 'dungeon', dungeonId: 'dungeon-008',
    gameId: { eventBit: E.skullWoodsEntrance(4) } }),
];

export { SKULL_WOODS_EVENTS };
