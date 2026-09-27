/* @layer shared-game @kind data */
/** The stage events of desert-palace. */

import type { CheckRecord } from '@shared/game/data/types';
import { canKillMostThings, hasFireSource } from '@shared/game/data/requirements/helpers';
import { EVENT_BIT as E } from '../event-bits';
import { eventRecord } from '../event-record';

const DESERT_PALACE_EVENTS: CheckRecord[] = [
  eventRecord({ n: 70, name: 'Desert Palace: started', group: 'dungeon', dungeonId: 'dungeon-004', gameId: { roomId: 0x84, mask: 0x0f } }),
  eventRecord({ n: 71, name: 'Desert Palace: Big Key door unlocked', group: 'dungeon', dungeonId: 'dungeon-004', gameId: { roomId: 0x43, mask: 0x8000 },
    requirements: { itemId: 'item-093' } }),
  eventRecord({ n: 72, name: 'Desert Palace: boss reached', group: 'dungeon', dungeonId: 'dungeon-004', gameId: { roomId: 0x33, mask: 0x0f },
    requirements: { allOf: [{ itemId: 'item-093' }, { allOf: [canKillMostThings, hasFireSource] }] } }),
  eventRecord({ n: 73, name: 'Desert Palace: Lanmolas beaten', group: 'dungeon', dungeonId: 'dungeon-004', gameId: { eventBit: E.bossKilled(3) },
    fallback: { checkId: 'check-374' }, requirements: { allOf: [{ itemId: 'item-093' }, { allOf: [canKillMostThings, hasFireSource] }] } }),
  eventRecord({ n: 74, name: 'Desert Palace: heart container taken', group: 'dungeon', dungeonId: 'dungeon-004', gameId: { roomId: 0x33, mask: 0x800 },
    requirements: { checkId: 'check-373' } }),
  eventRecord({ n: 75, name: 'Desert Palace: reward taken', group: 'dungeon', dungeonId: 'dungeon-004', gameId: { eventBit: E.prizeTaken(3) },
    fallback: { allOf: [{ checkId: 'check-374' }, { itemId: 'item-058' }] }, requirements: { checkId: 'check-374' } }),
  eventRecord({ n: 76, name: 'Desert Palace: all chests opened', group: 'dungeon', dungeonId: 'dungeon-004',
    derivedDungeon: { dungeonId: 'dungeon-004', kinds: ['chest'] } }),
  eventRecord({ n: 77, name: 'Desert Palace: all keys collected', group: 'dungeon', dungeonId: 'dungeon-004',
    derivedDungeon: { dungeonId: 'dungeon-004', kinds: ['keyDrop', 'potItem'], tag: 'content:key' } }),
  eventRecord({ n: 78, name: 'Desert Palace: cleared', group: 'dungeon', dungeonId: 'dungeon-004',
    derived: { allOf: [{ checkId: 'check-376' }, { checkId: 'check-377' }, { checkId: 'check-373' }, { checkId: 'check-371' }, { checkId: 'check-374' }, { checkId: 'check-375' }] } }),
  eventRecord({ n: 183, name: 'Desert Palace: back section entered', group: 'dungeon', dungeonId: 'dungeon-004', gameId: { roomId: 0x63, mask: 0x0f } }),
];

export { DESERT_PALACE_EVENTS };
