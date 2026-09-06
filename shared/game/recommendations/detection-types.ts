/* @layer shared-game @kind types */
/**
 * What a detector is allowed to look at. Everything here is plain data: no
 * React, no `window`, no module handles, no wasm calls, so a detector is
 * callable from a test with an object literal. Reading the game is the CALLER's
 * job. The observation types are declared structurally, not imported from the
 * renderer, so its `RealTransition` and `DetectedConnection` pass straight in
 * while `shared/` never reaches up into `@app/*`.
 */
import type { EntityKind, ConnectionRecord, ScreenGameId, ScreenId } from '../data/types';
import type { ScreenMatchResult } from '../logic/queries/detection';
import type { PalaceMismatch } from '../logic/queries/palace-fallback';
import type { ConnectionInfo } from '../navigation/types';
import type {
  ChestObservation, GrantedItemObservation, LiveDoorBoundaryTile, LiveDungeonMapPosition, LiveSpriteObservation,
  LiveWalkBoundary, ObservedCrossing, ObservedTransition, SpriteCombatObservation,
} from './observation-items';
import type { DraftRecommendation, RecommendationOrigin } from './types';

interface ScreenObservations {
  /** How the live room resolved against the dataset; null when nothing matched. */
  match: ScreenMatchResult | null;
  /** The native values for where the player IS, not what the record claims:
   *  the ground truth a screen-identity fix proposes. */
  liveGameId: ScreenGameId | null;
  isIndoors: boolean;
  /** Every real transition observed for this screen. */
  realTransitions: readonly ObservedTransition[];
  /** Whether the native tables for this screen were read. False means "we do
   *  not know": a detector must stay silent, not read an empty table as absence. */
  realAvailable: boolean;
  /** Game-exposed crossings no dataset edge already covers. */
  unmatchedCrossings: readonly ObservedCrossing[];
  /** Live flood crossings for this screen. Evidence of presence only. */
  floodConnections: readonly ConnectionInfo[];
  /** Dataset connections whose `from` is this screen, plus those arriving at it. */
  existingConnections: readonly ConnectionRecord[];
  /** Palace mismatches the detection fallback recorded, newest scan included. */
  palaceMismatches: readonly PalaceMismatch[];
  /**
   * Native entrance-id -> room-index table (`wasmGetEntranceRooms`).
   * `entranceRooms[whichEntrance] === roomIndex` tests "entered DIRECTLY through
   * that entrance": RAM $010E (`whichEntrance`) does NOT update on an
   * indoor-to-indoor transition, so without this table a room walked into from
   * another interior reads as entered through the FIRST room's entrance.
   * Absent means "not read", not "no entrances".
   */
  entranceRooms?: readonly number[];
  /** Live sprite spawns for this screen. Absent means "not read", not "no
   *  spawns": a detector must stay silent, not treat a missing array as an empty room. */
  liveSprites?: readonly LiveSpriteObservation[];
  /** Combat rows for sprite types seen on this screen, keyed by `spriteType`. Absent means "not read". */
  spriteCombat?: Readonly<Record<number, SpriteCombatObservation>>;
  /** Items the game granted this session, from the native receive-count table
   *  or the tracker's inventory read. Absent means "not read". */
  grantedItems?: readonly GrantedItemObservation[];
  /** Chests the loaded room draws, from the room-addressable chest table.
   *  Absent is "not read"; outdoors there is no such table, so it stays absent. */
  chests?: readonly ChestObservation[];
  /** The loaded room's header TAG bytes (`wasmGetRoomTagsFor`): scripted room
   *  effects (kill-to-open-door, switch doors, moving walls). Absent means
   *  "not read"; outdoors there is no room header, so it stays absent. */
  roomTags?: readonly number[];
  /** The current room's position on its palace's dungeon-map grid. Absent means
   *  "not read"; a house, cave or outdoor screen reads as `found: false`. */
  dungeonMapPos?: LiveDungeonMapPosition;
  /** Entrance id -> spawn tile table (`wasmGetEntranceSpawns`): the landing
   *  position for EVERY entrance in the game. Reserved for the connection
   *  strategy's fall-hole/entrance work. Absent means "not read". */
  entranceSpawns?: readonly { x: number; y: number }[];
  /**
   * Whether the player is in the dark world: a native flag (`ui-bridge-parser.ts`),
   * never absent because it is read alongside `isIndoors`. Every `ScreenRecord`
   * needs a `world`, so a strategy proposing a new record has a provable answer
   * instead of guessing 'light'.
   */
  isDarkWorld: boolean;
  /**
   * Inter-room walk-through boundaries for the current room
   * (`wasmGetRoomWalkBoundaries`/`-For`). Enumerable, so an indoor `kind: 'edge'`
   * connection can be judged for removal against it, unlike an outdoor scroll
   * edge the flood alone can never disprove. Absent means "not read"; outdoors
   * there is no such table, so it stays absent.
   */
  walkBoundaries?: readonly LiveWalkBoundary[];
  /** Door tiles for the current room (`wasmGetRoomDoorBoundaryTiles`), the
   *  second half of "this room's exits were enumerated" beside `walkBoundaries`.
   *  Absent means "not read". */
  doorBoundaries?: readonly LiveDoorBoundaryTile[];
}

interface DetectionContext {
  origin: RecommendationOrigin;
  screenId: ScreenId | null;
  observations: ScreenObservations;
}

interface RecommendationDetector {
  /** Stable and content-bearing: part of every id this detector mints. */
  id: string;
  kinds: readonly EntityKind[];
  detect: (context: DetectionContext) => readonly DraftRecommendation[];
}

export type {
  ChestObservation, GrantedItemObservation, LiveDoorBoundaryTile, LiveDungeonMapPosition, LiveSpriteObservation,
  LiveWalkBoundary, ObservedCrossing, ObservedDestKind, ObservedTransition, SpriteCombatObservation,
} from './observation-items';
export type { DetectionContext, RecommendationDetector, ScreenObservations };
