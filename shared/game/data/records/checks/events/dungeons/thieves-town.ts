/* @layer shared-game @kind data */
/** The stage events of thieves-town. */

import type { CheckRecord } from '@shared/game/data/types';
import { canKillMostThings } from '@shared/game/data/requirements/helpers';
import { EVENT_BIT as E } from '../event-bits';
import { eventRecord } from '../event-record';

const THIEVES_TOWN_EVENTS: CheckRecord[] = [
  eventRecord({ n: 130, name: "Thieves' Town: started", group: 'dungeon', dungeonId: 'dungeon-009', gameId: { roomId: 0xdb, mask: 0x0f } }),
  eventRecord({ n: 131, name: "Thieves' Town: Big Key door unlocked", group: 'dungeon', dungeonId: 'dungeon-009', gameId: { roomId: 0xcc, mask: 0x8000 },
    requirements: { itemId: 'item-086' } }),
  eventRecord({ n: 132, name: "Thieves' Town: boss reached", group: 'dungeon', dungeonId: 'dungeon-009', gameId: { roomId: 0xac, mask: 0x0f },
    requirements: { allOf: [{ itemId: 'item-086' }, canKillMostThings] } }),
  eventRecord({ n: 133, name: "Thieves' Town: Blind beaten", group: 'dungeon', dungeonId: 'dungeon-009', gameId: { eventBit: E.bossKilled(11) },
    requirements: { allOf: [{ itemId: 'item-086' }, canKillMostThings] } }),
  eventRecord({ n: 134, name: "Thieves' Town: heart container taken", group: 'dungeon', dungeonId: 'dungeon-009', gameId: { roomId: 0xac, mask: 0x800 },
    requirements: { checkId: 'check-433' } }),
  eventRecord({ n: 135, name: "Thieves' Town: reward taken", group: 'dungeon', dungeonId: 'dungeon-009', gameId: { eventBit: E.prizeTaken(11) },
    requirements: { checkId: 'check-434' } }),
  eventRecord({ n: 136, name: "Thieves' Town: all chests opened", group: 'dungeon', dungeonId: 'dungeon-009',
    derivedDungeon: { dungeonId: 'dungeon-009', kinds: ['chest'] } }),
  eventRecord({ n: 137, name: "Thieves' Town: all keys collected", group: 'dungeon', dungeonId: 'dungeon-009',
    derivedDungeon: { dungeonId: 'dungeon-009', kinds: ['keyDrop', 'potItem'], tag: 'content:key' } }),
  eventRecord({ n: 138, name: "Thieves' Town: cleared", group: 'dungeon', dungeonId: 'dungeon-009',
    derived: { allOf: [{ checkId: 'check-436' }, { checkId: 'check-437' }, { checkId: 'check-433' }, { checkId: 'check-431' }, { checkId: 'check-434' }, { checkId: 'check-435' }] } }),
  eventRecord({ n: 186, name: "Thieves' Town: attic floor bombed", group: 'dungeon', dungeonId: 'dungeon-009', gameId: { roomId: 0x65, mask: 0x100 } }),
];

export { THIEVES_TOWN_EVENTS };
