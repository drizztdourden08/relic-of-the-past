/* @layer shared-game @kind data */
import type { EventSpec } from '../../../../checks/event-spec.type';
import { BOSS_KILLED_BIT } from '../../../../checks/indexed-event-bits.constants';
import { canSeeInDarkRooms, hasSword } from '../../../../requirements/helpers';

const CASTLE_TOWER_EVENTS: EventSpec[] = [
  { n: 90, name: "Agahnim's Tower: started", group: 'dungeon', dungeonId: 'dungeon-002', gameId: { roomId: 0xe0, mask: 0x0f } },
  { n: 92, name: "Agahnim's Tower: boss reached", group: 'dungeon', dungeonId: 'dungeon-002', gameId: { roomId: 0x20, mask: 0x0f },
    requirements: { allOf: [hasSword, canSeeInDarkRooms] } },
  { n: 93, name: "Agahnim's Tower: Agahnim beaten", group: 'dungeon', dungeonId: 'dungeon-002', gameId: { eventBit: BOSS_KILLED_BIT[4] },
    requirements: { allOf: [hasSword, canSeeInDarkRooms] } },
  { n: 94, name: "Agahnim's Tower: heart container taken", group: 'dungeon', dungeonId: 'dungeon-002', gameId: { roomId: 0x20, mask: 0x800 },
    requirements: { checkId: 'check-393' } },
  { n: 96, name: "Agahnim's Tower: all chests opened", group: 'dungeon', dungeonId: 'dungeon-002',
    derivedDungeon: { dungeonId: 'dungeon-002', kinds: ['chest'] } },
  { n: 97, name: "Agahnim's Tower: all keys collected", group: 'dungeon', dungeonId: 'dungeon-002',
    derivedDungeon: { dungeonId: 'dungeon-002', kinds: ['keyDrop', 'potItem'], tag: 'content:key' } },
  { n: 98, name: "Agahnim's Tower: cleared", group: 'dungeon', dungeonId: 'dungeon-002',
    derived: { allOf: [{ checkId: 'check-396' }, { checkId: 'check-397' }, { checkId: 'check-393' }] } },
];

export { CASTLE_TOWER_EVENTS };
