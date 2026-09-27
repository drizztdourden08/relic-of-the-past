/* @layer shared-game @kind data */
/** The stage events of misery-mire. */

import type { CheckRecord } from '@shared/game/data/types';
import { canKillMostThings, canSeeInDarkRooms } from '@shared/game/data/requirements/helpers';
import { EVENT_BIT as E } from '../event-bits';
import { eventRecord } from '../event-record';

const MISERY_MIRE_EVENTS: CheckRecord[] = [
  eventRecord({ n: 150, name: 'Misery Mire: started', group: 'dungeon', dungeonId: 'dungeon-011', gameId: { roomId: 0x98, mask: 0x0f } }),
  eventRecord({ n: 151, name: 'Misery Mire: Big Key door unlocked', group: 'dungeon', dungeonId: 'dungeon-011', gameId: { roomId: 0xa0, mask: 0x8000 },
    requirements: { itemId: 'item-090' } }),
  eventRecord({ n: 152, name: 'Misery Mire: boss reached', group: 'dungeon', dungeonId: 'dungeon-011', gameId: { roomId: 0x90, mask: 0x0f },
    requirements: { allOf: [{ itemId: 'item-090' }, { allOf: [{ itemId: 'item-022' }, canSeeInDarkRooms, canKillMostThings] }] } }),
  eventRecord({ n: 153, name: 'Misery Mire: Vitreous beaten', group: 'dungeon', dungeonId: 'dungeon-011', gameId: { eventBit: E.bossKilled(7) },
    fallback: { checkId: 'check-454' }, requirements: { allOf: [{ itemId: 'item-090' }, { allOf: [{ itemId: 'item-022' }, canSeeInDarkRooms, canKillMostThings] }] } }),
  eventRecord({ n: 154, name: 'Misery Mire: heart container taken', group: 'dungeon', dungeonId: 'dungeon-011', gameId: { roomId: 0x90, mask: 0x800 },
    requirements: { checkId: 'check-453' } }),
  eventRecord({ n: 155, name: 'Misery Mire: reward taken', group: 'dungeon', dungeonId: 'dungeon-011', gameId: { eventBit: E.prizeTaken(7) },
    fallback: { allOf: [{ checkId: 'check-454' }, { itemId: 'item-117' }] }, requirements: { checkId: 'check-454' } }),
  eventRecord({ n: 156, name: 'Misery Mire: all chests opened', group: 'dungeon', dungeonId: 'dungeon-011',
    derivedDungeon: { dungeonId: 'dungeon-011', kinds: ['chest'] } }),
  eventRecord({ n: 157, name: 'Misery Mire: all keys collected', group: 'dungeon', dungeonId: 'dungeon-011',
    derivedDungeon: { dungeonId: 'dungeon-011', kinds: ['keyDrop', 'potItem'], tag: 'content:key' } }),
  eventRecord({ n: 158, name: 'Misery Mire: cleared', group: 'dungeon', dungeonId: 'dungeon-011',
    derived: { allOf: [{ checkId: 'check-456' }, { checkId: 'check-457' }, { checkId: 'check-453' }, { checkId: 'check-451' }, { checkId: 'check-454' }, { checkId: 'check-455' }] } }),
];

export { MISERY_MIRE_EVENTS };
