/* @layer shared-game @kind data */
/** The stage events of swamp-palace. */

import type { CheckRecord } from '@shared/game/data/types';
import { EVENT_BIT as E } from '../event-bits';
import { eventRecord } from '../event-record';

const SWAMP_PALACE_EVENTS: CheckRecord[] = [
  eventRecord({ n: 110, name: 'Swamp Palace: started', group: 'dungeon', dungeonId: 'dungeon-007', gameId: { roomId: 0x28, mask: 0x0f } }),
  eventRecord({ n: 112, name: 'Swamp Palace: boss reached', group: 'dungeon', dungeonId: 'dungeon-007', gameId: { roomId: 0x06, mask: 0x0f },
    requirements: { allOf: [{ itemId: 'item-092' }, { allOf: [{ itemId: 'item-011' }, { itemId: 'item-031' }, { checkId: 'check-498' }] }] } }),
  eventRecord({ n: 113, name: 'Swamp Palace: Arrghus beaten', group: 'dungeon', dungeonId: 'dungeon-007', gameId: { eventBit: E.bossKilled(5) },
    fallback: { checkId: 'check-414' }, requirements: { allOf: [{ itemId: 'item-092' }, { allOf: [{ itemId: 'item-011' }, { itemId: 'item-031' }, { checkId: 'check-498' }] }] } }),
  eventRecord({ n: 114, name: 'Swamp Palace: heart container taken', group: 'dungeon', dungeonId: 'dungeon-007', gameId: { roomId: 0x06, mask: 0x800 },
    requirements: { checkId: 'check-413' } }),
  eventRecord({ n: 115, name: 'Swamp Palace: reward taken', group: 'dungeon', dungeonId: 'dungeon-007', gameId: { eventBit: E.prizeTaken(5) },
    fallback: { allOf: [{ checkId: 'check-414' }, { itemId: 'item-113' }] }, requirements: { checkId: 'check-414' } }),
  eventRecord({ n: 116, name: 'Swamp Palace: all chests opened', group: 'dungeon', dungeonId: 'dungeon-007',
    derivedDungeon: { dungeonId: 'dungeon-007', kinds: ['chest'] } }),
  eventRecord({ n: 117, name: 'Swamp Palace: all keys collected', group: 'dungeon', dungeonId: 'dungeon-007',
    derivedDungeon: { dungeonId: 'dungeon-007', kinds: ['keyDrop', 'potItem'], tag: 'content:key' } }),
  eventRecord({ n: 118, name: 'Swamp Palace: cleared', group: 'dungeon', dungeonId: 'dungeon-007',
    derived: { allOf: [{ checkId: 'check-416' }, { checkId: 'check-417' }, { checkId: 'check-413' }, { checkId: 'check-414' }, { checkId: 'check-415' }] } }),
  eventRecord({ n: 185, name: 'Swamp Palace: past the flooded entrance', group: 'dungeon', dungeonId: 'dungeon-007', gameId: { roomId: 0x38, mask: 0x0f } }),
  // The locked door at the top of the Big Chest room: the key for it sits under a pot across the
  // water in that same room, a Hookshot away (check-170). Everything north of the door is behind it.
  eventRecord({ n: 198, name: 'Swamp Palace: inner waterways entered', group: 'dungeon', dungeonId: 'dungeon-007', gameId: { roomId: 0x26, mask: 0x0f },
    requirements: { allOf: [{ itemId: 'item-011' }, { checkId: 'check-170' }] } }),
];

export { SWAMP_PALACE_EVENTS };
