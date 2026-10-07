/* @layer shared-game @kind data */
/** The stage events of castle-tower. */

import type { CheckRecord } from '@shared/game/data/types';
import { canSeeInDarkRooms, hasSword } from '@shared/game/data/requirements/helpers';
import { EVENT_BIT as E } from '../event-bits';
import { eventRecord } from '../event-record';

const CASTLE_TOWER_EVENTS: CheckRecord[] = [
  eventRecord({ n: 90, name: "Agahnim's Tower: started", group: 'dungeon', dungeonId: 'dungeon-002', gameId: { roomId: 0xe0, mask: 0x0f } }),
  eventRecord({ n: 92, name: "Agahnim's Tower: boss reached", group: 'dungeon', dungeonId: 'dungeon-002', gameId: { roomId: 0x20, mask: 0x0f },
    requirements: { allOf: [hasSword, canSeeInDarkRooms] } }),
  eventRecord({ n: 93, name: "Agahnim's Tower: Agahnim beaten", group: 'dungeon', dungeonId: 'dungeon-002', gameId: { eventBit: E.bossKilled(4) },
    requirements: { allOf: [hasSword, canSeeInDarkRooms] } }),
  eventRecord({ n: 94, name: "Agahnim's Tower: heart container taken", group: 'dungeon', dungeonId: 'dungeon-002', gameId: { roomId: 0x20, mask: 0x800 },
    requirements: { checkId: 'check-393' } }),
  eventRecord({ n: 96, name: "Agahnim's Tower: all chests opened", group: 'dungeon', dungeonId: 'dungeon-002',
    derivedDungeon: { dungeonId: 'dungeon-002', kinds: ['chest'] } }),
  eventRecord({ n: 97, name: "Agahnim's Tower: all keys collected", group: 'dungeon', dungeonId: 'dungeon-002',
    derivedDungeon: { dungeonId: 'dungeon-002', kinds: ['keyDrop', 'potItem'], tag: 'content:key' } }),
  eventRecord({ n: 98, name: "Agahnim's Tower: cleared", group: 'dungeon', dungeonId: 'dungeon-002',
    derived: { allOf: [{ checkId: 'check-396' }, { checkId: 'check-397' }, { checkId: 'check-393' }] } }),
];

export { CASTLE_TOWER_EVENTS };
