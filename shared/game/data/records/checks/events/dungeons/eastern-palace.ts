/* @layer shared-game @kind data */
/** The stage events of eastern-palace. */

import type { CheckRecord } from '@shared/game/data/types';
import { hasSword } from '@shared/game/data/requirements/helpers';
import { EVENT_BIT as E } from '../event-bits';
import { eventRecord } from '../event-record';

const EASTERN_PALACE_EVENTS: CheckRecord[] = [
  eventRecord({ n: 60, name: 'Eastern Palace: started', group: 'dungeon', dungeonId: 'dungeon-003', gameId: { roomId: 0xc9, mask: 0x0f } }),
  eventRecord({ n: 61, name: 'Eastern Palace: Big Key door unlocked', group: 'dungeon', dungeonId: 'dungeon-003', gameId: { roomId: 0xa9, mask: 0x2000 },
    requirements: { itemId: 'item-094' } }),
  eventRecord({ n: 62, name: 'Eastern Palace: boss reached', group: 'dungeon', dungeonId: 'dungeon-003', gameId: { roomId: 0xc8, mask: 0x0f },
    requirements: { allOf: [{ itemId: 'item-094' }, { allOf: [hasSword, { itemId: 'item-012' }] }] } }),
  eventRecord({ n: 63, name: 'Eastern Palace: Armos Knights beaten', group: 'dungeon', dungeonId: 'dungeon-003', gameId: { eventBit: E.bossKilled(2) },
    requirements: { allOf: [{ itemId: 'item-094' }, { allOf: [hasSword, { itemId: 'item-012' }] }] } }),
  eventRecord({ n: 64, name: 'Eastern Palace: heart container taken', group: 'dungeon', dungeonId: 'dungeon-003', gameId: { roomId: 0xc8, mask: 0x800 },
    requirements: { checkId: 'check-363' } }),
  eventRecord({ n: 65, name: 'Eastern Palace: reward taken', group: 'dungeon', dungeonId: 'dungeon-003', gameId: { eventBit: E.prizeTaken(2) },
    requirements: { checkId: 'check-364' } }),
  eventRecord({ n: 66, name: 'Eastern Palace: all chests opened', group: 'dungeon', dungeonId: 'dungeon-003',
    derivedDungeon: { dungeonId: 'dungeon-003', kinds: ['chest'] } }),
  eventRecord({ n: 67, name: 'Eastern Palace: all keys collected', group: 'dungeon', dungeonId: 'dungeon-003',
    derivedDungeon: { dungeonId: 'dungeon-003', kinds: ['keyDrop', 'potItem'], tag: 'content:key' } }),
  eventRecord({ n: 68, name: 'Eastern Palace: cleared', group: 'dungeon', dungeonId: 'dungeon-003',
    derived: { allOf: [{ checkId: 'check-366' }, { checkId: 'check-367' }, { checkId: 'check-363' }, { checkId: 'check-361' }, { checkId: 'check-364' }, { checkId: 'check-365' }] } }),
];

export { EASTERN_PALACE_EVENTS };
