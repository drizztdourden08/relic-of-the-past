/* @layer shared-game @kind data */
import type { EventSpec } from '../../../../checks/event-spec.type';
import { BOSS_KILLED_BIT, PRIZE_TAKEN_BIT } from '../../../../checks/indexed-event-bits.constants';
import { canSeeInDarkRooms } from '../../../../requirements/helpers';

const PALACE_OF_DARKNESS_EVENTS: EventSpec[] = [
  { n: 100, name: 'Palace of Darkness: started', group: 'dungeon', dungeonId: 'dungeon-006', gameId: { roomId: 0x4a, mask: 0x0f } },
  { n: 101, name: 'Palace of Darkness: Big Key door unlocked', group: 'dungeon', dungeonId: 'dungeon-006', gameId: { roomId: 0x6a, mask: 0x8000 },
    requirements: { itemId: 'item-091' } },
  { n: 102, name: 'Palace of Darkness: boss reached', group: 'dungeon', dungeonId: 'dungeon-006', gameId: { roomId: 0x5a, mask: 0x0f },
    requirements: { allOf: [{ itemId: 'item-091' }, { allOf: [{ itemId: 'item-010' }, { itemId: 'item-012' }, canSeeInDarkRooms] }] } },
  { n: 103, name: 'Palace of Darkness: Helmasaur King beaten', group: 'dungeon', dungeonId: 'dungeon-006', gameId: { eventBit: BOSS_KILLED_BIT[6] },
    requirements: { allOf: [{ itemId: 'item-091' }, { allOf: [{ itemId: 'item-010' }, { itemId: 'item-012' }, canSeeInDarkRooms] }] } },
  { n: 104, name: 'Palace of Darkness: heart container taken', group: 'dungeon', dungeonId: 'dungeon-006', gameId: { roomId: 0x5a, mask: 0x800 },
    requirements: { checkId: 'check-403' } },
  { n: 105, name: 'Palace of Darkness: reward taken', group: 'dungeon', dungeonId: 'dungeon-006', gameId: { eventBit: PRIZE_TAKEN_BIT[6] },
    requirements: { checkId: 'check-404' } },
  { n: 106, name: 'Palace of Darkness: all chests opened', group: 'dungeon', dungeonId: 'dungeon-006',
    derivedDungeon: { dungeonId: 'dungeon-006', kinds: ['chest'] } },
  { n: 107, name: 'Palace of Darkness: all keys collected', group: 'dungeon', dungeonId: 'dungeon-006',
    derivedDungeon: { dungeonId: 'dungeon-006', kinds: ['keyDrop', 'potItem'], tag: 'content:key' } },
  { n: 108, name: 'Palace of Darkness: cleared', group: 'dungeon', dungeonId: 'dungeon-006',
    derived: { allOf: [{ checkId: 'check-406' }, { checkId: 'check-407' }, { checkId: 'check-403' }, { checkId: 'check-401' }, { checkId: 'check-404' }, { checkId: 'check-405' }] } },
];

export { PALACE_OF_DARKNESS_EVENTS };
