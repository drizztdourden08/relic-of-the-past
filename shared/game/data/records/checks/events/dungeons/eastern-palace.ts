/* @layer shared-game @kind data */
import type { EventSpec } from '@shared/game/data/checks/event-spec.type';
import { BOSS_KILLED_BIT, PRIZE_TAKEN_BIT } from '@shared/game/data/checks/indexed-event-bits.constants';
import { hasSword } from '@shared/game/data/requirements/helpers';

const EASTERN_PALACE_EVENTS: EventSpec[] = [
  { n: 60, name: 'Eastern Palace: started', group: 'dungeon', dungeonId: 'dungeon-003', gameId: { roomId: 0xc9, mask: 0x0f } },
  { n: 61, name: 'Eastern Palace: Big Key door unlocked', group: 'dungeon', dungeonId: 'dungeon-003', gameId: { roomId: 0xa9, mask: 0x2000 },
    requirements: { itemId: 'item-094' } },
  { n: 62, name: 'Eastern Palace: boss reached', group: 'dungeon', dungeonId: 'dungeon-003', gameId: { roomId: 0xc8, mask: 0x0f },
    requirements: { allOf: [{ itemId: 'item-094' }, { allOf: [hasSword, { itemId: 'item-012' }] }] } },
  { n: 63, name: 'Eastern Palace: Armos Knights beaten', group: 'dungeon', dungeonId: 'dungeon-003', gameId: { eventBit: BOSS_KILLED_BIT[2] },
    requirements: { allOf: [{ itemId: 'item-094' }, { allOf: [hasSword, { itemId: 'item-012' }] }] } },
  { n: 64, name: 'Eastern Palace: heart container taken', group: 'dungeon', dungeonId: 'dungeon-003', gameId: { roomId: 0xc8, mask: 0x800 },
    requirements: { checkId: 'check-363' } },
  { n: 65, name: 'Eastern Palace: reward taken', group: 'dungeon', dungeonId: 'dungeon-003', gameId: { eventBit: PRIZE_TAKEN_BIT[2] },
    requirements: { checkId: 'check-364' } },
  { n: 66, name: 'Eastern Palace: all chests opened', group: 'dungeon', dungeonId: 'dungeon-003',
    derivedDungeon: { dungeonId: 'dungeon-003', kinds: ['chest'] } },
  { n: 67, name: 'Eastern Palace: all keys collected', group: 'dungeon', dungeonId: 'dungeon-003',
    derivedDungeon: { dungeonId: 'dungeon-003', kinds: ['keyDrop', 'potItem'], tag: 'content:key' } },
  { n: 68, name: 'Eastern Palace: cleared', group: 'dungeon', dungeonId: 'dungeon-003',
    derived: { allOf: [{ checkId: 'check-366' }, { checkId: 'check-367' }, { checkId: 'check-363' }, { checkId: 'check-361' }, { checkId: 'check-364' }, { checkId: 'check-365' }] } },
];

export { EASTERN_PALACE_EVENTS };
