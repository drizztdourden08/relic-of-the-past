/* @layer shared-game @kind data */
/** The stage events of ice-palace. */

import type { CheckRecord } from '@shared/game/data/types';
import { canLiftRocks, canMeltThings } from '@shared/game/data/requirements/helpers';
import { EVENT_BIT as E } from '../event-bits';
import { eventRecord } from '../event-record';

const ICE_PALACE_EVENTS: CheckRecord[] = [
  eventRecord({ n: 140, name: 'Ice Palace: started', group: 'dungeon', dungeonId: 'dungeon-010', gameId: { roomId: 0x0e, mask: 0x0f } }),
  eventRecord({ n: 141, name: 'Ice Palace: Big Key door unlocked', group: 'dungeon', dungeonId: 'dungeon-010', gameId: { roomId: 0x9e, mask: 0x4000 },
    requirements: { itemId: 'item-088' } }),
  eventRecord({ n: 142, name: 'Ice Palace: boss reached', group: 'dungeon', dungeonId: 'dungeon-010', gameId: { roomId: 0xde, mask: 0x0f },
    requirements: { allOf: [{ itemId: 'item-088' }, { allOf: [canMeltThings, { itemId: 'item-010' }, canLiftRocks] }] } }),
  eventRecord({ n: 143, name: 'Ice Palace: Kholdstare beaten', group: 'dungeon', dungeonId: 'dungeon-010', gameId: { eventBit: E.bossKilled(9) },
    requirements: { allOf: [{ itemId: 'item-088' }, { allOf: [canMeltThings, { itemId: 'item-010' }, canLiftRocks] }] } }),
  eventRecord({ n: 144, name: 'Ice Palace: heart container taken', group: 'dungeon', dungeonId: 'dungeon-010', gameId: { roomId: 0xde, mask: 0x800 },
    requirements: { checkId: 'check-443' } }),
  eventRecord({ n: 145, name: 'Ice Palace: reward taken', group: 'dungeon', dungeonId: 'dungeon-010', gameId: { eventBit: E.prizeTaken(9) },
    requirements: { checkId: 'check-444' } }),
  eventRecord({ n: 146, name: 'Ice Palace: all chests opened', group: 'dungeon', dungeonId: 'dungeon-010',
    derivedDungeon: { dungeonId: 'dungeon-010', kinds: ['chest'] } }),
  eventRecord({ n: 147, name: 'Ice Palace: all keys collected', group: 'dungeon', dungeonId: 'dungeon-010',
    derivedDungeon: { dungeonId: 'dungeon-010', kinds: ['keyDrop', 'potItem'], tag: 'content:key' } }),
  eventRecord({ n: 148, name: 'Ice Palace: cleared', group: 'dungeon', dungeonId: 'dungeon-010',
    derived: { allOf: [{ checkId: 'check-446' }, { checkId: 'check-447' }, { checkId: 'check-443' }, { checkId: 'check-441' }, { checkId: 'check-444' }, { checkId: 'check-445' }] } }),
];

export { ICE_PALACE_EVENTS };
