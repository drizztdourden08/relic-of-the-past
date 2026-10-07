/* @layer shared-game @kind data */

import type { ActorRecord } from '@shared/game/data/types';

const TRIGGERS_ACTORS: ActorRecord[] = [
  {
    // kDungTagroutines[0x01] = RoomTag_NorthWestTrigger, which gates on the NW
    // quadrant then calls RoomTag_QuadrantTrigger (dungeon.c:203,360). Only
    // matches roomTag 1 exactly. The record's old name claimed a "family
    // 0x01-0x13" that this single-valued gameId can never resolve.
    // The real family (kDungTagroutines[0x01-0x13] and its repeat at
    // [0x29-0x32]) is spread across this record and actor-268..271 below,
    // each for a roomTag value confirmed to occur in real room data.
    id: 'actor-024',
    gameId: { roomTag: 1 },
    kind: 'trigger',
    name: 'Clear Room (NW Quadrant)',
    effect: 'kill every enemy in the room → doors open (or a chest is revealed, depending on the specific tag value)',
  },
  {
    id: 'actor-025',
    gameId: { roomTag: 20 },
    kind: 'trigger',
    name: 'Trigger Door',
    effect: 'a trigger elsewhere in the room blocks this door',
  },
  {
    id: 'actor-026',
    gameId: { roomTag: 21 },
    kind: 'trigger',
    name: 'Prize Door',
    effect: 'defeating the room prize opens the door',
  },
  {
    id: 'actor-027',
    gameId: { roomTag: 22 },
    kind: 'trigger',
    name: 'Hold Switch Door',
    effect: 'holding a switch keeps the door open',
  },
  {
    id: 'actor-028',
    gameId: { roomTag: 23 },
    kind: 'trigger',
    name: 'Toggle Switch Door',
    effect: 'a switch toggles the door open/closed',
  },
  {
    id: 'actor-029',
    gameId: { roomTag: 24 },
    kind: 'trigger',
    name: 'Water Off',
    effect: 'switch drains the room\'s water',
  },
  {
    // dungeon.c:1696-1705 (case 0x18) draws and tracks it exactly like a chest but through
    // dung_num_bigkey_locks_x2, the same counter the big key unlock path checks. Only
    // appears in the escape-sequence jail cell (Hyrule Castle, dungeon-001), so the
    // dungeon's big key resolves to a single, unambiguous item here.
    id: 'actor-030',
    gameId: { objectSubIndex: 24 },
    kind: 'trigger',
    name: 'Cell Lock',
    effect: 'Zelda\'s jail cell keyhole plate, opened by the dungeon\'s big key (sim_triggers.c)',
    clearedBy: { itemId: 'item-095' },
  },
  {
    id: 'actor-031',
    gameId: { roomTag: 25 },
    kind: 'trigger',
    name: 'Water On',
    effect: 'switch floods the room',
  },
  {
    id: 'actor-032',
    gameId: { roomTag: 26 },
    kind: 'trigger',
    name: 'Water Gate',
    effect: 'a gate controls water flow into the room',
  },
  {
    id: 'actor-033',
    gameId: { roomTag: 28 },
    kind: 'trigger',
    name: 'Moving Wall (East)',
    effect: 'a wall slides east on trigger',
  },
  {
    id: 'actor-034',
    gameId: { roomTag: 29 },
    kind: 'trigger',
    name: 'Moving Wall (West)',
    effect: 'a wall slides west on trigger',
  },
  {
    id: 'actor-035',
    gameId: { roomTag: 30 },
    kind: 'trigger',
    name: 'Moving Wall - Torches',
    effect: 'lighting torches slides a wall',
  },
  {
    id: 'actor-036',
    gameId: { roomTag: 31 },
    kind: 'trigger',
    name: 'Moving Wall - Torches (2)',
    effect: 'lighting torches slides a wall (second variant)',
  },
  {
    id: 'actor-037',
    gameId: { roomTag: 32 },
    kind: 'trigger',
    name: 'Switch → Exploding Wall',
    effect: 'a switch detonates a wall',
  },
  {
    id: 'actor-038',
    gameId: { roomTag: 33 },
    kind: 'trigger',
    name: 'Holes',
    effect: 'a trigger opens floor holes',
  },
  {
    id: 'actor-039',
    gameId: { roomTag: 34 },
    kind: 'trigger',
    name: 'Chest → Holes',
    effect: 'opening a chest opens floor holes',
  },
  {
    id: 'actor-040',
    gameId: { roomTag: 36 },
    kind: 'trigger',
    name: 'Holes (second set)',
    effect: 'a second, independent set of floor holes',
  },
  {
    id: 'actor-041',
    gameId: { roomTag: 37 },
    kind: 'trigger',
    name: 'Heart For Prize',
    effect: 'the room prize is a heart container/piece',
  },
  {
    id: 'actor-042',
    gameId: { roomTag: 38 },
    kind: 'trigger',
    name: 'Kill Room → Block',
    effect: 'clearing the room raises a block',
  },
  {
    id: 'actor-043',
    gameId: { roomTag: 39 },
    kind: 'trigger',
    name: 'Trigger → Chest',
    effect: 'a trigger elsewhere reveals a chest',
  },
  {
    id: 'actor-044',
    gameId: { roomTag: 40 },
    kind: 'trigger',
    name: 'Pull Switch → Exploding Wall',
    effect: 'a pull switch detonates a wall',
  },
  {
    id: 'actor-045',
    gameId: { roomTag: 51 },
    kind: 'trigger',
    name: 'Torch Puzzle → Door',
    effect: 'lighting the right torches opens a door',
  },
  {
    id: 'actor-046',
    gameId: { roomTag: 56 },
    kind: 'trigger',
    name: 'Agahnim',
    effect: 'the Agahnim boss encounter',
  },
  {
    id: 'actor-047',
    gameId: { roomTag: 60 },
    kind: 'trigger',
    name: 'Push Block → Chest',
    effect: 'pushing a block reveals a chest',
  },
  {
    id: 'actor-048',
    gameId: { roomTag: 61 },
    kind: 'trigger',
    name: 'Ganon Door',
    effect: 'gates the door to Ganon',
  },
  {
    id: 'actor-049',
    gameId: { roomTag: 62 },
    kind: 'trigger',
    name: 'Torch Puzzle → Chest',
    effect: 'lighting the right torches reveals a chest',
  },
  {
    id: 'actor-050',
    gameId: { roomTag: 63 },
    kind: 'trigger',
    name: 'Rekillable Boss',
    effect: 'a boss that can be fought again',
  },
  {
    id: 'actor-051',
    gameId: {},
    kind: 'trigger',
    name: 'Door Unlock / Close',
    effect: 'spends a small key to open a door, or slams a shutter behind a live kill-trigger room (WasmSimUnlockDoor/WasmSimCloseDoor)',
  },
  {
    id: 'actor-052',
    gameId: {},
    kind: 'trigger',
    name: 'Kill Drop',
    effect: '"virtually kill" a room\'s meaningful enemy, granting its drop the way a real kill does (WasmSimKillDrop)',
  },
  // kDungTagroutines[0x01-0x13] (dungeon.c:202-221) is one full "clear the room"
  // cycle (NorthWestTrigger, 7 other quadrant gates, QuadrantTrigger, RoomTrigger)
  // and it repeats verbatim at [0x29-0x32] (dungeon.c:243-252). actor-024 only
  // covered roomTag 1 (the first cycle's NW gate); a prior audit found room tags
  // 41, 42, 43 and 50 in real room data with no actor to resolve to. Cross-checked
  // against kDungTagroutines directly: all four dispatch into the same family.
  // Ids appended (267 was the prior max) instead of folded into actor-024,
  // because ActorGameId.roomTag is a single number and cannot represent a set.
  {
    // kDungTagroutines[0x29] = RoomTag_NorthWestTrigger is the same function as
    // actor-024 (dungeon.c:243), reused for a different set of rooms. Inside
    // RoomTag_QuadrantTrigger the raw tag value (41) is >= 0x29, so this instance
    // reveals a chest instead of lifting a trapdoor (dungeon.c:4400-4420).
    id: 'actor-268',
    gameId: { roomTag: 41 },
    kind: 'trigger',
    name: 'Clear Room (NW Quadrant, chest variant)',
    effect: 'kill every enemy in the room\'s NW quadrant → reveals a chest',
  },
  {
    // kDungTagroutines[0x2A] = Dung_TagRoutine_0x2A, gated on the NE quadrant, then
    // calls RoomTag_QuadrantTrigger the same way (dungeon.c:244,365-368).
    id: 'actor-269',
    gameId: { roomTag: 42 },
    kind: 'trigger',
    name: 'Clear Room (NE Quadrant)',
    effect: 'kill every enemy in the room\'s NE quadrant → reveals a chest',
  },
  {
    // kDungTagroutines[0x2B] = Dung_TagRoutine_0x2B, gated on the SW quadrant, then
    // calls RoomTag_QuadrantTrigger the same way (dungeon.c:245,370-373).
    id: 'actor-270',
    gameId: { roomTag: 43 },
    kind: 'trigger',
    name: 'Clear Room (SW Quadrant)',
    effect: 'kill every enemy in the room\'s SW quadrant → reveals a chest',
  },
  {
    // kDungTagroutines[0x32] = RoomTag_RoomTrigger is the same handler as roomTag 10.
    // Since the raw tag (50) isn't literally 10, it takes the chest-reveal branch
    // instead of the trapdoor branch (dungeon.c:252,4432-4440).
    id: 'actor-271',
    gameId: { roomTag: 50 },
    kind: 'trigger',
    name: 'Clear Room (Whole Room)',
    effect: 'kill every enemy in the room → reveals a chest',
  },
];

export { TRIGGERS_ACTORS };
