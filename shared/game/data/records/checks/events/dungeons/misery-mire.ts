/* @layer shared-game @kind data */
import type { EventSpec } from '@shared/game/data/checks/event-spec.type';
import { BOSS_KILLED_BIT, PRIZE_TAKEN_BIT } from '@shared/game/data/checks/indexed-event-bits.constants';
import { canKillMostThings, canSeeInDarkRooms } from '@shared/game/data/requirements/helpers';

const MISERY_MIRE_EVENTS: EventSpec[] = [
  { n: 150, name: 'Misery Mire: started', group: 'dungeon', dungeonId: 'dungeon-011', gameId: { roomId: 0x98, mask: 0x0f } },
  { n: 151, name: 'Misery Mire: Big Key door unlocked', group: 'dungeon', dungeonId: 'dungeon-011', gameId: { roomId: 0xa0, mask: 0x8000 },
    requirements: { itemId: 'item-090' } },
  { n: 152, name: 'Misery Mire: boss reached', group: 'dungeon', dungeonId: 'dungeon-011', gameId: { roomId: 0x90, mask: 0x0f },
    requirements: { allOf: [{ itemId: 'item-090' }, { allOf: [{ itemId: 'item-022' }, canSeeInDarkRooms, canKillMostThings] }] } },
  { n: 153, name: 'Misery Mire: Vitreous beaten', group: 'dungeon', dungeonId: 'dungeon-011', gameId: { eventBit: BOSS_KILLED_BIT[7] },
    requirements: { allOf: [{ itemId: 'item-090' }, { allOf: [{ itemId: 'item-022' }, canSeeInDarkRooms, canKillMostThings] }] } },
  { n: 154, name: 'Misery Mire: heart container taken', group: 'dungeon', dungeonId: 'dungeon-011', gameId: { roomId: 0x90, mask: 0x800 },
    requirements: { checkId: 'check-453' } },
  { n: 155, name: 'Misery Mire: reward taken', group: 'dungeon', dungeonId: 'dungeon-011', gameId: { eventBit: PRIZE_TAKEN_BIT[7] },
    requirements: { checkId: 'check-454' } },
  { n: 156, name: 'Misery Mire: all chests opened', group: 'dungeon', dungeonId: 'dungeon-011',
    derivedDungeon: { dungeonId: 'dungeon-011', kinds: ['chest'] } },
  { n: 157, name: 'Misery Mire: all keys collected', group: 'dungeon', dungeonId: 'dungeon-011',
    derivedDungeon: { dungeonId: 'dungeon-011', kinds: ['keyDrop', 'potItem'], tag: 'content:key' } },
  { n: 158, name: 'Misery Mire: cleared', group: 'dungeon', dungeonId: 'dungeon-011',
    derived: { allOf: [{ checkId: 'check-456' }, { checkId: 'check-457' }, { checkId: 'check-453' }, { checkId: 'check-451' }, { checkId: 'check-454' }, { checkId: 'check-455' }] } },
];

export { MISERY_MIRE_EVENTS };
