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
 * leaf that never reaches up into `@app/*`. The individual evidence shapes
 * (`LiveSpriteObservation`, `ChestObservation`, ...) live in
 * `observation-items.ts`, re-exported below so nothing importing them here
 * has to change.
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
   * Native entrance-id → room-index table (`wasmGetEntranceRooms`).
   * `entranceRooms[whichEntrance] === roomIndex` is the test for "this room was
   * entered DIRECTLY through that entrance" — RAM $010E (`whichEntrance`) does
   * NOT update on an indoor-to-indoor transition, so without this table a room
   * reached by walking in from another interior would read as if it were still
   * entered through the entrance that led to the FIRST room. Optional for the
   * same reason as `liveSprites`: absent means "not read", not "no entrances".
   */
  entranceRooms?: readonly number[];
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
  /**
   * The loaded room's header TAG bytes (`wasmGetRoomTagsFor`) — the scripted
   * room effects (kill-enemies-to-open-door, switch doors, moving walls, ...).
   * Optional for the same reason as `liveSprites`: absent means "not read",
   * and outdoors there is no room header at all to read, so this stays absent
   * there rather than reading as "no tags".
   */
  roomTags?: readonly number[];
  /**
   * The current room's position on its palace's dungeon-map grid. Optional
   * for the same reason as `liveSprites` — absent means "not read"; once read,
   * a house/cave or an outdoor screen resolves to `found: false`, a genuine
   * answer, not an absence. See `LiveDungeonMapPosition`.
   */
  dungeonMapPos?: LiveDungeonMapPosition;
  /**
   * Entrance id -> spawn tile table (`wasmGetEntranceSpawns`) — the landing
   * position for EVERY entrance in the game, not only this screen's own.
   * Nothing in this phase consumes it: it exists for the connection
   * strategy's later fall-hole/entrance work, which needs to know where a
   * hole or an entrance actually drops the player. Optional for the same
   * reason as `liveSprites`.
   */
  entranceSpawns?: readonly { x: number; y: number }[];
  /**
   * Whether the player is currently in the dark world — a native flag
   * (`ui-bridge-parser.ts`'s `isDarkWorld`), not a guess. Unlike the other
   * fields above this is never absent: it is a plain boolean read unconditionally
   * alongside `isIndoors` (see `use-screen-observations.ts`), and every
   * `ScreenRecord` needs a `world` regardless of indoor/outdoor, so a screen
   * strategy proposing a brand-new record (see `strategies/screen/presence.set.ts`)
   * has a provable answer for it instead of guessing 'light'.
   */
  isDarkWorld: boolean;
  /**
   * Inter-room walk-through boundaries for the current room
   * (`wasmGetRoomWalkBoundaries`/`-For`) — enumerable, so an indoor `kind:
   * 'edge'` connection can finally be judged for removal against it (F3),
   * unlike an outdoor scroll edge, which the flood alone can never disprove.
   * Optional for the same reason as `liveSprites`: absent means "not read",
   * and outdoors there is no such table at all, so it stays absent there.
   */
  walkBoundaries?: readonly LiveWalkBoundary[];
  /**
   * Door tiles for the current room (`wasmGetRoomDoorBoundaryTiles`) — read
   * alongside `walkBoundaries` as the second half of "this room's exits were
   * actually enumerated" (see `LiveDoorBoundaryTile`'s own header for why it
   * carries no destination of its own). Optional for the same reason as
   * `liveSprites`.
   */
  doorBoundaries?: readonly LiveDoorBoundaryTile[];
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
  ChestObservation, GrantedItemObservation, LiveDoorBoundaryTile, LiveDungeonMapPosition, LiveSpriteObservation,
  LiveWalkBoundary, ObservedCrossing, ObservedDestKind, ObservedTransition, SpriteCombatObservation,
} from './observation-items';
export type { DetectionContext, RecommendationDetector, ScreenObservations };
