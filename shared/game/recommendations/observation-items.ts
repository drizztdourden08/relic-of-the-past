/* @layer shared-game @kind types */
/**
 * The individual live-evidence shapes `ScreenObservations` (`detection-types.ts`)
 * carries one or more of. Split out of that file once it grew past one screenful
 * with Phase 4's `LiveDungeonMapPosition` addition — `detection-types.ts` keeps
 * re-exporting every name below, so nothing importing from it (or the barrel)
 * has to change. One reason this split is safe: none of these types reference
 * `ScreenObservations` itself, only the reverse.
 */
import type { ItemId, ScreenId } from '../data/types';

/**
 * How a raw destination index should be resolved into a screen id. An entrance
 * id is not one of them: it names a room only through the native entrance
 * table, so a producer resolves it there and reports the `room` it found.
 */
type ObservedDestKind = 'screen' | 'room';

/**
 * One real in-game transition leaving the current screen, read off a native
 * table. Enumerable, therefore an absence here is provable.
 */
interface ObservedTransition {
  /** Which table it came from — the exit map, the stair table, the flood, … */
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
  /** Display text only — identity lives in `toScreenId`. */
  label: string;
}

/**
 * One live sprite spawn read off a per-room/-screen spawn table
 * (`wasmGetRoomSpriteSpawns` / `wasmGetOverworldSpriteSpawns`), declared
 * structurally rather than imported so the bridge's `SimSpriteRaw` values pass
 * straight in — same reasoning as `ObservedTransition` above.
 */
interface LiveSpriteObservation {
  /** Native sprite type byte — joins to `ActorRecord.gameId.spriteType`. */
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
 * One item the game actually granted through the native receive path, keyed by
 * its own raw id. `receiveCount` is the diagnostic `Link_ReceiveItem` call
 * tally (`wasmGetReceiveCount`) for this id — enumerable, so a nonzero count is
 * proof the game granted it at least once. `ownedItemIds` is the dataset ids
 * the tracker read as already held at the same moment, which is what the
 * vanilla duplicate-swap rule (`resolveDuplicate`) needs to reason about this
 * id. `fromInventoryDelta` is true when this entry came from watching the
 * tracker's inventory change rather than a direct native tally read: a delta
 * only proves an item appeared, not that the native table backs it, so a
 * detector reading it must grade its finding `likely`, never `certain`.
 */
interface GrantedItemObservation {
  itemId: number;
  receiveCount: number;
  ownedItemIds: readonly ItemId[];
  fromInventoryDelta: boolean;
}

/**
 * One chest the loaded room DRAWS, read off the room-addressable chest query
 * (`wasmGetRoomChests`) and declared structurally so the bridge's `SimChestRaw`
 * rows pass straight in — same reasoning as `ObservedTransition` above.
 *
 * This is the only interactable evidence that needs nothing to have HAPPENED:
 * the table enumerates a room's chests, their draw tiles and their static
 * contents whether or not the player ever opened one. So an absence in it is
 * provable, exactly like the stair/exit/door tables — which is what lets a
 * detector reading it grade a finding `certain` while a receive-event
 * observation, which only ever proves something occurred, cannot.
 */
interface ChestObservation {
  /** Draw-order slot — joins to `CheckGameId.chestIndex` and the open-bit mask. */
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
 * `wasmGetDungeonMapPosition`. Declared structurally rather than imported —
 * same reasoning as `LiveSpriteObservation` above — so the bridge's richer
 * `DungeonMapPosition` (it also carries a floor label and effective
 * bounding-box sizes nothing here needs) passes straight through. `found` is
 * the table's OWN answer, not a stand-in for "was this read": the native call
 * reports `found: false` for a genuine non-dungeon indoor room (a house or a
 * cave never has one) or outdoors, which is a resolved negative exactly like
 * `known(undefined)` in `probe-helpers.ts`. "Not read at all" is instead what
 * `ScreenObservations.dungeonMapPos` being absent communicates.
 */
interface LiveDungeonMapPosition {
  mapRow: number;
  mapCol: number;
  /** Raw floor byte: 0=1F, 1=2F, 0xFF=B1, 0xFE=B2, ... — same encoding as the bridge's `DungeonMapPosition.floorRaw`. */
  floorRaw: number;
  found: boolean;
}

/**
 * One inter-room walk-through boundary from `wasmGetRoomWalkBoundaries` (a
 * palace-toggle wall, e.g. castle-to-sewer) — declared structurally, same
 * reasoning as `LiveSpriteObservation` above, so the bridge's richer
 * `RoomWalkBoundary` passes straight in. `destRoom === 0` means "no boundary
 * on this wall", matching how every other room-addressable table in this
 * codebase spells "unused slot".
 */
interface LiveWalkBoundary {
  destRoom: number;
  row: number;
  col: number;
}

/**
 * One door tile from `wasmGetRoomDoorBoundaryTiles` — declared structurally,
 * same reasoning as `LiveSpriteObservation` above. Unlike `LiveWalkBoundary`
 * this carries no destination: it only proves a door EXISTS (and its open
 * state) at a wall, so the connection strategy's indoor-edge probe
 * (phase 4, part 2) consults it only as a "this room's exits were actually
 * read" completeness signal alongside `LiveWalkBoundary`, never for identity.
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
