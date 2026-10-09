/* @layer shared-game @kind data */
import type { EventSpec } from '../../../../checks/event-spec.type';
import { BOSS_KILLED_BIT, PRIZE_TAKEN_BIT } from '../../../../checks/indexed-event-bits.constants';

const SWAMP_PALACE_EVENTS: EventSpec[] = [
  { n: 110, name: 'Swamp Palace: started', group: 'dungeon', dungeonId: 'dungeon-007', gameId: { roomId: 0x28, mask: 0x0f } },
  { n: 112, name: 'Swamp Palace: boss reached', group: 'dungeon', dungeonId: 'dungeon-007', gameId: { roomId: 0x06, mask: 0x0f },
    requirements: { allOf: [{ itemId: 'item-092' }, { allOf: [{ itemId: 'item-011' }, { itemId: 'item-031' }, { checkId: 'check-498' }] }] } },
  { n: 113, name: 'Swamp Palace: Arrghus beaten', group: 'dungeon', dungeonId: 'dungeon-007', gameId: { eventBit: BOSS_KILLED_BIT[5] },
    requirements: { allOf: [{ itemId: 'item-092' }, { allOf: [{ itemId: 'item-011' }, { itemId: 'item-031' }, { checkId: 'check-498' }] }] } },
  { n: 114, name: 'Swamp Palace: heart container taken', group: 'dungeon', dungeonId: 'dungeon-007', gameId: { roomId: 0x06, mask: 0x800 },
    requirements: { checkId: 'check-413' } },
  { n: 115, name: 'Swamp Palace: reward taken', group: 'dungeon', dungeonId: 'dungeon-007', gameId: { eventBit: PRIZE_TAKEN_BIT[5] },
    requirements: { checkId: 'check-414' } },
  { n: 116, name: 'Swamp Palace: all chests opened', group: 'dungeon', dungeonId: 'dungeon-007',
    derivedDungeon: { dungeonId: 'dungeon-007', kinds: ['chest'] } },
  { n: 117, name: 'Swamp Palace: all keys collected', group: 'dungeon', dungeonId: 'dungeon-007',
    derivedDungeon: { dungeonId: 'dungeon-007', kinds: ['keyDrop', 'potItem'], tag: 'content:key' } },
  { n: 118, name: 'Swamp Palace: cleared', group: 'dungeon', dungeonId: 'dungeon-007',
    derived: { allOf: [{ checkId: 'check-416' }, { checkId: 'check-417' }, { checkId: 'check-413' }, { checkId: 'check-414' }, { checkId: 'check-415' }] } },
  { n: 185, name: 'Swamp Palace: past the flooded entrance', group: 'dungeon', dungeonId: 'dungeon-007', gameId: { roomId: 0x38, mask: 0x0f } },
  { n: 198, name: 'Swamp Palace: inner waterways entered', group: 'dungeon', dungeonId: 'dungeon-007', gameId: { roomId: 0x26, mask: 0x0f },
    requirements: { allOf: [{ itemId: 'item-011' }, { checkId: 'check-170' }] } },
];

export { SWAMP_PALACE_EVENTS };
