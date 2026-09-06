/* @layer shared-game @kind data */
/** Trigger actors, part 2 of 2 (size split); see triggers-1.ts for context. */
import type { ActorRecord } from '@shared/game/data/types';

const TRIGGER_ACTORS_2: ActorRecord[] = [
  {
    id: 'actor-040',
    gameId: { roomTag: 36 },
    kind: 'trigger',
    randomizerName: 'Holes (second set)',
    effect: 'a second, independent set of floor holes',
  },
  {
    id: 'actor-041',
    gameId: { roomTag: 37 },
    kind: 'trigger',
    randomizerName: 'Heart For Prize',
    effect: 'the room prize is a heart container/piece',
  },
  {
    id: 'actor-042',
    gameId: { roomTag: 38 },
    kind: 'trigger',
    randomizerName: 'Kill Room → Block',
    effect: 'clearing the room raises a block',
  },
  {
    id: 'actor-043',
    gameId: { roomTag: 39 },
    kind: 'trigger',
    randomizerName: 'Trigger → Chest',
    effect: 'a trigger elsewhere reveals a chest',
  },
  {
    id: 'actor-044',
    gameId: { roomTag: 40 },
    kind: 'trigger',
    randomizerName: 'Pull Switch → Exploding Wall',
    effect: 'a pull switch detonates a wall',
  },
  {
    id: 'actor-045',
    gameId: { roomTag: 51 },
    kind: 'trigger',
    randomizerName: 'Torch Puzzle → Door',
    effect: 'lighting the right torches opens a door',
  },
  {
    id: 'actor-046',
    gameId: { roomTag: 56 },
    kind: 'trigger',
    randomizerName: 'Agahnim',
    effect: 'the Agahnim boss encounter',
  },
  {
    id: 'actor-047',
    gameId: { roomTag: 60 },
    kind: 'trigger',
    randomizerName: 'Push Block → Chest',
    effect: 'pushing a block reveals a chest',
  },
  {
    id: 'actor-048',
    gameId: { roomTag: 61 },
    kind: 'trigger',
    randomizerName: 'Ganon Door',
    effect: 'gates the door to Ganon',
  },
  {
    id: 'actor-049',
    gameId: { roomTag: 62 },
    kind: 'trigger',
    randomizerName: 'Torch Puzzle → Chest',
    effect: 'lighting the right torches reveals a chest',
  },
  {
    id: 'actor-050',
    gameId: { roomTag: 63 },
    kind: 'trigger',
    randomizerName: 'Rekillable Boss',
    effect: 'a boss that can be fought again',
  },
  {
    id: 'actor-051',
    gameId: {},
    kind: 'trigger',
    randomizerName: 'Door Unlock / Close',
    effect: 'spends a small key to open a door, or slams a shutter behind a live kill-trigger room (WasmSimUnlockDoor/WasmSimCloseDoor)',
  },
  {
    id: 'actor-052',
    gameId: {},
    kind: 'trigger',
    randomizerName: 'Kill Drop',
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
    randomizerName: 'Clear Room (NW Quadrant, chest variant)',
    effect: 'kill every enemy in the room\'s NW quadrant → reveals a chest',
  },
  {
    // kDungTagroutines[0x2A] = Dung_TagRoutine_0x2A, gated on the NE quadrant, then
    // calls RoomTag_QuadrantTrigger the same way (dungeon.c:244,365-368).
    id: 'actor-269',
    gameId: { roomTag: 42 },
    kind: 'trigger',
    randomizerName: 'Clear Room (NE Quadrant)',
    effect: 'kill every enemy in the room\'s NE quadrant → reveals a chest',
  },
  {
    // kDungTagroutines[0x2B] = Dung_TagRoutine_0x2B, gated on the SW quadrant, then
    // calls RoomTag_QuadrantTrigger the same way (dungeon.c:245,370-373).
    id: 'actor-270',
    gameId: { roomTag: 43 },
    kind: 'trigger',
    randomizerName: 'Clear Room (SW Quadrant)',
    effect: 'kill every enemy in the room\'s SW quadrant → reveals a chest',
  },
  {
    // kDungTagroutines[0x32] = RoomTag_RoomTrigger is the same handler as roomTag 10.
    // Since the raw tag (50) isn't literally 10, it takes the chest-reveal branch
    // instead of the trapdoor branch (dungeon.c:252,4432-4440).
    id: 'actor-271',
    gameId: { roomTag: 50 },
    kind: 'trigger',
    randomizerName: 'Clear Room (Whole Room)',
    effect: 'kill every enemy in the room → reveals a chest',
  },
];

export { TRIGGER_ACTORS_2 };
