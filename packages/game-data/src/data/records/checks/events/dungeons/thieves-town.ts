/* @layer shared-game @kind data */
import type { EventSpec } from '../../../../checks/event-spec.type';
import { BOSS_KILLED_BIT, PRIZE_TAKEN_BIT } from '../../../../checks/indexed-event-bits.constants';
import { canKillMostThings } from '../../../../requirements/helpers';

const THIEVES_TOWN_EVENTS: EventSpec[] = [
  { n: 130, name: "Thieves' Town: started", group: 'dungeon', dungeonId: 'dungeon-009', gameId: { roomId: 0xdb, mask: 0x0f } },
  { n: 131, name: "Thieves' Town: Big Key door unlocked", group: 'dungeon', dungeonId: 'dungeon-009', gameId: { roomId: 0xcc, mask: 0x8000 },
    requirements: { itemId: 'item-086' } },
  { n: 132, name: "Thieves' Town: boss reached", group: 'dungeon', dungeonId: 'dungeon-009', gameId: { roomId: 0xac, mask: 0x0f },
    requirements: { allOf: [{ itemId: 'item-086' }, canKillMostThings] } },
  { n: 133, name: "Thieves' Town: Blind beaten", group: 'dungeon', dungeonId: 'dungeon-009', gameId: { eventBit: BOSS_KILLED_BIT[11] },
    requirements: { allOf: [{ itemId: 'item-086' }, canKillMostThings] } },
  { n: 134, name: "Thieves' Town: heart container taken", group: 'dungeon', dungeonId: 'dungeon-009', gameId: { roomId: 0xac, mask: 0x800 },
    requirements: { checkId: 'check-433' } },
  { n: 135, name: "Thieves' Town: reward taken", group: 'dungeon', dungeonId: 'dungeon-009', gameId: { eventBit: PRIZE_TAKEN_BIT[11] },
    requirements: { checkId: 'check-434' } },
  { n: 136, name: "Thieves' Town: all chests opened", group: 'dungeon', dungeonId: 'dungeon-009',
    derivedDungeon: { dungeonId: 'dungeon-009', kinds: ['chest'] } },
  { n: 137, name: "Thieves' Town: all keys collected", group: 'dungeon', dungeonId: 'dungeon-009',
    derivedDungeon: { dungeonId: 'dungeon-009', kinds: ['keyDrop', 'potItem'], tag: 'content:key' } },
  { n: 138, name: "Thieves' Town: cleared", group: 'dungeon', dungeonId: 'dungeon-009',
    derived: { allOf: [{ checkId: 'check-436' }, { checkId: 'check-437' }, { checkId: 'check-433' }, { checkId: 'check-431' }, { checkId: 'check-434' }, { checkId: 'check-435' }] } },
  { n: 186, name: "Thieves' Town: attic floor bombed", group: 'dungeon', dungeonId: 'dungeon-009', gameId: { roomId: 0x65, mask: 0x100 } },
];

export { THIEVES_TOWN_EVENTS };
