/* @layer shared-game @kind data */
/**
 * Split out of the flat seed files by scripts/generate-ids/split-seeds.ts.
 *
 * Room-tag dispatch is `kDungTagroutines` (core/zelda3/src/dungeon.c:201-266),
 * a 64-entry function-pointer table indexed by the room header's tag byte.
 * `ActorGameId.roomTag` is a single number, so one native handler shared by
 * several tag byte values needs one ActorRecord per observed byte value —
 * see actor-024/268-271 in triggers-2.ts for the "clear the room" family.
 *
 * Part 1 of 2 (size split); see triggers-2.ts for the rest.
 */
import type { ActorRecord } from '../types';

const TRIGGER_ACTORS_1: ActorRecord[] = [
  {
    // kDungTagroutines[0x01] = RoomTag_NorthWestTrigger, which gates on the NW
    // quadrant then calls RoomTag_QuadrantTrigger (dungeon.c:203,360). Only
    // matches roomTag 1 exactly — the record's old name claimed a "family
    // 0x01-0x13" that this single-valued gameId can never actually resolve.
    // The real family (kDungTagroutines[0x01-0x13] and its repeat at
    // [0x29-0x32]) is spread across this record and actor-268..271 below,
    // each for a roomTag value confirmed to occur in real room data.
    id: 'actor-024',
    gameId: { roomTag: 1 },
    kind: 'trigger',
    randomizerName: 'Clear Room (NW Quadrant)',
    effect: 'kill every enemy in the room → doors open (or a chest is revealed, depending on the specific tag value)',
  },
  {
    id: 'actor-025',
    gameId: { roomTag: 20 },
    kind: 'trigger',
    randomizerName: 'Trigger Door',
    effect: 'a trigger elsewhere in the room blocks this door',
  },
  {
    id: 'actor-026',
    gameId: { roomTag: 21 },
    kind: 'trigger',
    randomizerName: 'Prize Door',
    effect: 'defeating the room prize opens the door',
  },
  {
    id: 'actor-027',
    gameId: { roomTag: 22 },
    kind: 'trigger',
    randomizerName: 'Hold Switch Door',
    effect: 'holding a switch keeps the door open',
  },
  {
    id: 'actor-028',
    gameId: { roomTag: 23 },
    kind: 'trigger',
    randomizerName: 'Toggle Switch Door',
    effect: 'a switch toggles the door open/closed',
  },
  {
    id: 'actor-029',
    gameId: { roomTag: 24 },
    kind: 'trigger',
    randomizerName: 'Water Off',
    effect: 'switch drains the room’s water',
  },
  {
    // dungeon.c:1696-1705 (case 0x18) — drawn/tracked exactly like a chest but through
    // dung_num_bigkey_locks_x2, the same counter the big key unlock path checks. Only
    // appears in the escape-sequence jail cell (Hyrule Castle, dungeon-001), so the
    // dungeon's big key resolves to a single, unambiguous item here.
    id: 'actor-030',
    gameId: { objectSubIndex: 24 },
    kind: 'trigger',
    randomizerName: 'Cell Lock',
    effect: 'Zelda\'s jail cell keyhole plate — opens with the dungeon\'s big key (sim_triggers.c)',
    clearedBy: { itemId: 'item-095' },
  },
  {
    id: 'actor-031',
    gameId: { roomTag: 25 },
    kind: 'trigger',
    randomizerName: 'Water On',
    effect: 'switch floods the room',
  },
  {
    id: 'actor-032',
    gameId: { roomTag: 26 },
    kind: 'trigger',
    randomizerName: 'Water Gate',
    effect: 'a gate controls water flow into the room',
  },
  {
    id: 'actor-033',
    gameId: { roomTag: 28 },
    kind: 'trigger',
    randomizerName: 'Moving Wall (East)',
    effect: 'a wall slides east on trigger',
  },
  {
    id: 'actor-034',
    gameId: { roomTag: 29 },
    kind: 'trigger',
    randomizerName: 'Moving Wall (West)',
    effect: 'a wall slides west on trigger',
  },
  {
    id: 'actor-035',
    gameId: { roomTag: 30 },
    kind: 'trigger',
    randomizerName: 'Moving Wall — Torches',
    effect: 'lighting torches slides a wall',
  },
  {
    id: 'actor-036',
    gameId: { roomTag: 31 },
    kind: 'trigger',
    randomizerName: 'Moving Wall — Torches (2)',
    effect: 'lighting torches slides a wall (second variant)',
  },
  {
    id: 'actor-037',
    gameId: { roomTag: 32 },
    kind: 'trigger',
    randomizerName: 'Switch → Exploding Wall',
    effect: 'a switch detonates a wall',
  },
  {
    id: 'actor-038',
    gameId: { roomTag: 33 },
    kind: 'trigger',
    randomizerName: 'Holes',
    effect: 'a trigger opens floor holes',
  },
  {
    id: 'actor-039',
    gameId: { roomTag: 34 },
    kind: 'trigger',
    randomizerName: 'Chest → Holes',
    effect: 'opening a chest opens floor holes',
  },
];

export { TRIGGER_ACTORS_1 };
