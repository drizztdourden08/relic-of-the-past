/* @layer shared-game @kind data */
import type { EventSpec } from '@shared/game/data/checks/event-spec.type';
import { BOSS_KILLED_BIT, PRIZE_TAKEN_BIT } from '@shared/game/data/checks/indexed-event-bits.constants';
import { canLiftRocks, canMeltThings } from '@shared/game/data/requirements/helpers';

const ICE_PALACE_EVENTS: EventSpec[] = [
  { n: 140, name: 'Ice Palace: started', group: 'dungeon', dungeonId: 'dungeon-010', gameId: { roomId: 0x0e, mask: 0x0f } },
  { n: 141, name: 'Ice Palace: Big Key door unlocked', group: 'dungeon', dungeonId: 'dungeon-010', gameId: { roomId: 0x9e, mask: 0x4000 },
    requirements: { itemId: 'item-088' } },
  { n: 142, name: 'Ice Palace: boss reached', group: 'dungeon', dungeonId: 'dungeon-010', gameId: { roomId: 0xde, mask: 0x0f },
    requirements: { allOf: [{ itemId: 'item-088' }, { allOf: [canMeltThings, { itemId: 'item-010' }, canLiftRocks] }] } },
  { n: 143, name: 'Ice Palace: Kholdstare beaten', group: 'dungeon', dungeonId: 'dungeon-010', gameId: { eventBit: BOSS_KILLED_BIT[9] },
    requirements: { allOf: [{ itemId: 'item-088' }, { allOf: [canMeltThings, { itemId: 'item-010' }, canLiftRocks] }] } },
  { n: 144, name: 'Ice Palace: heart container taken', group: 'dungeon', dungeonId: 'dungeon-010', gameId: { roomId: 0xde, mask: 0x800 },
    requirements: { checkId: 'check-443' } },
  { n: 145, name: 'Ice Palace: reward taken', group: 'dungeon', dungeonId: 'dungeon-010', gameId: { eventBit: PRIZE_TAKEN_BIT[9] },
    requirements: { checkId: 'check-444' } },
  { n: 146, name: 'Ice Palace: all chests opened', group: 'dungeon', dungeonId: 'dungeon-010',
    derivedDungeon: { dungeonId: 'dungeon-010', kinds: ['chest'] } },
  { n: 147, name: 'Ice Palace: all keys collected', group: 'dungeon', dungeonId: 'dungeon-010',
    derivedDungeon: { dungeonId: 'dungeon-010', kinds: ['keyDrop', 'potItem'], tag: 'content:key' } },
  { n: 148, name: 'Ice Palace: cleared', group: 'dungeon', dungeonId: 'dungeon-010',
    derived: { allOf: [{ checkId: 'check-446' }, { checkId: 'check-447' }, { checkId: 'check-443' }, { checkId: 'check-441' }, { checkId: 'check-444' }, { checkId: 'check-445' }] } },
];

export { ICE_PALACE_EVENTS };
