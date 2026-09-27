/* @layer shared-game @kind data */
/** The stage events of palace-of-darkness. */

import type { CheckRecord } from '@shared/game/data/types';
import { canSeeInDarkRooms } from '@shared/game/data/requirements/helpers';
import { EVENT_BIT as E } from '../event-bits';
import { eventRecord } from '../event-record';

const PALACE_OF_DARKNESS_EVENTS: CheckRecord[] = [
  eventRecord({ n: 100, name: 'Palace of Darkness: started', group: 'dungeon', dungeonId: 'dungeon-006', gameId: { roomId: 0x4a, mask: 0x0f } }),
  eventRecord({ n: 101, name: 'Palace of Darkness: Big Key door unlocked', group: 'dungeon', dungeonId: 'dungeon-006', gameId: { roomId: 0x6a, mask: 0x8000 },
    requirements: { itemId: 'item-091' } }),
  eventRecord({ n: 102, name: 'Palace of Darkness: boss reached', group: 'dungeon', dungeonId: 'dungeon-006', gameId: { roomId: 0x5a, mask: 0x0f },
    requirements: { allOf: [{ itemId: 'item-091' }, { allOf: [{ itemId: 'item-010' }, { itemId: 'item-012' }, canSeeInDarkRooms] }] } }),
  eventRecord({ n: 103, name: 'Palace of Darkness: Helmasaur King beaten', group: 'dungeon', dungeonId: 'dungeon-006', gameId: { eventBit: E.bossKilled(6) },
    fallback: { checkId: 'check-404' }, requirements: { allOf: [{ itemId: 'item-091' }, { allOf: [{ itemId: 'item-010' }, { itemId: 'item-012' }, canSeeInDarkRooms] }] } }),
  eventRecord({ n: 104, name: 'Palace of Darkness: heart container taken', group: 'dungeon', dungeonId: 'dungeon-006', gameId: { roomId: 0x5a, mask: 0x800 },
    requirements: { checkId: 'check-403' } }),
  eventRecord({ n: 105, name: 'Palace of Darkness: reward taken', group: 'dungeon', dungeonId: 'dungeon-006', gameId: { eventBit: E.prizeTaken(6) },
    fallback: { allOf: [{ checkId: 'check-404' }, { itemId: 'item-112' }] }, requirements: { checkId: 'check-404' } }),
  eventRecord({ n: 106, name: 'Palace of Darkness: all chests opened', group: 'dungeon', dungeonId: 'dungeon-006',
    derivedDungeon: { dungeonId: 'dungeon-006', kinds: ['chest'] } }),
  eventRecord({ n: 107, name: 'Palace of Darkness: all keys collected', group: 'dungeon', dungeonId: 'dungeon-006',
    derivedDungeon: { dungeonId: 'dungeon-006', kinds: ['keyDrop', 'potItem'], tag: 'content:key' } }),
  eventRecord({ n: 108, name: 'Palace of Darkness: cleared', group: 'dungeon', dungeonId: 'dungeon-006',
    derived: { allOf: [{ checkId: 'check-406' }, { checkId: 'check-407' }, { checkId: 'check-403' }, { checkId: 'check-401' }, { checkId: 'check-404' }, { checkId: 'check-405' }] } }),
];

export { PALACE_OF_DARKNESS_EVENTS };
