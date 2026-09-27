/* @layer shared-game @kind data */
/** The stage events of tower-of-hera. */

import type { CheckRecord } from '@shared/game/data/types';
import { hasMeleeWeapon } from '@shared/game/data/requirements/helpers';
import { EVENT_BIT as E } from '../event-bits';
import { eventRecord } from '../event-record';

const TOWER_OF_HERA_EVENTS: CheckRecord[] = [
  eventRecord({ n: 80, name: 'Tower of Hera: started', group: 'dungeon', dungeonId: 'dungeon-005', gameId: { roomId: 0x77, mask: 0x0f } }),
  eventRecord({ n: 81, name: 'Tower of Hera: Big Key door unlocked', group: 'dungeon', dungeonId: 'dungeon-005', gameId: { roomId: 0x31, mask: 0x8000 },
    requirements: { itemId: 'item-087' } }),
  eventRecord({ n: 82, name: 'Tower of Hera: boss reached', group: 'dungeon', dungeonId: 'dungeon-005', gameId: { roomId: 0x07, mask: 0x0f },
    requirements: { allOf: [{ itemId: 'item-087' }, hasMeleeWeapon] } }),
  eventRecord({ n: 83, name: 'Tower of Hera: Moldorm beaten', group: 'dungeon', dungeonId: 'dungeon-005', gameId: { eventBit: E.bossKilled(10) },
    fallback: { checkId: 'check-384' }, requirements: { allOf: [{ itemId: 'item-087' }, hasMeleeWeapon] } }),
  eventRecord({ n: 84, name: 'Tower of Hera: heart container taken', group: 'dungeon', dungeonId: 'dungeon-005', gameId: { roomId: 0x07, mask: 0x800 },
    requirements: { checkId: 'check-383' } }),
  eventRecord({ n: 85, name: 'Tower of Hera: reward taken', group: 'dungeon', dungeonId: 'dungeon-005', gameId: { eventBit: E.prizeTaken(10) },
    fallback: { allOf: [{ checkId: 'check-384' }, { itemId: 'item-057' }] }, requirements: { checkId: 'check-384' } }),
  eventRecord({ n: 86, name: 'Tower of Hera: all chests opened', group: 'dungeon', dungeonId: 'dungeon-005',
    derivedDungeon: { dungeonId: 'dungeon-005', kinds: ['chest'] } }),
  eventRecord({ n: 87, name: 'Tower of Hera: all keys collected', group: 'dungeon', dungeonId: 'dungeon-005',
    derivedDungeon: { dungeonId: 'dungeon-005', kinds: ['keyDrop', 'potItem'], tag: 'content:key' } }),
  eventRecord({ n: 88, name: 'Tower of Hera: cleared', group: 'dungeon', dungeonId: 'dungeon-005',
    derived: { allOf: [{ checkId: 'check-386' }, { checkId: 'check-387' }, { checkId: 'check-383' }, { checkId: 'check-381' }, { checkId: 'check-384' }, { checkId: 'check-385' }] } }),
];

export { TOWER_OF_HERA_EVENTS };
