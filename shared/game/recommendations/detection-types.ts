/* @layer shared-game @kind types */
/**
 * What a detector is allowed to look at.
 *
 * Everything here is plain data. No React, no `window`, no live module handles,
 * no wasm calls — a detector must be callable from a test with an object literal,
 * because that is the only way a parity test can prove it agrees with the
 * mechanism it replaced. Reading the game is the CALLER's job; the observations
 * are the already-read result.
 *
 * The observation types are declared structurally rather than imported from the
 * renderer: the renderer's `RealTransition` and `DetectedConnection` satisfy
 * them field-for-field, so its values pass straight in, while `shared/` stays a
 * leaf that never reaches up into `@app/*`.
 */
import type { EntityKind, ConnectionRecord, ItemId, ScreenGameId, ScreenId } from '../data/types';
import type { ScreenMatchResult } from '../logic/queries/detection';
import type { PalaceMismatch } from '../logic/queries/palace-fallback';
import type { ConnectionInfo } from '../navigation/types';
import type { DraftRecommendation, RecommendationOrigin } from './types';

/** How a raw destination index should be resolved into a screen id. */
type ObservedDestKind = 'screen' | 'room' | 'entrance';

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

interface ScreenObservations {
  /** How the live room resolved against the dataset; null when nothing matched. */
  match: ScreenMatchResult | null;
  /**
   * The native values the game reports for where the player IS — not what the
   * record claims. This is the ground truth a screen-identity fix proposes, so
   * without it a wrong `palaceIndex` can be reported but not corrected.
   */
  liveGameId: ScreenGameId | null;
  isIndoors: boolean;
  /** Every real transition observed for this screen. */
  realTransitions: readonly ObservedTransition[];
  /**
   * Whether the native tables for this screen were actually read. False means
   * "we do not know", and a detector must then stay silent rather than read an
   * empty table as proof of absence.
   */
  realAvailable: boolean;
  /** Game-exposed crossings no dataset edge already covers. */
  unmatchedCrossings: readonly ObservedCrossing[];
  /** Live flood crossings for this screen — presence-only evidence. */
  floodConnections: readonly ConnectionInfo[];
  /** Dataset connections whose `from` is this screen, plus those arriving at it. */
  existingConnections: readonly ConnectionRecord[];
  /** Palace mismatches the detection fallback recorded, newest scan included. */
  palaceMismatches: readonly PalaceMismatch[];
  /**
   * Live sprite spawns for this screen. Optional: only the live/simulation
   * context-builder populates it, and its absence means "not read", not "no
   * spawns" — a detector must stay silent rather than treat a missing array
   * as proof of an empty room.
   */
  liveSprites?: readonly LiveSpriteObservation[];
  /**
   * Resolved combat rows for sprite types observed on this screen, keyed by
   * `spriteType`. Optional for the same reason as `liveSprites`.
   */
  spriteCombat?: Readonly<Record<number, SpriteCombatObservation>>;
  /**
   * Items the game granted this session, from the native receive-count table
   * or the tracker's inventory read. Optional for the same reason as
   * `liveSprites`.
   */
  grantedItems?: readonly GrantedItemObservation[];
  /**
   * Chests the loaded room draws, from the room-addressable chest table.
   * Optional for the same reason as `liveSprites` — absent is "not read", and
   * outdoors there is no such table at all, so it stays absent there rather
   * than reading as an empty room.
   */
  chests?: readonly ChestObservation[];
}

interface DetectionContext {
  origin: RecommendationOrigin;
  screenId: ScreenId | null;
  observations: ScreenObservations;
}

interface RecommendationDetector {
  /** Stable, content-bearing — it is part of every id this detector mints. */
  id: string;
  kinds: readonly EntityKind[];
  detect: (context: DetectionContext) => readonly DraftRecommendation[];
}

export type {
  ChestObservation, DetectionContext, GrantedItemObservation, LiveSpriteObservation, ObservedCrossing,
  ObservedDestKind, ObservedTransition, RecommendationDetector, ScreenObservations, SpriteCombatObservation,
};
