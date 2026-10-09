/* @layer shared-game @kind data */
import type { EventSpec } from '../../../../checks/event-spec.type';
import { BOSS_KILLED_BIT, PRIZE_TAKEN_BIT, SKULL_WOODS_ENTRANCE_BIT } from '../../../../checks/indexed-event-bits.constants';
import { hasSword } from '../../../../requirements/helpers';

const SKULL_WOODS_EVENTS: EventSpec[] = [
  { n: 120, name: 'Skull Woods: started', group: 'dungeon', dungeonId: 'dungeon-008', gameId: { roomId: 0x58, mask: 0x0f } },
  { n: 122, name: 'Skull Woods: boss reached', group: 'dungeon', dungeonId: 'dungeon-008', gameId: { roomId: 0x29, mask: 0x0f },
    requirements: { allOf: [{ itemId: 'item-089' }, { allOf: [{ itemId: 'item-008' }, hasSword, { checkId: 'check-484' }] }] } },
  { n: 123, name: 'Skull Woods: Mothula beaten', group: 'dungeon', dungeonId: 'dungeon-008', gameId: { eventBit: BOSS_KILLED_BIT[8] },
    requirements: { allOf: [{ itemId: 'item-089' }, { allOf: [{ itemId: 'item-008' }, hasSword, { checkId: 'check-484' }] }] } },
  { n: 124, name: 'Skull Woods: heart container taken', group: 'dungeon', dungeonId: 'dungeon-008', gameId: { roomId: 0x29, mask: 0x800 },
    requirements: { checkId: 'check-423' } },
  { n: 125, name: 'Skull Woods: reward taken', group: 'dungeon', dungeonId: 'dungeon-008', gameId: { eventBit: PRIZE_TAKEN_BIT[8] },
    requirements: { checkId: 'check-424' } },
  { n: 126, name: 'Skull Woods: all chests opened', group: 'dungeon', dungeonId: 'dungeon-008',
    derivedDungeon: { dungeonId: 'dungeon-008', kinds: ['chest'] } },
  { n: 127, name: 'Skull Woods: all keys collected', group: 'dungeon', dungeonId: 'dungeon-008',
    derivedDungeon: { dungeonId: 'dungeon-008', kinds: ['keyDrop', 'potItem'], tag: 'content:key' } },
  { n: 128, name: 'Skull Woods: cleared', group: 'dungeon', dungeonId: 'dungeon-008',
    derived: { allOf: [{ checkId: 'check-426' }, { checkId: 'check-427' }, { checkId: 'check-423' }, { checkId: 'check-424' }, { checkId: 'check-425' }] } },
  { n: 184, name: 'Skull Woods: back section entered', group: 'dungeon', dungeonId: 'dungeon-008', gameId: { roomId: 0x59, mask: 0x0f },
    requirements: { allOf: [{ itemId: 'item-032' }, { checkId: 'check-343' }] } },
  { n: 193, name: 'Skull Woods: front entrance 1 used', group: 'dungeon', dungeonId: 'dungeon-008',
    gameId: { eventBit: SKULL_WOODS_ENTRANCE_BIT[0] } },
  { n: 194, name: 'Skull Woods: front entrance 2 used', group: 'dungeon', dungeonId: 'dungeon-008',
    gameId: { eventBit: SKULL_WOODS_ENTRANCE_BIT[1] } },
  { n: 195, name: 'Skull Woods: front entrance 3 used', group: 'dungeon', dungeonId: 'dungeon-008',
    gameId: { eventBit: SKULL_WOODS_ENTRANCE_BIT[2] } },
  { n: 196, name: 'Skull Woods: front entrance 4 used', group: 'dungeon', dungeonId: 'dungeon-008',
    gameId: { eventBit: SKULL_WOODS_ENTRANCE_BIT[3] } },
  { n: 197, name: 'Skull Woods: front entrance 5 used', group: 'dungeon', dungeonId: 'dungeon-008',
    gameId: { eventBit: SKULL_WOODS_ENTRANCE_BIT[4] } },
];

export { SKULL_WOODS_EVENTS };
