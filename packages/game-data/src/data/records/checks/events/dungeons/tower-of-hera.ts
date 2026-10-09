/* @layer shared-game @kind data */
import type { EventSpec } from '../../../../checks/event-spec.type';
import { BOSS_KILLED_BIT, PRIZE_TAKEN_BIT } from '../../../../checks/indexed-event-bits.constants';
import { hasMeleeWeapon } from '../../../../requirements/helpers';

const TOWER_OF_HERA_EVENTS: EventSpec[] = [
  { n: 80, name: 'Tower of Hera: started', group: 'dungeon', dungeonId: 'dungeon-005', gameId: { roomId: 0x77, mask: 0x0f } },
  { n: 81, name: 'Tower of Hera: Big Key door unlocked', group: 'dungeon', dungeonId: 'dungeon-005', gameId: { roomId: 0x31, mask: 0x8000 },
    requirements: { itemId: 'item-087' } },
  { n: 82, name: 'Tower of Hera: boss reached', group: 'dungeon', dungeonId: 'dungeon-005', gameId: { roomId: 0x07, mask: 0x0f },
    requirements: { allOf: [{ itemId: 'item-087' }, hasMeleeWeapon] } },
  { n: 83, name: 'Tower of Hera: Moldorm beaten', group: 'dungeon', dungeonId: 'dungeon-005', gameId: { eventBit: BOSS_KILLED_BIT[10] },
    requirements: { allOf: [{ itemId: 'item-087' }, hasMeleeWeapon] } },
  { n: 84, name: 'Tower of Hera: heart container taken', group: 'dungeon', dungeonId: 'dungeon-005', gameId: { roomId: 0x07, mask: 0x800 },
    requirements: { checkId: 'check-383' } },
  { n: 85, name: 'Tower of Hera: reward taken', group: 'dungeon', dungeonId: 'dungeon-005', gameId: { eventBit: PRIZE_TAKEN_BIT[10] },
    requirements: { checkId: 'check-384' } },
  { n: 86, name: 'Tower of Hera: all chests opened', group: 'dungeon', dungeonId: 'dungeon-005',
    derivedDungeon: { dungeonId: 'dungeon-005', kinds: ['chest'] } },
  { n: 87, name: 'Tower of Hera: all keys collected', group: 'dungeon', dungeonId: 'dungeon-005',
    derivedDungeon: { dungeonId: 'dungeon-005', kinds: ['keyDrop', 'potItem'], tag: 'content:key' } },
  { n: 88, name: 'Tower of Hera: cleared', group: 'dungeon', dungeonId: 'dungeon-005',
    derived: { allOf: [{ checkId: 'check-386' }, { checkId: 'check-387' }, { checkId: 'check-383' }, { checkId: 'check-381' }, { checkId: 'check-384' }, { checkId: 'check-385' }] } },
];

export { TOWER_OF_HERA_EVENTS };
