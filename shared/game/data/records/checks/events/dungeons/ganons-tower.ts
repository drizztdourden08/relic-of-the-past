/* @layer shared-game @kind data */
import type { EventSpec } from '@shared/game/data/checks/event-spec.type';
import { BOSS_KILLED_BIT } from '@shared/game/data/checks/indexed-event-bits.constants';
import { hasFireSource, hasSword } from '@shared/game/data/requirements/helpers';
import { EVENT_BIT as E } from '../event-bits';

const GANONS_TOWER_EVENTS: EventSpec[] = [
  { n: 170, name: "Ganon's Tower: started", group: 'dungeon', dungeonId: 'dungeon-013', gameId: { roomId: 0x0c, mask: 0x0f } },
  { n: 171, name: "Ganon's Tower: Big Key door unlocked", group: 'dungeon', dungeonId: 'dungeon-013', gameId: { roomId: 0x6b, mask: 0x8000 },
    requirements: { itemId: 'item-084' } },
  { n: 172, name: "Ganon's Tower: boss reached", group: 'dungeon', dungeonId: 'dungeon-013', gameId: { roomId: 0x0d, mask: 0x0f },
    requirements: { allOf: [{ itemId: 'item-084' }, { allOf: [hasSword, { itemId: 'item-011' }, { itemId: 'item-012' }, hasFireSource, { itemId: 'item-010' }, { itemId: 'item-022' }] }] } },
  { n: 173, name: "Ganon's Tower: Agahnim beaten", group: 'dungeon', dungeonId: 'dungeon-013', gameId: { eventBit: BOSS_KILLED_BIT[13] },
    requirements: { allOf: [{ itemId: 'item-084' }, { allOf: [hasSword, { itemId: 'item-011' }, { itemId: 'item-012' }, hasFireSource, { itemId: 'item-010' }, { itemId: 'item-022' }] }] } },
  { n: 174, name: "Ganon's Tower: heart container taken", group: 'dungeon', dungeonId: 'dungeon-013', gameId: { roomId: 0x0d, mask: 0x800 },
    requirements: { checkId: 'check-473' } },
  { n: 176, name: "Ganon's Tower: all chests opened", group: 'dungeon', dungeonId: 'dungeon-013',
    derivedDungeon: { dungeonId: 'dungeon-013', kinds: ['chest'] } },
  { n: 177, name: "Ganon's Tower: all keys collected", group: 'dungeon', dungeonId: 'dungeon-013',
    derivedDungeon: { dungeonId: 'dungeon-013', kinds: ['keyDrop', 'potItem'], tag: 'content:key' } },
  { n: 178, name: "Ganon's Tower: cleared", group: 'dungeon', dungeonId: 'dungeon-013',
    derived: { allOf: [{ checkId: 'check-476' }, { checkId: 'check-477' }, { checkId: 'check-473' }, { checkId: 'check-471' }] } },
  { n: 187, name: "Ganon's Tower: Armos Knights rematch beaten", group: 'dungeon', dungeonId: 'dungeon-013', gameId: { eventBit: E.rematchArmos } },
  { n: 188, name: "Ganon's Tower: Lanmolas rematch beaten", group: 'dungeon', dungeonId: 'dungeon-013', gameId: { eventBit: E.rematchLanmolas } },
  { n: 189, name: "Ganon's Tower: Moldorm rematch beaten", group: 'dungeon', dungeonId: 'dungeon-013', gameId: { eventBit: E.rematchMoldorm } },
  { n: 190, name: "Ganon's Tower: final door unlocked", group: 'dungeon', dungeonId: 'dungeon-013', gameId: { roomId: 0x1d, mask: 0x8000 } },
];

export { GANONS_TOWER_EVENTS };
