/* @layer shared-game @kind data */
/** The stage events of turtle-rock. */

import type { CheckRecord } from '@shared/game/data/types';
import { canSeeInDarkRooms } from '@shared/game/data/requirements/helpers';
import { EVENT_BIT as E } from '../event-bits';
import { eventRecord } from '../event-record';

const TURTLE_ROCK_EVENTS: CheckRecord[] = [
  eventRecord({ n: 160, name: 'Turtle Rock: started', group: 'dungeon', dungeonId: 'dungeon-012', gameId: { roomId: 0xd6, mask: 0x0f } }),
  eventRecord({ n: 161, name: 'Turtle Rock: Big Key door unlocked', group: 'dungeon', dungeonId: 'dungeon-012', gameId: { roomId: 0x24, mask: 0x8000 },
    requirements: { itemId: 'item-085' } }),
  eventRecord({ n: 162, name: 'Turtle Rock: boss reached', group: 'dungeon', dungeonId: 'dungeon-012', gameId: { roomId: 0xa4, mask: 0x0f },
    requirements: { allOf: [{ itemId: 'item-085' }, { allOf: [{ itemId: 'item-008' }, { itemId: 'item-009' }, { itemId: 'item-022' }, canSeeInDarkRooms] }] } }),
  eventRecord({ n: 163, name: 'Turtle Rock: Trinexx beaten', group: 'dungeon', dungeonId: 'dungeon-012', gameId: { eventBit: E.bossKilled(12) },
    requirements: { allOf: [{ itemId: 'item-085' }, { allOf: [{ itemId: 'item-008' }, { itemId: 'item-009' }, { itemId: 'item-022' }, canSeeInDarkRooms] }] } }),
  eventRecord({ n: 164, name: 'Turtle Rock: heart container taken', group: 'dungeon', dungeonId: 'dungeon-012', gameId: { roomId: 0xa4, mask: 0x800 },
    requirements: { checkId: 'check-463' } }),
  eventRecord({ n: 165, name: 'Turtle Rock: reward taken', group: 'dungeon', dungeonId: 'dungeon-012', gameId: { eventBit: E.prizeTaken(12) },
    requirements: { checkId: 'check-464' } }),
  eventRecord({ n: 166, name: 'Turtle Rock: all chests opened', group: 'dungeon', dungeonId: 'dungeon-012',
    derivedDungeon: { dungeonId: 'dungeon-012', kinds: ['chest'] } }),
  eventRecord({ n: 167, name: 'Turtle Rock: all keys collected', group: 'dungeon', dungeonId: 'dungeon-012',
    derivedDungeon: { dungeonId: 'dungeon-012', kinds: ['keyDrop', 'potItem'], tag: 'content:key' } }),
  eventRecord({ n: 168, name: 'Turtle Rock: cleared', group: 'dungeon', dungeonId: 'dungeon-012',
    derived: { allOf: [{ checkId: 'check-466' }, { checkId: 'check-467' }, { checkId: 'check-463' }, { checkId: 'check-461' }, { checkId: 'check-464' }, { checkId: 'check-465' }] } }),
  eventRecord({ n: 191, name: 'Turtle Rock: Big Chest ledge entered from outside', group: 'dungeon', dungeonId: 'dungeon-012', gameId: { eventBit: E.turtleRockBigChestLedge } }),
  eventRecord({ n: 192, name: 'Turtle Rock: Laser Bridge entered from outside', group: 'dungeon', dungeonId: 'dungeon-012', gameId: { eventBit: E.turtleRockLaserBridge } }),
];

export { TURTLE_ROCK_EVENTS };
