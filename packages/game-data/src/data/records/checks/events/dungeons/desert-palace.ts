/* @layer shared-game @kind data */
import type { EventSpec } from '../../../../checks/event-spec.type';
import { BOSS_KILLED_BIT, PRIZE_TAKEN_BIT } from '../../../../checks/indexed-event-bits.constants';
import { canKillMostThings, hasFireSource } from '../../../../requirements/helpers';

const DESERT_PALACE_EVENTS: EventSpec[] = [
  { n: 70, name: 'Desert Palace: started', group: 'dungeon', dungeonId: 'dungeon-004', gameId: { roomId: 0x84, mask: 0x0f } },
  { n: 71, name: 'Desert Palace: Big Key door unlocked', group: 'dungeon', dungeonId: 'dungeon-004', gameId: { roomId: 0x43, mask: 0x8000 },
    requirements: { itemId: 'item-093' } },
  { n: 72, name: 'Desert Palace: boss reached', group: 'dungeon', dungeonId: 'dungeon-004', gameId: { roomId: 0x33, mask: 0x0f },
    requirements: { allOf: [{ itemId: 'item-093' }, { allOf: [canKillMostThings, hasFireSource] }] } },
  { n: 73, name: 'Desert Palace: Lanmolas beaten', group: 'dungeon', dungeonId: 'dungeon-004', gameId: { eventBit: BOSS_KILLED_BIT[3] },
    requirements: { allOf: [{ itemId: 'item-093' }, { allOf: [canKillMostThings, hasFireSource] }] } },
  { n: 74, name: 'Desert Palace: heart container taken', group: 'dungeon', dungeonId: 'dungeon-004', gameId: { roomId: 0x33, mask: 0x800 },
    requirements: { checkId: 'check-373' } },
  { n: 75, name: 'Desert Palace: reward taken', group: 'dungeon', dungeonId: 'dungeon-004', gameId: { eventBit: PRIZE_TAKEN_BIT[3] },
    requirements: { checkId: 'check-374' } },
  { n: 76, name: 'Desert Palace: all chests opened', group: 'dungeon', dungeonId: 'dungeon-004',
    derivedDungeon: { dungeonId: 'dungeon-004', kinds: ['chest'] } },
  { n: 77, name: 'Desert Palace: all keys collected', group: 'dungeon', dungeonId: 'dungeon-004',
    derivedDungeon: { dungeonId: 'dungeon-004', kinds: ['keyDrop', 'potItem'], tag: 'content:key' } },
  { n: 78, name: 'Desert Palace: cleared', group: 'dungeon', dungeonId: 'dungeon-004',
    derived: { allOf: [{ checkId: 'check-376' }, { checkId: 'check-377' }, { checkId: 'check-373' }, { checkId: 'check-371' }, { checkId: 'check-374' }, { checkId: 'check-375' }] } },
  { n: 183, name: 'Desert Palace: back section entered', group: 'dungeon', dungeonId: 'dungeon-004', gameId: { roomId: 0x63, mask: 0x0f } },
];

export { DESERT_PALACE_EVENTS };
