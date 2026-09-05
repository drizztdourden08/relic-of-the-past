/* @layer shared-game @kind types */
/** Live-evidence shapes carried by `ScreenObservations`; `detection-types.ts` re-exports every name below. */
import type { ItemId, ScreenId } from '../data/types';

/** How a raw destination index should be resolved into a screen id. */
type ObservedDestKind = 'screen' | 'room' | 'entrance';

/**
 * One real in-game transition leaving the current screen, read off a native
 * table. Enumerable, therefore an absence here is provable.
 */
interface ObservedTransition {
  /** Which table it came from: the exit map, the stair table, the flood, etc. */
  source: string;
  kind: ObservedDestKind;
  /** Raw game index: overworld screen index, room index, or entrance id. */
  index: number;
}

/**
 * A crossing the game exposes from the current screen, already resolved against
 * the dataset. `toScreenId` is null when no record covers the destination, which
 * is the one case nothing may be written for.
 */
interface ObservedCrossing {
  type: 'entrance' | 'stair' | 'edge' | 'hole';
  /** The raw game index the detector reported. */
  targetRoomOrScreen: number;
  toScreenId: ScreenId | null;
  /** True for the exit-screen detector, which reuses the `entrance` type. */
  isExit: boolean;
  /** Display text only. Identity lives in `toScreenId`. */
  label: string;
}

/**
 * One live sprite spawn read off a per-room/-screen spawn table
 * (`wasmGetRoomSpriteSpawns` / `wasmGetOverworldSpriteSpawns`). Declared
 * structurally, not imported, so the bridge's `SimSpriteRaw` values pass straight in.
 */
interface LiveSpriteObservation {
  /** Native sprite type byte, which joins to `ActorRecord.gameId.spriteType`. */
  spriteType: number;
  col: number;
  row: number;
  floor: number;
}

/**
 * Native combat facts for one sprite type, read off the resolved combat row
 * (`wasmGetSpriteCombat`). The table is enumerable per type, so a disagreement
 * against a catalogued `ActorRecord.combat` is proven, not inferred.
 */
interface SpriteCombatObservation {
  health: number;
  flags4: number;
  /** 16-entry damage-by-class table, index = ancilla damage class. */
  damageByClass: readonly number[];
}

/**
 * One item the game granted through the native receive path, keyed by raw id.
 * `receiveCount` is the `Link_ReceiveItem` call tally (`wasmGetReceiveCount`):
 * nonzero proves the game granted it at least once. `ownedItemIds` is what the
 * tracker read as held at the same moment, which the vanilla duplicate-swap
 * rule (`resolveDuplicate`) needs. `fromInventoryDelta` is true when the entry
 * came from watching the tracker's inventory change, not a native tally read:
 * a delta only proves an item appeared, so a detector must grade it `likely`, never `certain`.
 */
interface GrantedItemObservation {
  itemId: number;
  receiveCount: number;
  ownedItemIds: readonly ItemId[];
  fromInventoryDelta: boolean;
}

/**
 * One chest the loaded room DRAWS, from `wasmGetRoomChests`; declared
 * structurally so the bridge's `SimChestRaw` rows pass straight in. The table
 * enumerates a room's chests, draw tiles and static contents whether or not the
 * player opened one, so an absence in it is provable and a detector may grade
 * a finding `certain` (a receive-event observation only proves something occurred).
 */
interface ChestObservation {
  /** Draw-order slot, which joins to `CheckGameId.chestIndex` and the open-bit mask. */
  chestIndex: number;
  isBig: boolean;
  /** Static contents in the same raw id space as `ItemGameId.receiveItemId`. */
  itemId: number;
  isOpen: boolean;
  /** False when the draw position could not be decoded; `col`/`row` are then 0xFF. */
  posKnown: boolean;
  col: number;
  row: number;
}

/**
 * The current room's position on its palace's dungeon-map grid, from
 * `wasmGetDungeonMapPosition`. Declared structurally so the bridge's richer
 * `DungeonMapPosition` passes straight through. `found` is the table's OWN
 * answer, not "was this read": the native call reports `found: false` for a
 * house, a cave or outdoors, a resolved negative like `known(undefined)` in
 * `probe-helpers.ts`. "Not read" is `ScreenObservations.dungeonMapPos` being absent.
 */
interface LiveDungeonMapPosition {
  mapRow: number;
  mapCol: number;
  /** Raw floor byte: 0=1F, 1=2F, 0xFF=B1, 0xFE=B2, ... (same encoding as the bridge's `DungeonMapPosition.floorRaw`). */
  floorRaw: number;
  found: boolean;
}

/**
 * One inter-room walk-through boundary from `wasmGetRoomWalkBoundaries` (a
 * palace-toggle wall, e.g. castle-to-sewer). Declared structurally so the
 * bridge's richer `RoomWalkBoundary` passes straight in. `destRoom === 0` means
 * "no boundary on this wall", like every other room-addressable table's "unused slot".
 */
interface LiveWalkBoundary {
  destRoom: number;
  row: number;
  col: number;
}

/**
 * One door tile from `wasmGetRoomDoorBoundaryTiles`, declared structurally.
 * Unlike `LiveWalkBoundary` it carries no destination: it only proves a door
 * EXISTS (and its open state) at a wall, so the indoor-edge probe uses it only
 * as a "this room's exits were read" completeness signal, never for identity.
 */
interface LiveDoorBoundaryTile {
  direction: 'north' | 'south' | 'west' | 'east';
  col: number;
  row: number;
  doorType: number;
  isOpen: boolean;
}

export type {
  ChestObservation, GrantedItemObservation, LiveDoorBoundaryTile, LiveDungeonMapPosition, LiveSpriteObservation,
  LiveWalkBoundary, ObservedCrossing, ObservedDestKind, ObservedTransition, SpriteCombatObservation,
};
